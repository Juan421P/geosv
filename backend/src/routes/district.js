import { Router } from 'express';
import District from '../controllers/district.js';
const router = Router();
const district = new District();
router.post('/', district.handle);
export default router;