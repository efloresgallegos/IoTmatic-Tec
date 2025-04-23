import websocketCodeController from '../controllers/websocketCode.controller.js';
import { Router } from 'express';

const router = Router();

// Ruta para generar código WebSocket para diferentes lenguajes
router.post('/generate', websocketCodeController.generateWebSocketCode);

export default router;