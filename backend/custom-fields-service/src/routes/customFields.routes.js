const express = require('express');
const customFieldsController = require('../controllers/customFields.controller');

const verifyToken = require('../middlewares/verifyToken');
const authorizeRole = require('../middlewares/authorizeRole');

const router = express.Router();

router.get('/', verifyToken, authorizeRole('admin', 'super-admin', 'student', 'teacher'), customFieldsController.list);
router.post('/', verifyToken, authorizeRole('admin', 'super-admin'), customFieldsController.create);
router.put('/reorder', verifyToken, authorizeRole('admin', 'super-admin'), customFieldsController.reorder);
router.put('/:id', verifyToken, authorizeRole('admin', 'super-admin'), customFieldsController.update);
router.delete('/:id', verifyToken, authorizeRole('admin', 'super-admin'), customFieldsController.remove);

module.exports = router;
