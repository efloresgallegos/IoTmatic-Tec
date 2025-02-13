import { Router } from 'express';
import  sendToAI from '../ai/AIConection.js';

const router = Router();

router.post('/sendToAI', sendToAI.sendToAI);

export default router;