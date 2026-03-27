const express = require('express');
const requestController = require('../controllers/request.controller');

const verifyToken = require('../middlewares/verifyToken');
const authorizeRole = require('../middlewares/authorizeRole');

const router = express.Router();

router.post('/', verifyToken, authorizeRole('admin', 'teacher', 'student'), requestController.create);
router.get('/', verifyToken, authorizeRole('admin', 'teacher', 'student'), requestController.list);
router.patch('/:id/approve', verifyToken, authorizeRole('admin'), requestController.approve);
router.patch('/:id/reject', verifyToken, authorizeRole('admin'), requestController.reject);

module.exports = router;
