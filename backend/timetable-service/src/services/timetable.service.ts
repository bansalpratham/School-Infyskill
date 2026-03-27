import mongoose from 'mongoose';

import type { TimetableDay } from '../models/timetable.model';
import { Timetable } from '../models/timetable.model';
import { httpError } from '../utils/httpError';

function ensureObjectId(id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw httpError(400, 'Invalid timetable id');
  }
}

function ensureValidTimeRange(startTime?: string, endTime?: string) {
  if (!startTime || !endTime) return;
  if (String(startTime) >= String(endTime)) {
    throw httpError(400, 'startTime must be earlier than endTime');
  }
}

export type CreateTimetableInput = {
  schoolId: string;
  classId: string;
  day: TimetableDay;
  period: number;
  subject: string;
  teacherId: string;
  room?: string;
  startTime?: string;
  endTime?: string;
};

export type UpdateTimetableInput = Partial<Omit<CreateTimetableInput, 'schoolId'>>;

export async function createTimetableEntry(payload: CreateTimetableInput) {
  ensureValidTimeRange(payload.startTime, payload.endTime);
  return Timetable.create(payload);
}

export async function listTimetableEntries(schoolId: string) {
  return Timetable.find({ schoolId }).sort({ classId: 1, day: 1, period: 1 }).lean();
}

export async function listTimetableByClassId(schoolId: string, classId: string) {
  const cid = String(classId || '').trim();
  if (!cid) throw httpError(400, 'classId is required');

  return Timetable.find({ schoolId, classId: cid }).sort({ day: 1, period: 1 }).lean();
}

export async function updateTimetableEntry(schoolId: string, id: string, payload: UpdateTimetableInput) {
  ensureObjectId(id);

  if (payload.startTime || payload.endTime) {
    const existing = await Timetable.findOne({ _id: id, schoolId }).lean();
    if (!existing) throw httpError(404, 'Timetable entry not found');

    const start = payload.startTime ?? existing.startTime;
    const end = payload.endTime ?? existing.endTime;
    ensureValidTimeRange(start, end);
  }

  const updated = await Timetable.findOneAndUpdate(
    { _id: id, schoolId },
    { $set: payload },
    { new: true, runValidators: true }
  ).lean();

  if (!updated) throw httpError(404, 'Timetable entry not found');
  return updated;
}

export async function deleteTimetableEntry(schoolId: string, id: string) {
  ensureObjectId(id);

  const deleted = await Timetable.findOneAndDelete({ _id: id, schoolId }).lean();
  if (!deleted) throw httpError(404, 'Timetable entry not found');
  return deleted;
}

export type GeneratedSlotInput = {
  day: TimetableDay;
  period: number;
  subject: string;
  teacherId: string;
  room?: string;
  startTime?: string;
  endTime?: string;
};

export async function replaceClassTimetable(params: {
  schoolId: string;
  classId: string;
  days: TimetableDay[];
  periodsPerDay: number;
  slots: GeneratedSlotInput[];
}) {
  const { schoolId, classId, days, periodsPerDay, slots } = params;

  if (!Array.isArray(days) || days.length === 0) throw httpError(400, 'days is required');
  if (!Number.isFinite(periodsPerDay) || periodsPerDay < 1 || periodsPerDay > 20) {
    throw httpError(400, 'periodsPerDay is invalid');
  }

  await Timetable.deleteMany({
    schoolId,
    classId,
    day: { $in: days },
    period: { $gte: 1, $lte: periodsPerDay }
  });

  if (slots.length === 0) {
    return [];
  }

  await Timetable.insertMany(
    slots.map((s) => ({
      schoolId,
      classId,
      day: s.day,
      period: s.period,
      subject: s.subject,
      teacherId: s.teacherId,
      room: s.room,
      startTime: s.startTime,
      endTime: s.endTime
    })),
    { ordered: false }
  );

  return Timetable.find({
    schoolId,
    classId,
    day: { $in: days },
    period: { $gte: 1, $lte: periodsPerDay }
  })
    .sort({ day: 1, period: 1 })
    .lean();
}
