const express = require('express');
const feeController = require('../controllers/fee.controller');

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

router.post('/', verifyToken, authorizeRole('admin'), feeController.create);
router.get('/', verifyToken, authorizeRole('admin', 'teacher'), feeController.list);
router.get('/student/:studentId', verifyToken, allowSelfOrStaff, feeController.getByStudent);
router.patch('/:id/pay', verifyToken, authorizeRole('admin'), feeController.pay);
router.get('/summary', verifyToken, authorizeRole('admin'), feeController.summary);

module.exports = router;
