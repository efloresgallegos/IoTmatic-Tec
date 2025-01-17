import deviceModelsController from "../controllers/deviceModels.controller.js";
import { Router } from "express";

const router = Router();

router.get("/", deviceModelsController.getDeviceModels);
router.post("/", deviceModelsController.createDeviceModel);
router.put("/:id", deviceModelsController.updateDeviceModel);
router.delete("/:id", deviceModelsController.deleteDeviceModel);
router.patch("/:id", deviceModelsController.patchDeviceModel);
router.get("/:id", deviceModelsController.getDeviceModelById);
router.get("/bymodel/:model_id", deviceModelsController.getDeviceModelsByModel);
router.get("/bydevice/:device_id", deviceModelsController.getDeviceModelsByDevice);
router.get("/bydeviceandmodel/:model_id/:device_id", deviceModelsController.getDeviceModelsByModelAndDevice);

export default router;