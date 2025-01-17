import userModelsControler from '../controllers/userModels.controller.js';
import { Router } from 'express';

const router = Router();

router.get('/from-user/:user_id', userModelsControler.getUserModelsfromUser);
router.get('/from-model/:model_id', userModelsControler.getUserModelsfromModel);
router.post('/', userModelsControler.createUserModel);
router.delete('/', userModelsControler.deleteUserModel);

export default router;