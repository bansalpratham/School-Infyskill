const express = require('express');
const dashboardController = require('../controllers/dashboard.controller');

const verifyToken = require('../middlewares/verifyToken');
const authorizeRole = require('../middlewares/authorizeRole');

const router = express.Router();

router.get('/overview', verifyToken, authorizeRole('admin', 'teacher', 'student'), dashboardController.overview);

module.exports = router;
