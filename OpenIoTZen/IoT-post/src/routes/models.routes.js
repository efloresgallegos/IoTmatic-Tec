import modeController from '../controllers/models.controller.js';
import { Router } from 'express';

const router = Router();

router.get('/', modeController.getModels);
router.post('/', modeController.createModel);
router.put('/:id', modeController.updateModel);
router.get('/:id', modeController.getModelById);
router.delete('/:id', modeController.deleteModel);

export default router;