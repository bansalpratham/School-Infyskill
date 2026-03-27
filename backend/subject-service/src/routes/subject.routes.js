const express = require('express');

const { requireAuth, requireRole, requireSchoolId, enforceAllowedSchoolId } = require('@school-hub/shared-middleware');

const subjectController = require('../controllers/subject.controller');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || '';

router.use(requireAuth(JWT_SECRET));
router.use(requireSchoolId);
router.use(enforceAllowedSchoolId());
router.use(requireRole('admin', 'super-admin'));

router.post('/', subjectController.create);
router.get('/', subjectController.list);
router.put('/:id', subjectController.update);
router.delete('/:id', subjectController.remove);

module.exports = router;
