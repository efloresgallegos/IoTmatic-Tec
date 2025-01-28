import dataController from "../controllers/data.controller.js";
import { Router } from "express";

const router = Router();

router.post("/create", dataController.createData);
router.get("/getByModelDevice", dataController.getDatabyModelandDevice);
router.get("/getByModel", dataController.getDatabyModel);
router.get("/getByDevice", dataController.getDatabyDevice);
router.get("/getByRange", dataController.getDatabyDateRange);
router.get("/getGraphable", dataController.getGraphableData);
router.post("/getJson", dataController.getJsonForPost);

export default router;
