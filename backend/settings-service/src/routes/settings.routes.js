const express = require("express");
const router = express.Router();
const controller = require("../controllers/settings.controller");
const verifyToken = require('../middlewares/verifyToken');
const authorizeRole = require('../middlewares/authorizeRole');

router.get('/profile', verifyToken, authorizeRole('admin', 'teacher', 'student'), controller.getProfile);
router.put('/profile', verifyToken, authorizeRole('admin', 'teacher', 'student'), controller.updateProfile);
router.put('/change-password', verifyToken, authorizeRole('admin', 'teacher', 'student'), controller.changePassword);

router.get('/notifications', verifyToken, authorizeRole('admin', 'teacher', 'student'), controller.getNotifications);
router.put('/notifications', verifyToken, authorizeRole('admin', 'teacher', 'student'), controller.updateNotifications);

router.get('/school', verifyToken, authorizeRole('admin', 'teacher', 'student'), controller.getSchool);
router.put('/school', verifyToken, authorizeRole('admin'), controller.updateSchool);

module.exports = router;