const express = require('express');
const announcementController = require('../controllers/announcement.controller');

const verifyToken = require('../middlewares/verifyToken');
const authorizeRole = require('../middlewares/authorizeRole');

const router = express.Router();

router.post('/', verifyToken, authorizeRole('admin'), announcementController.create);
router.get('/', verifyToken, authorizeRole('admin', 'teacher', 'student'), announcementController.list);
router.patch('/:id/status', verifyToken, authorizeRole('admin'), announcementController.patchStatus);
router.patch('/read/all', verifyToken, authorizeRole('admin', 'teacher', 'student'), announcementController.patchReadAll);
router.patch('/:id/read', verifyToken, authorizeRole('admin', 'teacher', 'student'), announcementController.patchRead);
router.delete('/:id', verifyToken, authorizeRole('admin'), announcementController.remove);

module.exports = router;
