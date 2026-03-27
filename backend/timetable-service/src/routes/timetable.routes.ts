import express from 'express';
import {
  enforceAllowedSchoolId,
  requireAuth,
  requireRole,
  requireSchoolId,
  SCHOOL_ID_HEADER
} from '@school-hub/shared-middleware';

import { create, generate, getByClass, list, remove, update } from '../controllers/timetable.controller';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || '';
const TENANCY_DISABLED = String(process.env.TENANCY_DISABLED || '').toLowerCase() === 'true';

const adminOnly = requireRole('admin', 'super-admin');
const canReadTimetable = requireRole('admin', 'super-admin', 'teacher');

router.use(requireAuth(JWT_SECRET));
if (!TENANCY_DISABLED) {
  router.use(requireSchoolId);
  router.use(enforceAllowedSchoolId());
} else {
  router.use((req, res, next) => {
    const v = String(req.header(SCHOOL_ID_HEADER) || '').trim();
    (req as any).schoolId = v || 'local-dev';
    return next();
  });
}

router.post('/generate', adminOnly, generate);
router.post('/', adminOnly, create);
router.get('/', canReadTimetable, list);
router.get('/class/:classId', canReadTimetable, getByClass);
router.put('/:id', adminOnly, update);
router.delete('/:id', adminOnly, remove);

export default router;
