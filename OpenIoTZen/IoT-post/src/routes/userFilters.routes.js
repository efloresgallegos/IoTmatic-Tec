import userFiltersController from '../controllers/userFilters.controller.js';
import { Router } from 'express';

const router = Router();

router.get('/from-user/:user_id', userFiltersController.getUserFiltersfromUser);
router.patch('/:id', userFiltersController.patchUserFilter);
router.delete('/:id', userFiltersController.deleteUserFilter);
router.post('/', userFiltersController.createUserFilter);
router.get('/', userFiltersController.getUserFilters);

export default router;