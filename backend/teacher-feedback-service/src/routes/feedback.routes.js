const express = require('express');
const feedbackController = require('../controllers/feedback.controller');

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

router.post('/', verifyToken, authorizeRole('admin', 'teacher'), feedbackController.create);
router.get('/', verifyToken, authorizeRole('admin', 'teacher'), feedbackController.list);
router.get('/student/:studentId', verifyToken, allowSelfOrStaff, feedbackController.getByStudent);

module.exports = router;
