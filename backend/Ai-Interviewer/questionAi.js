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

console.log("🚀 Starting interview simulation...");

const llm = new ChatMistralAI({
  temperature: 0.7,
  apiKey: process.env.MISTRAL_API_KEY,
});

const interviewPrompt = new PromptTemplate({
  inputVariables: ["topic", "difficulty", "numberOfQuestions", "roundType"],
  template: `
  Generate {numberOfQuestions} {difficulty} {topic} questions for an interview.
  Make sure that the questions asked are to the point and easy to undestand. Don't ask questions which expect a lengthy answer.
  But make sure the questions require one to think before answering.
  Ask new questions every a prompt is triggered.
  Make it relevant for a professional interview setting. 
  Output the result in JSON format with proper key-value pairs.
  if the roundType is "english" then make sure the questions are related to communication skills, problem-solving approach, teamwork, leadership, or situational judgment and dont give an expected answer or else give an expected answer. Rather add the question ID.
  `,
});

export async function getQuestions(
  topic,
  difficulty,
  numberOfQuestions,
  roundType
) {
  const focus =
    roundType === "english"
      ? "communication skills, problem-solving approach, teamwork, leadership, or situational judgment"
      : `Technical QnAs about ${topic} and do not make it very verbose`;

  try {
    const formattedPrompt = await interviewPrompt.format({
      topic,
      difficulty,
      numberOfQuestions,
      roundType,
    });

    const response = await llm.invoke(formattedPrompt);
    return response;
  } catch (error) {
    console.log("❌ Error generating interview questions:", error);
  }
}
