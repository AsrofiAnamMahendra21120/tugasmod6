import express from "express";
import { ThresholdsController } from "../controllers/thresholdsController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", ThresholdsController.list);
// protect create route
router.post("/", requireAuth, ThresholdsController.create);
router.get("/latest", ThresholdsController.latest);

export default router;
