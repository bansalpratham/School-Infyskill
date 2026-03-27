const path = require('path');

const dotenv = require('dotenv');

dotenv.config({
  path: path.resolve(__dirname, '../../.env')
});
dotenv.config({
  path: path.resolve(__dirname, '../.env')
});
dotenv.config();

const connectDB = require("./src/config/db");
const app = require("./src/app");

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/user.model');

const PORT = process.env.PORT || 5001;

const DEV_SCHOOL_ID = 'local-dev';
const DEV_TEACHER_ID = '64b64c1f8f3e2a0000000001';
const DEV_STUDENT_IDS = [
  '64b64c1f8f3e2a0000000011',
  '64b64c1f8f3e2a0000000012',
  '64b64c1f8f3e2a0000000013'
];

async function seedDevUsers() {
  if (process.env.NODE_ENV !== 'development') return;

  const teacherEmail = 'teacher@test.com';
  const studentEmails = ['rahul@student.com', 'priya@student.com', 'arjun@student.com'];
  const password = 'password123';
  const hashedPassword = await bcrypt.hash(password, 10);

  const ensureUser = async ({ _id, name, email, role }) => {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const desiredId = new mongoose.Types.ObjectId(_id);

    const existing = await User.findOne({ email: normalizedEmail }).lean();
    if (existing) {
      const existingId = String(existing._id || '').trim();
      const desiredIdStr = String(desiredId).trim();

      if (existingId !== desiredIdStr) {
        await User.deleteOne({ _id: existing._id });
      } else {
        await User.updateOne(
          { _id: existing._id },
          {
            $set: {
              name,
              role,
              password: hashedPassword,
              allowedSchoolIds: [DEV_SCHOOL_ID]
            }
          }
        );
        return existing;
      }
    }

    const created = await User.create({
      _id: desiredId,
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role,
      allowedSchoolIds: [DEV_SCHOOL_ID]
    });
    return created.toObject();
  };

  await ensureUser({
    _id: DEV_TEACHER_ID,
    name: 'Aman Kumardev',
    email: teacherEmail,
    role: 'teacher'
  });

  await ensureUser({
    _id: DEV_STUDENT_IDS[0],
    name: 'Rahul Sharma',
    email: studentEmails[0],
    role: 'student'
  });
  await ensureUser({
    _id: DEV_STUDENT_IDS[1],
    name: 'Priya Singh',
    email: studentEmails[1],
    role: 'student'
  });
  await ensureUser({
    _id: DEV_STUDENT_IDS[2],
    name: 'Arjun Verma',
    email: studentEmails[2],
    role: 'student'
  });

  // eslint-disable-next-line no-console
  console.log('[dev-seed] ensured auth users: 1 teacher, 3 students');
}

async function start() {
  await connectDB();
  await seedDevUsers();

  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Auth Service running on port ${PORT} 🚀`);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start auth-service:', err);
  process.exit(1);
});
