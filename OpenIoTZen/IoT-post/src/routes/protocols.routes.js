import express from 'express';
import protocolCodeController from '../controllers/protocolCode.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(verifyToken);

/**
 * @route   POST /api/protocols/generate-code
 * @desc    Genera código cliente para uno o varios protocolos IoT
 * @access  Private
 */
router.post('/generate-code', protocolCodeController.generateProtocolCode);

/**
 * @route   GET /api/protocols
 * @desc    Obtiene información de todos los protocolos disponibles
 * @access  Private
 */
router.get('/', protocolCodeController.getAvailableProtocols);

/**
 * @route   GET /api/protocols/:protocol
 * @desc    Obtiene información específica de un protocolo
 * @access  Private
 */
router.get('/:protocol', protocolCodeController.getProtocolInfo);

/**
 * @route   POST /api/protocols/send-to-device
 * @desc    Envía datos a un dispositivo específico usando cualquier protocolo
 * @access  Private
 */
router.post('/send-to-device', protocolCodeController.sendToDevice);

/**
 * @route   GET /api/protocols/stats/connections
 * @desc    Obtiene estadísticas de conexiones por protocolo
 * @access  Private
 */
router.get('/stats/connections', protocolCodeController.getConnectionStats);

export default router;