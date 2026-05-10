import { Router } from 'express';
import Department from '../controllers/department.js';
const router = Router();
const department = new Department();
router.post('/', department.handle);
export default router;