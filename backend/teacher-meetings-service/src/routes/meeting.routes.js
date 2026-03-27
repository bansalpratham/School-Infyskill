const express = require('express');
const meetingController = require('../controllers/meeting.controller');

const verifyToken = require('../middlewares/verifyToken');
const authorizeRole = require('../middlewares/authorizeRole');

const router = express.Router();

function allowSelfTeacherOrAdmin(req, res, next) {
  const role = req.user?.role;
  if (role === 'admin') return next();
  if (role === 'teacher' && String(req.user.userId) === String(req.params.teacherId)) return next();

  const err = new Error('Access denied');
  err.statusCode = 403;
  return next(err);
}

router.post('/', verifyToken, authorizeRole('admin', 'teacher'), meetingController.create);
router.get('/', verifyToken, authorizeRole('admin', 'teacher'), meetingController.list);
router.get('/:teacherId', verifyToken, allowSelfTeacherOrAdmin, meetingController.listByTeacher);

module.exports = router;
