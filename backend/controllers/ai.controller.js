import dotenv from "dotenv";
import { ChatMistralAI } from "@langchain/mistralai";
import { PromptTemplate } from "@langchain/core/prompts";
import User from "../models/user.model.js";
export const createTest = async (req, res) => {
  const llm = new ChatMistralAI({
    temperature: 0.7,
    apiKey: process.env.MISTRAL_API_KEY,
  });
  console.log(process.env.MISTRAL_API_KEY);

  const interviewPrompt = new PromptTemplate({
    inputVariables: ["description"],
    template: `
You are an AI system for interview preparation.

Given the following user description, generate interview rounds and questions in raw, clean JSON. Do not include formatting (like asterisks **, markdown blocks, or backticks). Only return a valid JSON object.

Use the following schema structure:
{{
  "testName": "string",
  "numberOfRounds": number,
  "rounds": [
    {{
      "description": "string",
      "roundType": "Aptitude Round" | "Technical Round" | "Telephonic Round" | "DSA Round" | "HR Round",
      "isScorable": boolean,
      "questions": [
        {{
          "question": "string",
          "options": ["string", ...],
          "correctAnswer": "string"
        }}
      ],
      "answers": [],
      "score": 0,
      "feedback": ""
    }}
  ]
}}

Use this format:
1. Aptitude & Technical: include options and correctAnswer.
2. Telephonic: only question and correctAnswer (no options).
3. DSA: include description, constraints, test cases in question. Options = test cases, correctAnswer = expected outputs.
4. HR: leave round empty or omit.

INPUT:
{description}
`,
  });

  try {
    const { description, id } = req.body;

    if (!description || !id) {
      return res.status(400).json({ message: "Invalid Input" });
    }

    const formattedPrompt = await interviewPrompt.format({ description });
    const response = await llm.invoke(formattedPrompt);
    let rawText = response?.content || "";
    console.log("Raw LLM Response:\n", rawText);

    const match = rawText.match(/({[\s\S]*})/);
    if (!match) {
      return res
        .status(500)
        .json({ message: "No JSON found in model response" });
    }

    const jsonString = match[1];
    const parsed = JSON.parse(jsonString);

    const formattedTest = {
      testName: parsed.testName,
      numberOfRounds: parsed.numberOfRounds,
      rounds: parsed.rounds.map((round) => ({
        description: round.description,
        roundType: round.roundType,
        isScorable: round.isScorable,
        score: round.score || 0,
        feedback: round.feedback || "",
        qnASchema: (round.questions || []).map((q) => ({
          question: q.question,
          options: q.options || [],
          correctAnswer: q.correctAnswer || "",
        })),
      })),
    };

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.tests.push(formattedTest);
    await user.save();

    console.log("✅ Interview Test Created:", formattedTest);
    return res.status(200).json({ message: "Interview Test Created" });
  } catch (error) {
    console.log("❌ Error generating interview questions:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
