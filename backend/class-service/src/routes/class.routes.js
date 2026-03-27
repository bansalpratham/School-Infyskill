const express = require('express');

const { requireAuth, requireRole, requireSchoolId, enforceAllowedSchoolId } = require('@school-hub/shared-middleware');

const classController = require('../controllers/class.controller');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || '';

router.use(requireAuth(JWT_SECRET));
router.use(requireSchoolId);
router.use(enforceAllowedSchoolId());

router.get('/assigned', requireRole('admin', 'super-admin', 'teacher'), classController.listAssigned);

router.use(requireRole('admin', 'super-admin'));

router.post('/', classController.create);
router.get('/', classController.list);
router.put('/:id', classController.update);
router.delete('/:id', classController.remove);

module.exports = router;
