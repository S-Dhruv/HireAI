import express from "express";
import { getTests, getRounds } from "../controllers/tests.controller.js";
const router = express.Router();
router.post("/get-tests", getTests);
router.post("/get-rounds", getRounds);

export default router;
