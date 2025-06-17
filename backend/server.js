import express from "express";
import dotenv from "dotenv";
import Question from "./Models/question.model.js";
import Test from "./Models/test.model.js";
import User from "./Models/user.model.js";
import Answer from "./Models/answer.model.js";
import cors from "cors";
import { Db } from "./utils/db.js";
import { validateAnswer } from "./Ai-Interviewer/validateAnswer.js";
import authRoutes from "./routes/auth.routes.js";
import aiRoutes from "./routes/ai.routes.js";
dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
app.use(authRoutes);
app.use(aiRoutes);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
  Db();
});
