import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import dataController from "../controllers/data.controller.js";

const router = Router();

// Rutas para datos
router.post("/create", verifyToken, dataController.create);
router.get("/getByModelDevice", verifyToken, dataController.getByModelAndDevice);
router.get("/getByModel", verifyToken, dataController.getByModel);
router.get("/getByDevice", verifyToken, dataController.getByDevice);
router.get("/getLatest", verifyToken, dataController.getLatest);
router.get("/getByRange", verifyToken, dataController.getByDateRange);
router.get("/getGraphable/:id", verifyToken, dataController.getGraphable);
router.post("/getJson", verifyToken, dataController.getJsonPost);
router.get("/getBooleanFields/:id", verifyToken, dataController.getBoolean);
router.get("/getModelName/:id", verifyToken, dataController.getModelName);
router.post("/getWebSocketCode", verifyToken, dataController.getWebSocketCode);

export default router;
