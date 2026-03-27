const express = require('express');
const achievementController = require('../controllers/achievement.controller');

const verifyToken = require('../middlewares/verifyToken');
const authorizeRole = require('../middlewares/authorizeRole');

const router = express.Router();

function allowSelfOrStaff(req, res, next) {
  const role = req.user?.role;
  if (role === 'admin' || role === 'teacher') return next();
  if (role === 'student' && String(req.user.userId) === String(req.params.studentId)) return next();

  const err = new Error('Access denied');
  err.statusCode = 403;
  return next(err);
}

router.post('/', verifyToken, authorizeRole('admin', 'teacher'), achievementController.create);
router.get('/', verifyToken, authorizeRole('admin', 'teacher'), achievementController.list);
router.get('/student/:studentId', verifyToken, allowSelfOrStaff, achievementController.listByStudent);

module.exports = router;
