const express = require('express');
const studentController = require('../controllers/student.controller');

const verifyToken = require('../middlewares/verifyToken');
const authorizeRole = require('../middlewares/authorizeRole');

const router = express.Router();

function allowSelfOrStaff(req, res, next) {
  const role = req.user?.role;
  if (role === 'admin' || role === 'teacher') return next();
  if (role === 'student' && String(req.user.userId) === String(req.params.id)) return next();

  const err = new Error('Access denied');
  err.statusCode = 403;
  return next(err);
}

router.post('/', verifyToken, authorizeRole('admin'), studentController.create);
router.get('/', verifyToken, authorizeRole('admin', 'teacher'), studentController.list);
router.get('/:id', verifyToken, allowSelfOrStaff, studentController.getById);
router.put('/:id', verifyToken, authorizeRole('admin'), studentController.update);
router.patch('/:id/status', verifyToken, authorizeRole('admin'), studentController.patchStatus);
router.delete('/:id', verifyToken, authorizeRole('admin'), studentController.remove);

module.exports = router;
