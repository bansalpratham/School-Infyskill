const express = require('express');
const paymentController = require('../controllers/payment.controller');

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

router.post('/', verifyToken, authorizeRole('admin'), paymentController.create);
router.get('/', verifyToken, authorizeRole('admin', 'teacher'), paymentController.list);
router.get('/student/:studentId', verifyToken, allowSelfOrStaff, paymentController.getByStudent);

module.exports = router;
