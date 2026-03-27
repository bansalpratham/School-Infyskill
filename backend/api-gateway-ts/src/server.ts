import path from 'path';

import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';
import type { ClientRequest } from 'http';

import { apiResponse } from '@school-hub/shared-utils';
import { enforceAllowedSchoolId, requireAuth } from '@school-hub/shared-middleware';

dotenv.config({
  path: path.resolve(__dirname, '../../.env')
});
dotenv.config({
  path: path.resolve(__dirname, '../.env')
});
dotenv.config();

function requiredEnv(key: string): string {
  const v = process.env[key];
  if (!v) throw new Error(`${key} is required`);
  return v;
}

function serviceTarget(envKey: string, defaultPort: number): string {
  const raw = process.env[envKey];
  if (raw) {
    const trimmed = raw.trim();
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `http://${trimmed}`;
  }
  return `http://localhost:${defaultPort}`;
}

const PORT = Number(process.env.PORT || 4100);
const JWT_SECRET = requiredEnv('JWT_SECRET');
const TENANCY_DISABLED = String(process.env.TENANCY_DISABLED || '').toLowerCase() === 'true';

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim()).filter(Boolean)
  : null;

const corsOptions: cors.CorsOptions = {
  origin: (origin, cb) => {
    if (!allowedOrigins || allowedOrigins.length === 0) {
      return cb(null, true);
    }

    // Non-browser requests (curl, server-to-server) may not send Origin.
    if (!origin) {
      return cb(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      // `true` tells `cors` to echo the request origin.
      return cb(null, true);
    }

    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-school-id'],
  optionsSuccessStatus: 204
};

const app = express();
app.disable('x-powered-by');

app.use(helmet());
app.use(compression());
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Parse body BEFORE proxy routes so we can re-stream JSON bodies in on.proxyReq.
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

const targets = {
  auth: serviceTarget('AUTH_SERVICE_URL', 5001),
  students: serviceTarget('STUDENT_SERVICE_URL', 5002),
  teachers: serviceTarget('TEACHER_SERVICE_URL', 5003),
  fees: serviceTarget('FEES_SERVICE_URL', 5004),
  payments: serviceTarget('PAYMENTS_SERVICE_URL', 4005),
  results: serviceTarget('EXAM_SERVICE_URL', 5006),
  classes: serviceTarget('CLASS_SERVICE_URL', 5007),
  subjects: serviceTarget('SUBJECT_SERVICE_URL', 5008),
  customFields: serviceTarget('CUSTOM_FIELDS_SERVICE_URL', 4020),
  announcements: serviceTarget('ANNOUNCEMENTS_SERVICE_URL', 4007),
  importExport: serviceTarget('IMPORT_EXPORT_SERVICE_URL', 4009),
  dashboard: serviceTarget('DASHBOARD_SERVICE_URL', 4010),
  settings: serviceTarget('SETTINGS_SERVICE_URL', 4014),
  teacherProfile: serviceTarget('TEACHER_PROFILE_SERVICE_URL', 4011),
  teacherDiary: serviceTarget('TEACHER_DIARY_SERVICE_URL', 4015),
  teacherAttendance: serviceTarget('TEACHER_ATTENDANCE_SERVICE_URL', 4013),
  teacherTimetable: serviceTarget('TEACHER_TIMETABLE_SERVICE_URL', 4012),
  teacherFeedback: serviceTarget('TEACHER_FEEDBACK_SERVICE_URL', 4016),
  teacherNotifications: serviceTarget('TEACHER_NOTIFICATIONS_SERVICE_URL', 4017),
  teacherMeetings: serviceTarget('TEACHER_MEETINGS_SERVICE_URL', 4018),
  teacherAchievements: serviceTarget('TEACHER_ACHIEVEMENTS_SERVICE_URL', 4019),
  requests: serviceTarget('REQUESTS_SERVICE_URL', 4008),
  timetable: serviceTarget('TIMETABLE_SERVICE_URL', 5010)
};

function proxyTo(target: string, basePath: string) {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    xfwd: true,
    pathRewrite: (path) => `${basePath}${path}`,
    proxyTimeout: Number(process.env.GATEWAY_PROXY_TIMEOUT_MS) || 30_000,
    timeout: Number(process.env.GATEWAY_PROXY_TIMEOUT_MS) || 30_000,
    on: {
      proxyRes: (proxyRes) => {
        // Ensure gateway-level CORS is authoritative. Some upstream services may set
        // `Access-Control-*` headers and if we forward them, browsers can see invalid
        // values (e.g. a comma-separated allow-origin list).
        delete proxyRes.headers['access-control-allow-origin'];
        delete proxyRes.headers['access-control-allow-credentials'];
        delete proxyRes.headers['access-control-allow-methods'];
        delete proxyRes.headers['access-control-allow-headers'];
        delete proxyRes.headers['access-control-expose-headers'];
        delete proxyRes.headers['access-control-max-age'];
      },
      proxyReq: (proxyReq: ClientRequest, req: express.Request) => {
        const contentType = req.headers['content-type'] || '';
        const hasBody = (req as any).body !== undefined && (req as any).body !== null;
        const isJson = typeof contentType === 'string' && contentType.includes('application/json');

        if (hasBody && isJson) {
          const bodyData = JSON.stringify((req as any).body);
          proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
          proxyReq.write(bodyData);
        }
      }
    }
  });
}

// Public (no auth / no x-school-id required)
app.use('/api/auth', proxyTo(targets.auth, '/api/auth'));

// Protected (requireAuth -> enforceAllowedSchoolId)
// Note: enforceAllowedSchoolId validates x-school-id exists AND is included in user.allowedSchoolIds
const tenancyGuard: express.RequestHandler = TENANCY_DISABLED ? (req, res, next) => next() : enforceAllowedSchoolId();

app.use('/api/students', requireAuth(JWT_SECRET), tenancyGuard, proxyTo(targets.students, '/api/students'));
app.use('/api/teachers', requireAuth(JWT_SECRET), tenancyGuard, proxyTo(targets.teachers, '/api/teachers'));
app.use('/api/fees', requireAuth(JWT_SECRET), tenancyGuard, proxyTo(targets.fees, '/api/fees'));
app.use('/api/payments', requireAuth(JWT_SECRET), tenancyGuard, proxyTo(targets.payments, '/api/payments'));
app.use('/api/results', requireAuth(JWT_SECRET), tenancyGuard, proxyTo(targets.results, '/api/results'));
app.use('/api/exams', requireAuth(JWT_SECRET), tenancyGuard, proxyTo(targets.results, '/api/exams'));
app.use('/api/classes', requireAuth(JWT_SECRET), tenancyGuard, proxyTo(targets.classes, '/api/classes'));
app.use('/api/subjects', requireAuth(JWT_SECRET), tenancyGuard, proxyTo(targets.subjects, '/api/subjects'));
app.use('/api/custom-fields', requireAuth(JWT_SECRET), tenancyGuard, proxyTo(targets.customFields, '/api/custom-fields'));
app.use('/api/announcements', requireAuth(JWT_SECRET), tenancyGuard, proxyTo(targets.announcements, '/api/announcements'));
app.use('/api/import-export', requireAuth(JWT_SECRET), tenancyGuard, proxyTo(targets.importExport, '/api/import-export'));
app.use('/api/dashboard', requireAuth(JWT_SECRET), tenancyGuard, proxyTo(targets.dashboard, '/api/dashboard'));
app.use('/api/settings', requireAuth(JWT_SECRET), tenancyGuard, proxyTo(targets.settings, '/api/settings'));
app.use('/api/requests', requireAuth(JWT_SECRET), tenancyGuard, proxyTo(targets.requests, '/api/requests'));
app.use(
  '/api/teacher/profile',
  requireAuth(JWT_SECRET),
  tenancyGuard,
  proxyTo(targets.teacherProfile, '/api/teacher/profile')
);
app.use(
  '/api/teacher/attendance',
  requireAuth(JWT_SECRET),
  tenancyGuard,
  proxyTo(targets.teacherAttendance, '/api/teacher/attendance')
);
app.use('/api/teacher/diary', requireAuth(JWT_SECRET), tenancyGuard, proxyTo(targets.teacherDiary, '/api/teacher/diary'));
app.use(
  '/api/teacher/timetable',
  requireAuth(JWT_SECRET),
  tenancyGuard,
  proxyTo(targets.teacherTimetable, '/api/teacher/timetable')
);
app.use(
  '/api/teacher/feedback',
  requireAuth(JWT_SECRET),
  tenancyGuard,
  proxyTo(targets.teacherFeedback, '/api/teacher/feedback')
);
app.use(
  '/api/teacher/notifications',
  requireAuth(JWT_SECRET),
  tenancyGuard,
  proxyTo(targets.teacherNotifications, '/api/teacher/notifications')
);
app.use(
  '/api/teacher/meetings',
  requireAuth(JWT_SECRET),
  tenancyGuard,
  proxyTo(targets.teacherMeetings, '/api/teacher/meetings')
);
app.use(
  '/api/teacher/achievements',
  requireAuth(JWT_SECRET),
  tenancyGuard,
  proxyTo(targets.teacherAchievements, '/api/teacher/achievements')
);
app.use('/api/timetable', requireAuth(JWT_SECRET), tenancyGuard, proxyTo(targets.timetable, '/api/timetable'));
app.use(morgan('combined'));

app.use(
  rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000,
    limit: Number(process.env.RATE_LIMIT_MAX) || 300,
    standardHeaders: 'draft-7',
    legacyHeaders: false
  })
);

app.get('/health', (req, res) => {
  return res.status(200).json(apiResponse(true, 'OK', { service: 'api-gateway-ts' }));
});

app.use((req, res) => {
  return res.status(404).json(apiResponse(false, 'Route not found'));
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const statusCode = err?.statusCode || err?.status || 500;
  const message = statusCode >= 500 ? 'Internal server error' : err?.message || 'Request failed';
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.error(err);
  }
  return res.status(statusCode).json(apiResponse(false, message));
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`api-gateway-ts listening on port ${PORT}`);
});
