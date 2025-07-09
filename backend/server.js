import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { Db } from "./utils/db.js";
import authRoutes from "./routes/auth.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import cookieParser from "cookie-parser";
import { app, server } from "./utils/socket.io.js";
dotenv.config();
const PORT = process.env.PORT;
app.use(express.json({ limit: "10mb" })); // Adjust the limit as per your requirement
app.use(express.urlencoded({ limit: "10mb", extended: true })); // Adjust the limit as per your requirement
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use("/api/auth", authRoutes);
app.use(aiRoutes);
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  Db();
});
