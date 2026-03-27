const express = require('express');
const teacherProfileController = require('../controllers/teacherProfile.controller');

const verifyToken = require('../middlewares/verifyToken');
const authorizeRole = require('../middlewares/authorizeRole');

const router = express.Router();

function allowSelfTeacherOrAdmin(req, res, next) {
  const role = req.user?.role;
  if (role === 'admin') return next();
  if (role === 'teacher' && String(req.user.userId) === String(req.params.id)) return next();

  const err = new Error('Access denied');
  err.statusCode = 403;
  return next(err);
}

router.get('/:id', verifyToken, allowSelfTeacherOrAdmin, teacherProfileController.getById);
router.patch('/:id', verifyToken, allowSelfTeacherOrAdmin, teacherProfileController.patch);
router.put('/:id', verifyToken, authorizeRole('admin'), teacherProfileController.putUpsert);

module.exports = router;
