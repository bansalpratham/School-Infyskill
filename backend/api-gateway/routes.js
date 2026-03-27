const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const router = express.Router();

function serviceTarget({ envKey, defaultPort }) {
  const raw = process.env[envKey];
  if (raw) return raw;
  return `http://localhost:${defaultPort}`;
}

function proxyTo(target) {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    xfwd: true,
    proxyTimeout: Number(process.env.GATEWAY_PROXY_TIMEOUT_MS) || 30_000,
    timeout: Number(process.env.GATEWAY_PROXY_TIMEOUT_MS) || 30_000,
    logLevel: process.env.NODE_ENV === 'production' ? 'warn' : 'info'
  });
}

const targets = {
  auth: serviceTarget({ envKey: 'AUTH_SERVICE_URL', defaultPort: 5000 }),
  students: serviceTarget({ envKey: 'STUDENT_SERVICE_URL', defaultPort: 4002 }),
  teachers: serviceTarget({ envKey: 'TEACHER_SERVICE_URL', defaultPort: 4003 }),
  fees: serviceTarget({ envKey: 'FEES_SERVICE_URL', defaultPort: 4004 }),
  payments: serviceTarget({ envKey: 'PAYMENTS_SERVICE_URL', defaultPort: 4005 }),
  results: serviceTarget({ envKey: 'EXAM_SERVICE_URL', defaultPort: 4006 }),
  announcements: serviceTarget({ envKey: 'ANNOUNCEMENTS_SERVICE_URL', defaultPort: 4007 }),
  requests: serviceTarget({ envKey: 'REQUESTS_SERVICE_URL', defaultPort: 4008 }),
  importExport: serviceTarget({ envKey: 'IMPORT_EXPORT_SERVICE_URL', defaultPort: 4009 }),
  dashboard: serviceTarget({ envKey: 'DASHBOARD_SERVICE_URL', defaultPort: 4010 }),
  settings: serviceTarget({ envKey: 'SETTINGS_SERVICE_URL', defaultPort: 4014 }),
  teacherProfile: serviceTarget({ envKey: 'TEACHER_PROFILE_SERVICE_URL', defaultPort: 4011 }),
  teacherTimetable: serviceTarget({ envKey: 'TEACHER_TIMETABLE_SERVICE_URL', defaultPort: 4012 }),
  teacherAttendance: serviceTarget({ envKey: 'TEACHER_ATTENDANCE_SERVICE_URL', defaultPort: 4013 }),
  teacherDiary: serviceTarget({ envKey: 'TEACHER_DIARY_SERVICE_URL', defaultPort: 4015 }),
  teacherFeedback: serviceTarget({ envKey: 'TEACHER_FEEDBACK_SERVICE_URL', defaultPort: 4016 }),
  teacherNotifications: serviceTarget({ envKey: 'TEACHER_NOTIFICATIONS_SERVICE_URL', defaultPort: 4017 }),
  teacherMeetings: serviceTarget({ envKey: 'TEACHER_MEETINGS_SERVICE_URL', defaultPort: 4018 }),
  teacherAchievements: serviceTarget({ envKey: 'TEACHER_ACHIEVEMENTS_SERVICE_URL', defaultPort: 4019 })
};

// Auth
router.use('/api/auth', proxyTo(targets.auth));

// Core services
router.use('/api/students', proxyTo(targets.students));
router.use('/api/teachers', proxyTo(targets.teachers));
router.use('/api/fees', proxyTo(targets.fees));
router.use('/api/payments', proxyTo(targets.payments));
router.use('/api/results', proxyTo(targets.results));
router.use('/api/exams', proxyTo(targets.results));
router.use('/api/announcements', proxyTo(targets.announcements));
router.use('/api/requests', proxyTo(targets.requests));
router.use('/api/dashboard', proxyTo(targets.dashboard));

// Settings
router.use('/api/settings', proxyTo(targets.settings));

// Import / Export
router.use('/api/import', proxyTo(targets.importExport));
router.use('/api/export', proxyTo(targets.importExport));

// Teacher-specific services
router.use('/api/teacher/profile', proxyTo(targets.teacherProfile));
router.use('/api/teacher/timetable', proxyTo(targets.teacherTimetable));
router.use('/api/teacher/attendance', proxyTo(targets.teacherAttendance));
router.use('/api/teacher/diary', proxyTo(targets.teacherDiary));
router.use('/api/teacher/feedback', proxyTo(targets.teacherFeedback));
router.use('/api/teacher/notifications', proxyTo(targets.teacherNotifications));
router.use('/api/teacher/meetings', proxyTo(targets.teacherMeetings));
router.use('/api/teacher/achievements', proxyTo(targets.teacherAchievements));

module.exports = router;
