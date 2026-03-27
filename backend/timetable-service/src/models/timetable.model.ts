import mongoose, { Schema } from 'mongoose';

export type TimetableDay = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY';

export type TimetableDoc = {
  schoolId: string;
  classId: string;
  day: TimetableDay;
  period: number;
  subject: string;
  teacherId: string;
  room?: string;
  startTime?: string;
  endTime?: string;
  createdAt: Date;
  updatedAt: Date;
};

const timetableSchema = new Schema<TimetableDoc>(
  {
    schoolId: { type: String, required: true, trim: true, index: true },
    classId: { type: String, required: true, trim: true, index: true },
    day: {
      type: String,
      enum: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'],
      required: true,
      index: true
    },
    period: { type: Number, required: true, min: 1, max: 20, index: true },
    subject: { type: String, required: true, trim: true, maxlength: 120 },
    teacherId: { type: String, required: true, trim: true, index: true },
    room: { type: String, trim: true, maxlength: 50 },
    startTime: { type: String, trim: true, maxlength: 10 },
    endTime: { type: String, trim: true, maxlength: 10 }
  },
  { timestamps: true }
);

timetableSchema.index({ schoolId: 1, classId: 1, day: 1, period: 1 }, { unique: true });
timetableSchema.index({ schoolId: 1, teacherId: 1, day: 1, startTime: 1 });

export const Timetable = mongoose.model<TimetableDoc>('Timetable', timetableSchema);
