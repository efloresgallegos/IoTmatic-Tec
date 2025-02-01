import ai from '../ai/AIConection.js';
import { Router } from 'express';

const router = Router();

router.post('/GPT', ai.sendToGPT);
router.post('/DeepSeek', ai.sendToDeepSeek);

export default router;