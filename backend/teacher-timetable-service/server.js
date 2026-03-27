const path = require('path');

const dotenv = require('dotenv');

dotenv.config({
  path: path.resolve(__dirname, '../../.env')
});
dotenv.config({
  path: path.resolve(__dirname, '../.env')
});
dotenv.config();

const app = require('./src/app');
const { connectDB } = require('./src/config/db');

const Timetable = require('./src/models/timetable.model');

const PORT = process.env.PORT || 4012;

async function start() {
  await connectDB();

  if (process.env.NODE_ENV === 'development') {
    const DEV_TEACHER_ID = '64b64c1f8f3e2a0000000001';
    const DEV_CLASS_NAME = '9-A';

    const existing = await Timetable.findOne({
      teacherId: DEV_TEACHER_ID,
      className: DEV_CLASS_NAME,
      day: 'MONDAY',
      startTime: '09:00',
      endTime: '10:00',
      subject: 'Mathematics'
    }).lean();

    if (!existing) {
      await Timetable.create({
        teacherId: DEV_TEACHER_ID,
        className: DEV_CLASS_NAME,
        subject: 'Mathematics',
        day: 'MONDAY',
        startTime: '09:00',
        endTime: '10:00'
      });
      // eslint-disable-next-line no-console
      console.log('[dev-seed] created teacher timetable entry for dev teacher');
    }
  }

  const server = app.listen(PORT, () => {
    console.log(`teacher-timetable-service listening on port ${PORT}`);
  });

  const shutdown = async (signal) => {
    console.log(`${signal} received. Shutting down...`);
    server.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start().catch((err) => {
  console.error('Failed to start teacher-timetable-service:', err);
  process.exit(1);
});
