import userDevicesController from "../controllers/userDevices.controller.js";
import { Router } from "express";

const router = Router();

router.get("/", userDevicesController.getUserDevices);
router.post("/", userDevicesController.createUserDevice);
router.put("/:id", userDevicesController.updateUserDevice);
router.delete("/:id", userDevicesController.deleteUserDevice);
router.patch("/:id", userDevicesController.patchUserDevice);
router.get("/user-devices/:id", userDevicesController.getUserDevicesfromUser);

export default router;