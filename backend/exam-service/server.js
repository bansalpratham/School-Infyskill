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

const PORT = process.env.PORT || 4006;

async function start() {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`exam-service listening on port ${PORT}`);
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
  console.error('Failed to start exam-service:', err);
  process.exit(1);
});
