const express = require('express');
const diaryController = require('../controllers/diary.controller');

const verifyToken = require('../middlewares/verifyToken');
const authorizeRole = require('../middlewares/authorizeRole');

const router = express.Router();

async function ensureStudentClassMatchesQuery(req, res, next) {
  try {
    const role = req.user?.role;
    if (role === 'admin' || role === 'teacher') return next();

    if (role !== 'student') {
      const err = new Error('Access denied');
      err.statusCode = 403;
      throw err;
    }

    const className = String(req.query.className || '').trim();
    if (!className) {
      const err = new Error('className is required');
      err.statusCode = 400;
      throw err;
    }

    const studentServiceUrl = process.env.STUDENT_SERVICE_URL || 'http://localhost:4002';
    const authHeader = req.headers.authorization;
    const schoolIdHeader = req.header('x-school-id');

    const resp = await fetch(`${studentServiceUrl}/api/students/${encodeURIComponent(String(req.user.userId))}`, {
      headers: {
        ...(authHeader ? { Authorization: authHeader } : {}),
        ...(schoolIdHeader ? { 'x-school-id': schoolIdHeader } : {})
      }
    });

    if (!resp.ok) {
      const err = new Error('Failed to validate student');
      err.statusCode = resp.status;
      throw err;
    }

    const payload = await resp.json();
    const student = payload?.data;
    const studentClass = String(student?.className || '').trim();
    if (!studentClass) {
      const err = new Error('Student class is missing');
      err.statusCode = 400;
      throw err;
    }

    if (studentClass !== className) {
      const err = new Error('Access denied');
      err.statusCode = 403;
      throw err;
    }

    return next();
  } catch (err) {
    return next(err);
  }
}

router.post('/', verifyToken, authorizeRole('admin', 'teacher'), diaryController.create);
router.get('/', verifyToken, authorizeRole('admin', 'teacher', 'student'), ensureStudentClassMatchesQuery, diaryController.list);
router.get('/class/:className', verifyToken, authorizeRole('admin', 'teacher'), diaryController.getByClass);

module.exports = router;
