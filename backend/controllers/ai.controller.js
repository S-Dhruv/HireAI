import dotenv from "dotenv";
import { ChatMistralAI } from "@langchain/mistralai";
import { PromptTemplate } from "@langchain/core/prompts";
import User from "../models/user.model.js";
export const createTest = async (req, res) => {
  const llm = new ChatMistralAI({
    temperature: 0.7,
    apiKey: process.env.MISTRAL_API_KEY,
  });
  // console.log(process.env.MISTRAL_API_KEY);

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
      "status" : boolean
      "score": 0,
      "feedback": ""
    }}
  ]
}}

Rules:
1. **Aptitude Round** → focus on advanced logical reasoning, probability, optimization, data interpretation. If the number of questions are mentioned in the input then generated them accordingly, however the default questions (if not mentioned in the description/input variables) generate 10 questions.  
   Example: "A train leaves Station A at 60km/h, another leaves Station B... When will they meet?"  
2. **Technical Round** → deep CS fundamentals (OS, DBMS, Networking, System Design). Avoid trivial syntax questions.  
3. **Telephonic Round** → scenario-based and based on the inputs, if number of questions are mentioned in the input itself then you just generate those many questions, if not then default give me with 10 questions (e.g., debugging a distributed system crash, tradeoffs in architecture).  
4. **DSA Round** → medium-hard to hard coding challenges. Each question must include:
   - Problem description
   - Constraints
   - Input/Output format
   - Example test cases
5. **HR Round** → real behavioral questions.  
   Example: "Describe a time when you disagreed with your manager. How did you resolve it?"
6. If the number of questions are not specified, default to 10 questions per round.
Constraints:
- No trivial questions like "area of a square" or "2+2".  
- Every round must include a mix of easy, medium, and hard.  
- Questions must simulate **real interview difficulty**.  
- Return **only raw JSON**, no explanations or markdown. 
7. If the company's name is present in the description then in the testName part of the return json format use it , if not use a default name.

    ""IF THE INPUT THAT IS GIVEN IS NOT VAILD PREPARATION PROMT : return a json object with a string message property with value "Invalid Input""
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
    if (parsed.message && parsed.message === "Invalid Input") {
      return res.status(400).json({ message: "Invalid Input" });
    }
    const formattedTest = {
      testName: parsed.testName,
      numberOfRounds: parsed.numberOfRounds,
      rounds: parsed.rounds.map((round) => ({
        description: round.description,
        roundType: round.roundType,
        isScorable: round.isScorable,
        status: round.status,
        score: round.score || 0,
        feedback: round.feedback || "",
        questions: (round.questions || []).map((q) => ({
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

    console.log("Interview Test Created:", formattedTest);
    return res.status(200).json({ parsed, message: "Interview Test Created" });
  } catch (error) {
    console.log("Error generating interview questions:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const evaluateTelephonic = async (req, res) => {
  try {
    const { testIndex, roundIndex, roundType, answers } = req.body;
    const userId = req.user._id;

    if (!answers || roundType !== "Telephonic Round") {
      return res.status(400).json({ message: "Invalid request" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const round = user.tests[testIndex].rounds[roundIndex];

    if (round.status === true) {
      return res.status(400).json({ message: "Round already completed" });
    }

    // 🔹 Build formatted Q&A string
    const formattedQA = round.questions
      .map((q, index) => {
        const ans = answers[q._id] || "No answer provided";
        return `Q${index + 1}: ${q.question}\nAnswer: ${ans}\n`;
      })
      .join("\n");

    const llm = new ChatMistralAI({
      temperature: 0.3,
      apiKey: process.env.MISTRAL_API_KEY,
    });

    const evaluationPrompt = `
You are an expert interview evaluator.

Evaluate the following telephonic interview responses.

Provide:
1. Overall communication quality
2. Clarity of responses
3. Strengths
4. Areas of improvement
5. Final summary paragraph

Responses:
${formattedQA}
`;

    const response = await llm.invoke(evaluationPrompt);
    const feedback = response?.content || "No feedback generated.";

    round.feedback = feedback;
    round.status = true;

    await user.save();

    return res.status(200).json({
      message: "Telephonic round evaluated successfully",
      feedback,
    });
  } catch (error) {
    console.error("Telephonic evaluation error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
