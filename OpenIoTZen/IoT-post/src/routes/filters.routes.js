import filtersController from '../controllers/filters.controller.js';
import { Router } from 'express';

const router = Router();

router.get('/', filtersController.getFilters);
router.post('/', filtersController.createFilter);
router.put('/:id', filtersController.updateFilter);
router.delete('/:id', filtersController.deleteFilter);
router.patch('/:id', filtersController.patchFilter);
router.get('/model/:model_id', filtersController.getFiltersByModel);
router.get('/device/:device_id', filtersController.getFiltersByDevice);
router.get('/model/:model_id/device/:device_id', filtersController.getFiltersByModelAndDevice);

export default router;
