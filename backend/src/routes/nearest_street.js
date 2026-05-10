import { Router } from 'express';
import NearestStreet from '../controllers/nearest_street.js';
const router = Router();
const nearestStreet = new NearestStreet();
router.post('/', nearestStreet.handle);
export default router;