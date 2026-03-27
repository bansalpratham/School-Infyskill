require('dotenv').config();

const mongoose = require('mongoose');
const app = require('./src/app.js');

const PORT = process.env.PORT || 4014;

async function start() {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!uri) {
      console.error('MongoDB connection failed ❌');
      console.error('Missing env: set MONGODB_URI (or legacy MONGO_URI)');
      process.exit(1);
    }

    await mongoose.connect(uri);
    console.log('Settings DB Connected');

    const server = app.listen(PORT, () => {
      console.log(`settings-service listening on port ${PORT}`);
    });

    const shutdown = async (signal) => {
      console.log(`${signal} received. Shutting down...`);
      server.close(() => {
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (err) {
    console.error('Failed to start settings-service:', err);
    process.exit(1);
  }
}

start();