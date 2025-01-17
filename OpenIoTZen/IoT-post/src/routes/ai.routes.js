import ai from '../ai/first.js';
import { Router } from 'express';

const router = Router();

router.post('/ai', ai.controller);

export default router;