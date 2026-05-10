import { Router } from 'express';
import Settlement from '../controllers/settlement.js';
const router = Router();
const settlement = new Settlement();
router.post('/', settlement.handle);
export default router;