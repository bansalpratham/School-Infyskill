const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = require('./src/app');

const PORT = Number(process.env.PORT || 5008);

async function start() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI is required');

    await mongoose.connect(uri);
    // eslint-disable-next-line no-console
    console.log('MongoDB connected');

    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`subject-service listening on port ${PORT}`);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  }
}

start();
