const path = require('path');

const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({
  path: path.resolve(__dirname, '../../.env')
});
dotenv.config({
  path: path.resolve(__dirname, '../.env')
});
dotenv.config();

const app = require('./src/app');

const ClassModel = require('./src/models/class.model');

const PORT = Number(process.env.PORT || 5007);

async function start() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI is required');

    await mongoose.connect(uri);
    // eslint-disable-next-line no-console
    console.log('MongoDB connected');

    if (process.env.NODE_ENV === 'development') {
      const DEV_SCHOOL_ID = 'local-dev';
      const DEV_TEACHER_ID = '64b64c1f8f3e2a0000000001';

      const exists = await ClassModel.findOne({ schoolId: DEV_SCHOOL_ID, name: '9', section: 'A' }).lean();
      if (!exists) {
        await ClassModel.create({
          schoolId: DEV_SCHOOL_ID,
          name: '9',
          section: 'A',
          classTeacherId: DEV_TEACHER_ID,
          subjects: ['Mathematics']
        });
        // eslint-disable-next-line no-console
        console.log('[dev-seed] created class 9-A assigned to dev teacher');
      } else if (String(exists.classTeacherId || '') !== DEV_TEACHER_ID) {
        await ClassModel.updateOne(
          { _id: exists._id },
          { $set: { classTeacherId: DEV_TEACHER_ID } }
        );
        // eslint-disable-next-line no-console
        console.log('[dev-seed] updated class 9-A classTeacherId to dev teacher');
      }
    }

    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`class-service listening on port ${PORT}`);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  }
}

start();
