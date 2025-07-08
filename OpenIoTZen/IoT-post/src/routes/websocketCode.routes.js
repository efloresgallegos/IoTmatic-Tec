import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js';
import websocketCodeController from '../controllers/websocketCode.controller.js';

const router = Router();

// Ruta para generar código WebSocket para diferentes lenguajes
router.post('/generate', verifyToken, websocketCodeController.generateWebSocketCode);

export default router;