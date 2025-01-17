import userAlertsController from '../controllers/userAlerts.controller.js';
import { Router } from 'express';

const router = Router();

router.get('/user/:user_id', userAlertsController.getUserAlertsfromUser);
router.post('/', userAlertsController.createUserAlert);
router.delete('/:id', userAlertsController.deleteUserAlert);
router.patch('/:id', userAlertsController.patchUserAlert);
router.get('/alert/:alert_id', userAlertsController.getUserAlertsfromAlert);
router.get('/', userAlertsController.getUserAlerts);

export default router;
