require('dotenv').config();

const app = require('./src/app');

const PORT = process.env.PORT || 4010;

const server = app.listen(PORT, () => {
  console.log(`dashboard-service listening on port ${PORT}`);
});

const shutdown = async (signal) => {
  console.log(`${signal} received. Shutting down...`);
  server.close(() => {
    process.exit(0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
