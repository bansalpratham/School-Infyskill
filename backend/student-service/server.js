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

const Student = require('./src/models/student.model');

const PORT = process.env.PORT || 5002;

async function start() {
  await connectDB();

  if (process.env.NODE_ENV === 'development') {
    const DEV_SCHOOL_ID = 'local-dev';
    const DEV_CLASS_NAME = '9-A';

    const ensureStudent = async ({ firstName, lastName, email }) => {
      const existing = await Student.findOne({ email: String(email).trim().toLowerCase() }).lean();
      if (existing) {
        if (existing.className !== DEV_CLASS_NAME || existing.schoolId !== DEV_SCHOOL_ID) {
          await Student.updateOne(
            { _id: existing._id },
            { $set: { className: DEV_CLASS_NAME, schoolId: DEV_SCHOOL_ID, status: 'ACTIVE' } }
          );
        }
        return;
      }
      await Student.create({
        schoolId: DEV_SCHOOL_ID,
        firstName,
        lastName,
        email,
        className: DEV_CLASS_NAME,
        status: 'ACTIVE'
      });
    };

    await ensureStudent({ firstName: 'Rahul', lastName: 'Sharma', email: 'rahul@student.com' });
    await ensureStudent({ firstName: 'Priya', lastName: 'Singh', email: 'priya@student.com' });
    await ensureStudent({ firstName: 'Arjun', lastName: 'Verma', email: 'arjun@student.com' });
    // eslint-disable-next-line no-console
    console.log('[dev-seed] ensured 3 students in class 9-A');
  }

  const server = app.listen(PORT, () => {
    console.log(`student-service listening on port ${PORT}`);
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
  console.error('Failed to start student-service:', err);
  process.exit(1);
});
