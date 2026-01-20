import express from "express";
import {
  getTests,
  getRounds,
  evalTest,
} from "../controllers/tests.controller.js";
import { protectRoute } from "../middlewares/protectedRoute.js";
const router = express.Router();
router.post("/get-tests", getTests);
router.post("/get-rounds", getRounds);
router.post("/evaluate-test", protectRoute, evalTest);

export default router;
