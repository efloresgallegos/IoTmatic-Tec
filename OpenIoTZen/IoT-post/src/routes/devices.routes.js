import DeviceController from '../controllers/devices.controller.js';
import { Router } from 'express';

const router = Router();

router.get('/', DeviceController.getDevices);
router.post('/', DeviceController.createDevice);
router.put('/:id', DeviceController.updateDevice);
router.delete('/:id', DeviceController.deleteDevice);
router.patch('/:id', DeviceController.patchDevice);


export default router;