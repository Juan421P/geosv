import { Router } from 'express';
import Address from '../controllers/address.js';
const router = Router();
const address = new Address();
router.post('/', address.handle);
export default router;