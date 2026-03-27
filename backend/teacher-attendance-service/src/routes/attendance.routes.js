const express = require('express');
const attendanceController = require('../controllers/attendance.controller');

const verifyToken = require('../middlewares/verifyToken');
const authorizeRole = require('../middlewares/authorizeRole');

const router = express.Router();

function allowStudentSelf(req, res, next) {
  const role = req.user?.role;
  if (role === 'admin' || role === 'teacher') return next();

  if (role === 'student') {
    const requestedStudentId = String(req.query.studentId || '').trim();
    if (!requestedStudentId) {
      const err = new Error('studentId is required');
      err.statusCode = 400;
      return next(err);
    }
    if (String(req.user.userId) !== requestedStudentId) {
      const err = new Error('Access denied');
      err.statusCode = 403;
      return next(err);
    }
    return next();
  }

  const err = new Error('Access denied');
  err.statusCode = 403;
  return next(err);
}

router.post('/', verifyToken, authorizeRole('admin', 'teacher'), attendanceController.createBulk);
router.get('/', verifyToken, authorizeRole('admin', 'teacher', 'student'), allowStudentSelf, attendanceController.list);
router.get('/class/:className', verifyToken, authorizeRole('admin', 'teacher'), attendanceController.getByClass);

module.exports = router;
