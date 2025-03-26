import modelController from '../controllers/models.controller.js';
import { Router } from 'express';

const router = Router();

router.get('/', modelController.getModels);
router.post('/', modelController.createModel);
router.put('/:id', modelController.updateModel);
router.get('/:id', modelController.getModelById);
router.delete('/:id', modelController.deleteModel);
router.get('/:id/json', modelController.getFullJson);

export default router;