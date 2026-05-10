import { Router } from 'express';
import Municipality from '../controllers/municipality.js';
const router = Router();
const municipality = new Municipality();
router.post('/', municipality.handle);
export default router;