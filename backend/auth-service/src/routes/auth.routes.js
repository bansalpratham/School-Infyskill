const express = require("express");
const router = express.Router();
const controller = require("../controllers/auth.controller.js");

const verifyToken = require('../middlewares/verifyToken');
const authorizeRole = require('../middlewares/authorizeRole');

function allowSelfOrAdmin(req, res, next) {
  if (!req.user) {
    const err = new Error('Unauthorized');
    err.statusCode = 401;
    return next(err);
  }

  const targetId = String(req.params.id);
  const selfId = String(req.user.userId);
  const isSelf = targetId && selfId && targetId === selfId;
  const role = String(req.user.role || '').trim();
  const isAdmin = role === 'admin' || role === 'super-admin';

  if (!isSelf && !isAdmin) {
    const err = new Error('Access denied');
    err.statusCode = 403;
    return next(err);
  }

  return next();
}

router.post("/register", controller.register);
router.post("/login", controller.login);

router.get('/user/:id', verifyToken, allowSelfOrAdmin, controller.getUserById);
router.put('/user/:id', verifyToken, allowSelfOrAdmin, controller.updateUser);
router.put('/change-password/:id', verifyToken, allowSelfOrAdmin, controller.changePasswordById);

// Admin-only utilities
router.post('/admin/register', verifyToken, authorizeRole('admin'), controller.register);

module.exports = router;