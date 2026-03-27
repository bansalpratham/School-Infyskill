const express = require('express');
const notificationController = require('../controllers/notification.controller');

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

router.post('/', verifyToken, authorizeRole('admin'), notificationController.create);
router.get('/:teacherId', verifyToken, allowSelfTeacherOrAdmin, notificationController.listByTeacher);
router.patch('/:id/read', verifyToken, authorizeRole('admin', 'teacher'), notificationController.patchRead);

module.exports = router;
