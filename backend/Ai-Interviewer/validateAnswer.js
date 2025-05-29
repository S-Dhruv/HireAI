import dotenv from "dotenv";
dotenv.config();
import { ChatMistralAI } from "@langchain/mistralai";
import { PromptTemplate } from "@langchain/core/prompts";

if (!process.env.MISTRAL_API_KEY) {
  console.error("❌ MISTRAL_API_KEY not found in environment variables");
  console.error(
    "📝 Create a .env file with: MISTRAL_API_KEY=your_api_key_here"
  );
  process.exit(1);
}

// console.log("🚀 Starting interview simulation...");

const llm = new ChatMistralAI({
  temperature: 0.7,
  apiKey: process.env.MISTRAL_API_KEY,
});

const interviewPrompt = new PromptTemplate({
  inputVariables: ["questions","answer"],
  template: `
  You are given two arrays:
  1. An array of questions. => {questions}
  2. An array of answers. => {answer}
  Your task is to compare the answers with the questions and give the score.
  The score is calculated by comparing the answers with the questions and giving the score.
  Read the questions and come up with a estimate answer then compare it with the answers.
  Give a total score out of 100.
  And point out what you think is wrong and what you think is right.
  
  If the questions seems to be english round then look out for filler words and non english words, observe grammar and then score based on that as well.
  If the questions seems techincal round then just look out for the correctness
  Give me the output in this format:
  
    Totalscore: Average score ,
    question: "The question",
    yourAnswer: "Your answer",
    correctAnswer: "The correct answer",
    yourScore: score for that quesion,
    explanation: "Your explanation here",
  

  Do these for all the questions
    At the end return the score like this "End Score: number"

  `,
});

export async function validateAnswer(
  questions,
  answer
) {
  try {
    const formattedPrompt = await interviewPrompt.format({
        questions,
        answer
    });
    const response = await llm.invoke(formattedPrompt);
    return response;
  } catch (error) {
    console.log("❌ Error generating interview questions:", error);
  }
}
