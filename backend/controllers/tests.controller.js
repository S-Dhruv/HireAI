import axios from "axios";
import User from "../models/user.model.js";
import { ChatMistralAI } from "@langchain/mistralai";
import { PromptTemplate } from "@langchain/core/prompts";
export const getTests = async (req, res) => {
  try {
    console.log("r", req.body);
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ message: "Invalid Request" });
    }
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const tests = user.tests;
    res.status(200).json(tests);
  } catch (error) {
    console.error("Error fetching rounds:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getRounds = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ message: "Invalid Request" });
    }
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const tests = user.tests;
    if (!tests || tests.length === 0) {
      return res.status(404).json({ message: "No tests found for this user" });
    }
    const rounds = tests.flatMap((test) => test.rounds);
    if (!rounds || rounds.length === 0) {
      return res.status(404).json({ message: "No rounds found for this user" });
    }
    res.status(200).json(rounds);
  } catch (error) {
    console.error("Error fetching rounds:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const evalTest = async (req, res) => {
  try {
    const userId = req.user._id;
    const { testIndex, roundIndex, roundType, answers } = req.body;

    const user = await User.findById(userId);
    const round = user.tests[testIndex].rounds[roundIndex];

    if (round.status === true) {
      return res.status(400).json({ message: "Round already completed" });
    }

    let score = null;
    let feedback = null;

    if (round.isScorable && roundType === "Aptitude Round") {
      score = 0;
      for (const q of round.questions) {
        if (answers[q._id] === q.correctAnswer) {
          score++;
        }
      }
      round.score = score;
    }

    if (!round.isScorable && roundType === "Telephonic Round") {
      const llm = new ChatMistralAI({
        temperature: 0.2,
        apiKey: process.env.MISTRAL_API_KEY,
      });
      const formattedQA = round.questions
        .map((q, index) => {
          const ans = answers[q._id] || "No answer provided";
          return `Question ${index + 1}:
        ${q.question}Answer: ${ans}`;
        })
        .join("\n");

      console.log(formattedQA);
      const prompt = `
You are a senior technical interviewer at a top-tier product company.

Evaluate the following telephonic interview responses professionally and critically.

Be realistic. Do NOT overpraise. Do NOT be overly harsh.
Assume this is a real hiring evaluation.

For your evaluation, provide:

1. Communication & Clarity (clear, concise, structured or not?)
2. Technical/Conceptual Depth (if applicable)
3. Strengths (bullet points)
4. Areas of Improvement (bullet points with specific suggestions)
5. Hiring Signal (Strong Hire / Hire / Lean Hire / Lean Reject / Reject)
6. A short final summary paragraph as an interviewer would write internally.

Keep the tone professional and structured.
Do not repeat the full questions.
Do not restate answers.
Focus on evaluation only.

Responses:
${formattedQA}
`;

      const response = await llm.invoke(prompt);

      feedback = response?.content || "No feedback generated.";
      round.feedback = feedback;
    }
    round.status = true;
    await user.save();
    res.json({ success: true, score, feedback });
  } catch (error) {
    console.error("eval test controller", error);
    res.status(500).json({ message: "Evaluation failed" });
  }
};
