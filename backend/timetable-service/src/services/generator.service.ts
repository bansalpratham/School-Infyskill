import type { TimetableDay } from "../models/timetable.model";
import { Timetable } from "../models/timetable.model";
import { httpError } from "../utils/httpError";

export type GenerateSubjectInput = {
  name: string;
  teacherId: string;
  weeklyHours: number;
  room?: string;
};

export type GenerateRequestInput = {
  schoolId: string;
  classId: string;
  days: TimetableDay[];
  periodsPerDay: number;
  subjects: GenerateSubjectInput[];
};

export type GeneratedSlot = {
  day: TimetableDay;
  period: number;
  subject: string;
  teacherId: string;
  room?: string;
};

type BusyMap = Map<string, Set<string>>; // key: `${day}::${period}` => set of ids

function key(day: TimetableDay, period: number) {
  return `${day}::${period}`;
}

function ensureFiniteInt(n: unknown, field: string, min: number, max: number) {
  const v = Number(n);
  if (!Number.isFinite(v) || !Number.isInteger(v) || v < min || v > max) {
    throw httpError(400, `${field} is invalid`);
  }
  return v;
}

function buildBusyMap(items: { day: TimetableDay; period: number; teacherId?: string; room?: string }[],
  pick: (i: any) => string | undefined) {
  const m: BusyMap = new Map();
  for (const it of items) {
    const id = pick(it);
    if (!id) continue;
    const k = key(it.day, it.period);
    const set = m.get(k) || new Set<string>();
    set.add(String(id));
    m.set(k, set);
  }
  return m;
}

function isBusy(m: BusyMap, day: TimetableDay, period: number, id: string | undefined) {
  if (!id) return false;
  const set = m.get(key(day, period));
  return set ? set.has(String(id)) : false;
}

function normalizeSubjects(subjects: GenerateSubjectInput[]) {
  const cleaned = subjects
    .map((s) => ({
      name: String(s?.name || "").trim(),
      teacherId: String(s?.teacherId || "").trim(),
      weeklyHours: Number(s?.weeklyHours),
      room: String(s?.room || "").trim() || undefined,
    }))
    .filter((s) => s.name && s.teacherId);

  if (cleaned.length === 0) throw httpError(400, "subjects is required");

  for (const s of cleaned) {
    if (!Number.isFinite(s.weeklyHours) || s.weeklyHours <= 0 || s.weeklyHours > 50) {
      throw httpError(400, "weeklyHours is invalid");
    }
  }

  return cleaned;
}

function chooseSubject(params: {
  day: TimetableDay;
  period: number;
  subjects: { name: string; teacherId: string; weeklyHours: number; room?: string }[];
  remaining: Map<string, number>;
  dayCounts: Map<string, Map<TimetableDay, number>>;
  lastSubjectByDay: Map<TimetableDay, { name: string; streak: number } | null>;
  teacherBusy: BusyMap;
  roomBusy: BusyMap;
}) {
  const {
    day,
    period,
    subjects,
    remaining,
    dayCounts,
    lastSubjectByDay,
    teacherBusy,
    roomBusy,
  } = params;

  const last = lastSubjectByDay.get(day) || null;

  const candidates = subjects
    .filter((s) => (remaining.get(s.name) || 0) > 0)
    .filter((s) => !isBusy(teacherBusy, day, period, s.teacherId))
    .filter((s) => !isBusy(roomBusy, day, period, s.room))
    .filter((s) => {
      if (!last) return true;
      if (last.name !== s.name) return true;
      return last.streak < 2;
    })
    .map((s) => {
      const rem = remaining.get(s.name) || 0;
      const dc = dayCounts.get(s.name) || new Map<TimetableDay, number>();
      const onDay = dc.get(day) || 0;

      // score: prioritize remaining hours, but spread across week by penalizing same-day repeats
      // also slightly prefer earlier periods to diversify.
      const score = rem * 100 - onDay * 15 - (last?.name === s.name ? 20 : 0) - period * 0.2;

      return { s, score };
    })
    .sort((a, b) => b.score - a.score);

  return candidates.length ? candidates[0].s : null;
}

export async function generateTimetable(input: GenerateRequestInput): Promise<GeneratedSlot[]> {
  const periodsPerDay = ensureFiniteInt(input.periodsPerDay, "periodsPerDay", 1, 20);
  const days = Array.isArray(input.days) && input.days.length ? input.days : [];
  if (!days.length) throw httpError(400, "days is required");

  const subjects = normalizeSubjects(input.subjects || []);

  const totalSlots = days.length * periodsPerDay;
  const totalHours = subjects.reduce((a, s) => a + s.weeklyHours, 0);
  if (totalHours > totalSlots) {
    throw httpError(400, `Total weeklyHours (${totalHours}) exceeds available slots (${totalSlots})`);
  }

  // Load existing timetable entries (other classes) to avoid teacher/room conflicts.
  const existing = await Timetable.find({
    schoolId: input.schoolId,
    classId: { $ne: input.classId },
    day: { $in: days },
    period: { $gte: 1, $lte: periodsPerDay },
  })
    .select({ day: 1, period: 1, teacherId: 1, room: 1 })
    .lean();

  const teacherBusy = buildBusyMap(existing as any[], (i) => i.teacherId);
  const roomBusy = buildBusyMap(existing as any[], (i) => i.room);

  const remaining = new Map<string, number>();
  const dayCounts = new Map<string, Map<TimetableDay, number>>();
  for (const s of subjects) {
    remaining.set(s.name, s.weeklyHours);
    dayCounts.set(s.name, new Map());
  }

  const lastSubjectByDay = new Map<TimetableDay, { name: string; streak: number } | null>();
  for (const d of days) lastSubjectByDay.set(d, null);

  const output: GeneratedSlot[] = [];

  // Greedy fill with a small retry loop: if stuck, relax consecutive rule by clearing last streak.
  for (const day of days) {
    lastSubjectByDay.set(day, null);

    for (let period = 1; period <= periodsPerDay; period++) {
      let picked = chooseSubject({
        day,
        period,
        subjects,
        remaining,
        dayCounts,
        lastSubjectByDay,
        teacherBusy,
        roomBusy,
      });

      if (!picked) {
        // If no candidates, try relaxing streak constraint for this day.
        lastSubjectByDay.set(day, null);
        picked = chooseSubject({
          day,
          period,
          subjects,
          remaining,
          dayCounts,
          lastSubjectByDay,
          teacherBusy,
          roomBusy,
        });
      }

      if (!picked) {
        // Fill empty slot as free period.
        continue;
      }

      remaining.set(picked.name, (remaining.get(picked.name) || 0) - 1);
      const dc = dayCounts.get(picked.name) || new Map<TimetableDay, number>();
      dc.set(day, (dc.get(day) || 0) + 1);
      dayCounts.set(picked.name, dc);

      const last = lastSubjectByDay.get(day);
      if (last && last.name === picked.name) {
        lastSubjectByDay.set(day, { name: picked.name, streak: last.streak + 1 });
      } else {
        lastSubjectByDay.set(day, { name: picked.name, streak: 1 });
      }

      output.push({
        day,
        period,
        subject: picked.name,
        teacherId: picked.teacherId,
        room: picked.room,
      });
    }
  }

  // Validate that all weeklyHours were scheduled.
  const remainingTotal = Array.from(remaining.values()).reduce((a, b) => a + Math.max(0, b), 0);
  if (remainingTotal !== 0) {
    throw httpError(409, "Unable to generate a complete timetable with the given constraints");
  }

  return output;
}
