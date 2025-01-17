import alertsController from '../controllers/alerts.controller.js';
import { Router } from 'express';

const router = Router();

router.get('/', alertsController.getAlerts);
router.post('/', alertsController.createAlert);
router.put('/:id', alertsController.updateAlert);
router.delete('/:id', alertsController.deleteAlert);
router.patch('/:id', alertsController.patchAlert);

export default router;
