const express = require('express');
const teacherController = require('../controllers/teacher.controller');

const verifyToken = require('../middlewares/verifyToken');
const authorizeRole = require('../middlewares/authorizeRole');

const router = express.Router();

router.post('/', verifyToken, authorizeRole('admin'), teacherController.create);
router.get('/', verifyToken, authorizeRole('admin'), teacherController.list);
router.get('/:id', verifyToken, authorizeRole('admin'), teacherController.getById);
router.put('/:id', verifyToken, authorizeRole('admin'), teacherController.update);
router.patch('/:id/status', verifyToken, authorizeRole('admin'), teacherController.patchStatus);
router.delete('/:id', verifyToken, authorizeRole('admin'), teacherController.remove);

module.exports = router;
