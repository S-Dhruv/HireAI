import axios from "axios";
import fs from "fs-extra";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import path from "path";

ffmpeg.setFfmpegPath(ffmpegPath);

const baseUrl = "https://api.assemblyai.com";

const apiKey = "7c33904d8d7f4b14a411c77f1ae85bd7"; // Temporarily hardcoded for testing

console.log(
  "AssemblyAI Key loaded:",
  apiKey ? `${apiKey.substring(0, 10)}...` : "MISSING",
);

const headers = {
  authorization: apiKey,
};

export async function transcribeAudio(inputPath) {
  // ✅ FIX: Create a DIFFERENT output filename
  const parsedPath = path.parse(inputPath);
  const wavPath = path.join(parsedPath.dir, parsedPath.name + "-converted.wav");

  console.log("📂 File paths:", {
    input: inputPath,
    output: wavPath,
  });

  try {
    console.log("🔄 Converting to WAV:", inputPath);

    // 1️⃣ Convert to WAV with timeout
    await Promise.race([
      new Promise((resolve, reject) => {
        ffmpeg(inputPath)
          .toFormat("wav")
          .audioChannels(1)
          .audioFrequency(16000)
          .on("start", (cmd) => {
            console.log("FFmpeg command:", cmd);
          })
          .on("end", () => {
            console.log("✅ FFmpeg conversion complete");
            resolve();
          })
          .on("error", (err) => {
            console.error("❌ FFmpeg error:", err);
            reject(err);
          })
          .save(wavPath);
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("FFmpeg timeout after 30s")), 30000),
      ),
    ]);

    // ✅ Validate output exists and has content
    const stats = await fs.stat(wavPath);
    console.log("📊 Converted WAV size:", stats.size, "bytes");

    if (stats.size === 0) {
      throw new Error("FFmpeg produced empty WAV file");
    }

    if (stats.size < 1000) {
      throw new Error(`Converted audio too short: ${stats.size} bytes`);
    }

    // 2️⃣ Upload WAV to AssemblyAI
    console.log("📤 Uploading to AssemblyAI...");
    const audioData = await fs.readFile(wavPath);

    const uploadResponse = await axios.post(`${baseUrl}/v2/upload`, audioData, {
      headers: {
        ...headers,
        "content-type": "application/octet-stream",
      },
    });

    const uploadUrl = uploadResponse.data.upload_url;
    console.log("✅ Upload complete:", uploadUrl);

    // 3️⃣ Create transcription job
    console.log("🎯 Creating transcription job...");
    const transcriptResponse = await axios.post(
      `${baseUrl}/v2/transcript`,
      {
        audio_url: uploadUrl,
        speech_model: "best", // Use "best" for higher accuracy
      },
      { headers },
    );

    const transcriptId = transcriptResponse.data.id;
    console.log("📝 Transcript ID:", transcriptId);

    // 4️⃣ Poll until complete with timeout
    const maxPolls = 60; // 3 minutes max
    let polls = 0;

    while (polls < maxPolls) {
      const polling = await axios.get(
        `${baseUrl}/v2/transcript/${transcriptId}`,
        { headers },
      );

      console.log(
        `⏳ Polling ${polls + 1}/${maxPolls} - Status: ${polling.data.status}`,
      );

      if (polling.data.status === "completed") {
        console.log("✅ Transcription complete!");

        // Clean up both files
        await fs.remove(inputPath);
        await fs.remove(wavPath);

        return polling.data.text;
      }

      if (polling.data.status === "error") {
        throw new Error(polling.data.error || "AssemblyAI transcription error");
      }

      await new Promise((r) => setTimeout(r, 3000));
      polls++;
    }

    throw new Error("Transcription polling timeout after 3 minutes");
  } catch (error) {
    console.error("❌ Transcription service error:", error);

    // Clean up files on any error
    await fs.remove(inputPath).catch(() => {});
    await fs.remove(wavPath).catch(() => {});

    throw error;
  }
}
