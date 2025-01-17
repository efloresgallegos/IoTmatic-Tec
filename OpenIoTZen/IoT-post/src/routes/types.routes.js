import typesController from "../controllers/types.controller.js";
import { Router } from "express";

const router = Router();


router.get("/", typesController.getTypes);
router.get("/:id", typesController.getTypeById);
router.post("/", typesController.createType);
router.put("/:id", typesController.updateType);
router.delete("/:id", typesController.deleteType);

export default router;
