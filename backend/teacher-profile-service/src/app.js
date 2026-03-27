const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const teacherProfileRoutes = require('./routes/teacherProfile.routes');
const { errorMiddleware } = require('./middlewares/error.middleware');
const { apiResponse } = require('./utils/apiResponse');

const app = express();

app.disable('x-powered-by');

app.use(helmet());
app.use(compression());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*'
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000,
  limit: Number(process.env.RATE_LIMIT_MAX) || 120,
  standardHeaders: 'draft-7',
  legacyHeaders: false
});
app.use(limiter);

app.get('/health', (req, res) => {
  return res.status(200).json(apiResponse(true, 'OK', { service: 'teacher-profile-service' }));
});

app.use('/api/teacher/profile', teacherProfileRoutes);

app.use((req, res) => {
  return res.status(404).json(apiResponse(false, 'Route not found'));
});

app.use(errorMiddleware);

module.exports = app;
