import dataController from "../controllers/data.controller.js";
import { Router } from "express";

const router = Router();

router.post("/create", dataController.createData);
router.get("/getByModelDevice", dataController.getDatabyModelandDevice);
router.get("/getByModel", dataController.getDatabyModel);
router.get("/getByDevice", dataController.getDatabyDevice);
router.get("/getByRange", dataController.getDatabyDateRange);

export default router;
