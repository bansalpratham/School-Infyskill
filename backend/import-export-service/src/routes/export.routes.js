const express = require('express');
const exportController = require('../controllers/export.controller');

const verifyToken = require('../middlewares/verifyToken');
const authorizeRole = require('../middlewares/authorizeRole');

const router = express.Router();

router.get('/students', verifyToken, authorizeRole('admin', 'teacher'), exportController.exportStudents);

module.exports = router;
