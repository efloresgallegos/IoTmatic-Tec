import usersController from '../controllers/users.controller.js';
import { Router } from 'express';

const router = Router();

router.post('/', usersController.createUser);
router.get('/', usersController.getUsers);
router.get('/:id', usersController.getUserById);
router.patch('/:id', usersController.updateUser);
router.delete('/:id', usersController.deleteUser);
router.post('/login', usersController.login);
export default router;
