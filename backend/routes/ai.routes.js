import express from "express";
import {
  //   answers,
  createTest,
  //   questions,
} from "../controllers/ai.controller.js";
const router = express.Router();

// router.post("/questions", questions);
// router.post("/answers", answers);
// router.post("/test", answers);
router.post("/create-rounds", createTest);
export default router;
