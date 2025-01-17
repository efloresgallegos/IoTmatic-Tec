import usersController from '../controllers/users.controller.js';
import { Router } from 'express';

const router = Router();

router.post('/', usersController.createUser);
router.get('/', usersController.getUsers);
router.get('/:id', usersController.getUserbyId);
router.patch('/:id', usersController.updateUser);
router.delete('/:id', usersController.deleteUser);

export default router;
