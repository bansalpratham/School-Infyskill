import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { apiResponse } from '@school-hub/shared-utils';

import timetableRoutes from './routes/timetable.routes';
import { errorMiddleware } from './middlewares/error.middleware';

const app = express();

app.disable('x-powered-by');

app.set('trust proxy', 1);

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

app.use(
  rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000,
    limit: Number(process.env.RATE_LIMIT_MAX) || 120,
    standardHeaders: 'draft-7',
    legacyHeaders: false
  })
);

app.get('/health', (req, res) => {
  return res.status(200).json(apiResponse(true, 'OK', { service: 'timetable-service' }));
});

app.use('/api/timetable', timetableRoutes);

app.use((req, res) => {
  return res.status(404).json(apiResponse(false, 'Route not found'));
});

app.use(errorMiddleware);

export default app;
