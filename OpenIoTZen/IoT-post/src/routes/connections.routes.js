import { Router } from 'express';
import ConnectionsController from '../controllers/connections.controller.js';

const router = Router();

// Rutas para gestionar conexiones de dispositivos
router.get('/', ConnectionsController.getConnections);
router.get('/stats', ConnectionsController.getConnectionStats);
router.get('/:device_id', ConnectionsController.getConnectionInfo);

export default router;