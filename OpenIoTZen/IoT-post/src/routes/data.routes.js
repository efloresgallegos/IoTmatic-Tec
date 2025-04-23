import dataController from "../controllers/data.controller.js";
import { Router } from "express";

const router = Router();

router.post("/create", dataController.createData);
router.get("/getByModelDevice", dataController.getDatabyModelandDevice);
router.get("/getByModel", dataController.getDatabyModel);
router.get("/getByDevice", dataController.getDatabyDevice);
router.get("/getLatest", dataController.getLatestData);
router.get("/getByRange", dataController.getDatabyDateRange);
router.get("/getGraphable/:id", dataController.getGraphableData);
router.post("/getJson", dataController.getJsonForPost);
router.get("/getBooleanFields/:id", dataController.getBooleanFields);
router.get("/getModelName/:id", dataController.getModelName);
router.post("/getWebSocketCode", dataController.getWebSocketCode);

export default router;
