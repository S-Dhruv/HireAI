import express from "express";
import { answers, questions } from "../controllers/ai.controller.js";
const router = express.Router();

router.post("/questions", questions);
router.post("/answers", answers);
router.post("/test", answers);

export default router;
