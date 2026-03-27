import type { Request, Response, NextFunction } from 'express';
import { apiResponse } from '@school-hub/shared-utils';
import type { AuthedRequest } from '@school-hub/shared-middleware';

import {
  createTimetableEntry,
  deleteTimetableEntry,
  listTimetableByClassId,
  listTimetableEntries,
  replaceClassTimetable,
  updateTimetableEntry
} from '../services/timetable.service';
import { generateTimetable } from '../services/generator.service';
import { httpError } from '../utils/httpError';

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
const allowedDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'] as const;

type AllowedDay = (typeof allowedDays)[number];

function ensureString(val: unknown, field: string) {
  const v = String(val || '').trim();
  if (!v) throw httpError(400, `${field} is required`);
  return v;
}

function ensureDay(val: unknown): AllowedDay {
  const v = String(val || '').trim().toUpperCase();
  if (!allowedDays.includes(v as AllowedDay)) {
    throw httpError(400, 'day is invalid');
  }
  return v as AllowedDay;
}

function ensurePeriod(val: unknown) {
  const n = Number(val);
  if (!Number.isFinite(n) || n < 1 || n > 20) throw httpError(400, 'period is invalid');
  return n;
}

function ensureTime(val: unknown, field: string) {
  const v = String(val || '').trim();
  if (!v) return undefined;
  if (!timeRegex.test(v)) throw httpError(400, `${field} is invalid`);
  return v;
}

function normalizeDayInput(day: unknown): AllowedDay {
  const raw = String(day || '').trim();
  if (!raw) throw httpError(400, 'days is invalid');

  const upper = raw.toUpperCase();
  if (allowedDays.includes(upper as AllowedDay)) return upper as AllowedDay;

  // Accept common title-case inputs like "Monday"
  const map: Record<string, AllowedDay> = {
    MONDAY: 'MONDAY',
    TUESDAY: 'TUESDAY',
    WEDNESDAY: 'WEDNESDAY',
    THURSDAY: 'THURSDAY',
    FRIDAY: 'FRIDAY',
    SATURDAY: 'SATURDAY'
  };

  const normalized = map[upper];
  if (!normalized) throw httpError(400, 'days is invalid');
  return normalized;
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const r = req as AuthedRequest;
    const schoolId = String(r.schoolId || '').trim();
    if (!schoolId) throw httpError(400, 'schoolId is required');

    const classId = ensureString((req.body as any)?.classId, 'classId');
    const day = ensureDay((req.body as any)?.day);
    const period = ensurePeriod((req.body as any)?.period);
    const subject = ensureString((req.body as any)?.subject, 'subject');
    const teacherId = ensureString((req.body as any)?.teacherId, 'teacherId');
    const room = String((req.body as any)?.room || '').trim() || undefined;
    const startTime = ensureTime((req.body as any)?.startTime, 'startTime');
    const endTime = ensureTime((req.body as any)?.endTime, 'endTime');

    const created = await createTimetableEntry({
      schoolId,
      classId,
      day,
      period,
      subject,
      teacherId,
      room,
      startTime,
      endTime
    });

    return res.status(201).json(apiResponse(true, 'Timetable entry created', created));
  } catch (err) {
    return next(err);
  }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const r = req as AuthedRequest;
    const schoolId = String(r.schoolId || '').trim();
    if (!schoolId) throw httpError(400, 'schoolId is required');

    const items = await listTimetableEntries(schoolId);
    return res.status(200).json(apiResponse(true, 'Timetable entries fetched', items));
  } catch (err) {
    return next(err);
  }
}

export async function getByClass(req: Request, res: Response, next: NextFunction) {
  try {
    const r = req as AuthedRequest;
    const schoolId = String(r.schoolId || '').trim();
    if (!schoolId) throw httpError(400, 'schoolId is required');

    const items = await listTimetableByClassId(schoolId, String(req.params.classId));
    return res.status(200).json(apiResponse(true, 'Timetable fetched', items));
  } catch (err) {
    return next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const r = req as AuthedRequest;
    const schoolId = String(r.schoolId || '').trim();
    if (!schoolId) throw httpError(400, 'schoolId is required');

    const patch: any = {};
    if ((req.body as any)?.classId !== undefined) patch.classId = String((req.body as any).classId).trim();
    if ((req.body as any)?.day !== undefined) patch.day = ensureDay((req.body as any).day);
    if ((req.body as any)?.period !== undefined) patch.period = ensurePeriod((req.body as any).period);
    if ((req.body as any)?.subject !== undefined) patch.subject = String((req.body as any).subject).trim();
    if ((req.body as any)?.teacherId !== undefined) patch.teacherId = String((req.body as any).teacherId).trim();
    if ((req.body as any)?.room !== undefined) patch.room = String((req.body as any).room).trim() || undefined;
    if ((req.body as any)?.startTime !== undefined) patch.startTime = ensureTime((req.body as any).startTime, 'startTime');
    if ((req.body as any)?.endTime !== undefined) patch.endTime = ensureTime((req.body as any).endTime, 'endTime');

    if (Object.keys(patch).length === 0) throw httpError(400, 'No fields to update');

    const updated = await updateTimetableEntry(schoolId, String(req.params.id), patch);
    return res.status(200).json(apiResponse(true, 'Timetable entry updated', updated));
  } catch (err) {
    return next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const r = req as AuthedRequest;
    const schoolId = String(r.schoolId || '').trim();
    if (!schoolId) throw httpError(400, 'schoolId is required');

    const deleted = await deleteTimetableEntry(schoolId, String(req.params.id));
    return res.status(200).json(apiResponse(true, 'Timetable entry deleted', deleted));
  } catch (err) {
    return next(err);
  }
}

export async function generate(req: Request, res: Response, next: NextFunction) {
  try {
    const r = req as AuthedRequest;
    const schoolId = String(r.schoolId || '').trim();
    if (!schoolId) throw httpError(400, 'schoolId is required');

    const classId = ensureString((req.body as any)?.classId, 'classId');
    const periodsPerDay = ensurePeriod((req.body as any)?.periodsPerDay);

    const rawDays = (req.body as any)?.days;
    if (!Array.isArray(rawDays) || rawDays.length === 0) throw httpError(400, 'days is required');
    const days = rawDays.map((d: any) => normalizeDayInput(d));

    const rawSubjects = (req.body as any)?.subjects;
    if (!Array.isArray(rawSubjects) || rawSubjects.length === 0) throw httpError(400, 'subjects is required');

    const subjects = rawSubjects.map((s: any) => {
      const name = ensureString(s?.name, 'subjects.name');
      const teacherId = ensureString(s?.teacherId, 'subjects.teacherId');
      const weeklyHours = Number(s?.weeklyHours);
      if (!Number.isFinite(weeklyHours) || weeklyHours <= 0 || weeklyHours > 50) {
        throw httpError(400, 'subjects.weeklyHours is invalid');
      }
      const room = String(s?.room || '').trim() || undefined;
      return { name, teacherId, weeklyHours, room };
    });

    const slots = await generateTimetable({
      schoolId,
      classId,
      days,
      periodsPerDay,
      subjects
    });

    const saved = await replaceClassTimetable({
      schoolId,
      classId,
      days,
      periodsPerDay,
      slots: slots.map((s) => ({
        day: s.day,
        period: s.period,
        subject: s.subject,
        teacherId: s.teacherId,
        room: s.room
      }))
    });

    return res.status(200).json(apiResponse(true, 'Timetable generated', saved));
  } catch (err) {
    return next(err);
  }
}
