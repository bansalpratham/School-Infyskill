const express = require('express');
const resultController = require('../controllers/result.controller');

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

router.post('/', verifyToken, authorizeRole('admin', 'teacher'), resultController.create);
router.post('/bulk', verifyToken, authorizeRole('admin', 'teacher'), resultController.createBulk);
router.get('/', verifyToken, authorizeRole('admin', 'teacher'), resultController.list);
router.get('/student/:studentId', verifyToken, allowSelfOrStaff, resultController.getByStudent);
router.put('/:id', verifyToken, authorizeRole('admin', 'teacher'), resultController.update);
router.delete('/:id', verifyToken, authorizeRole('admin', 'teacher'), resultController.remove);

module.exports = router;
