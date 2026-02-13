import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs-extra";
import { transcribeAudio } from "../services/transcribe.service.js";

const router = express.Router();

// ✅ FIX: Use original file extension, not hardcoded .webm
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // Use original extension from uploaded file
    const ext = path.extname(file.originalname) || ".wav";
    cb(null, "audio-" + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files only
    if (file.mimetype.startsWith("audio/")) {
      cb(null, true);
    } else {
      cb(new Error("Only audio files are allowed"));
    }
  },
});

router.post("/transcribe", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No audio file uploaded",
      });
    }

    console.log("📥 File received:", {
      path: req.file.path,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

    // ✅ FIX: Validate file size before processing
    if (req.file.size < 1000) {
      // Clean up the tiny file
      await fs.remove(req.file.path).catch(() => {});

      return res.status(400).json({
        success: false,
        error:
          "Audio duration is too short. Please record at least 2 seconds of audio.",
      });
    }

    const transcript = await transcribeAudio(req.file.path);

    res.json({
      success: true,
      transcript,
    });
  } catch (error) {
    console.error("❌ Transcription error:", error);

    // Clean up file on error
    if (req.file?.path) {
      await fs.remove(req.file.path).catch(() => {});
    }

    res.status(500).json({
      success: false,
      error: error.message || "Transcription failed",
    });
  }
});

export default router;
