import path from 'path';

import dotenv from 'dotenv';

import app from './app';
import { connectDB } from './config/db';

dotenv.config({
  path: path.resolve(__dirname, '../../.env')
});
dotenv.config({
  path: path.resolve(__dirname, '../.env')
});
dotenv.config();

const PORT = Number(process.env.PORT || 5010);

async function start() {
  await connectDB();

  const server = app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`timetable-service listening on port ${PORT}`);
  });

  const shutdown = async (signal: string) => {
    // eslint-disable-next-line no-console
    console.log(`${signal} received. Shutting down...`);
    server.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start timetable-service:', err);
  process.exit(1);
});
