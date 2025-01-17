import generatorController from '../controllers/generator.controller.js';
import { Router } from 'express';

const router = Router();

router.post('/', generatorController.finalController);

export default router;
