// import dotenv from "dotenv";
// import { ChatMistralAI } from "@langchain/mistralai";
// import { PromptTemplate } from "@langchain/core/prompts";

// if (!process.env.MISTRAL_API_KEY) {
//   console.error("❌ MISTRAL_API_KEY not found in environment variables");
//   console.error(
//     "📝 Create a .env file with: MISTRAL_API_KEY=your_api_key_here"
//   );
//   process.exit(1);
// }

// console.log("🚀 Starting interview simulation...");

// const llm = new ChatMistralAI({
//   temperature: 0.7,
//   apiKey: process.env.MISTRAL_API_KEY,
// });

// const interviewPrompt = new PromptTemplate({
//   inputVariables: ["description"],
//   template: `
//   **I am using you for my interview prep**.For the given input, gather the information about the company (if there is a name mentioned), and after that i want you to generate all the
//   interview rounds that are required for the given input.
//   Consider all the information with atmost care while generating the interview rounds.I want no mistakes to be done and give what they have asked for.If you can browse the web regarding the company and its hiring style or any other things
//   const answerSchema = new mongoose.Schema({
//     a_answer: String,
//     c_answer: String,
//   });
//   const questionSchema = new mongoose.Schema({
//     question: String,
//   });

//   const roundSchema = new mongoose.Schema({
//     description: String,
//     roundType: {
//       type: String,
//       enum: [
//         "Aptitude Round",
//         "Technical Round",
//         "Telephonic Round",
//         "DSA Round",
//         "HR Round",
//       ],
//     },
//     isScorable: Boolean,
//     questions: [questionSchema],
//     answers: [answerSchema],
//     score: Number,
//     feedback: String,
//   });

//   const testSchema = new mongoose.Schema({
//     testName: String,
//     numberOfRounds: Number,
//     rounds: [roundSchema],
//   });
//   this is my db schema for the interview rounds and questions.
//   I want you to generate data such that i should be able to use it in my database.
//   I want you to generate the interview rounds based on the input given below.
//   The input is as follows:
//   {description}
//   I WANT YOU TO GENERATE THE INTERVIEW ROUNDS IN A JSON FORMAT.
//   For the Aptitude adn English rounds, I want you to generate questions that are related to the topic and difficulty level mentioned, if there isnt any generate what fits the best.
//   For the Technical round, I want you to generate questions that are related to the topics that are mentioned in the description, if there arent any generate questions on the CS Fundamentals
//   For these 2 rounds (Aptitude and Technical), I want you to generate the questions in the following format:
//   {
//     "question": "What is the next number in the sequence: 2, 4, 6, 8?",
//     "options": ["10", "12", "14", "16"],
//     "correctAnswer": "10"
//   }

//   For the telephonic round, I want you to generate questions that are related to the CS Fundamentals and if there is some data mentioned about the projects that are mentioned in the description, i want you to ask questions on them too.
//   For this round i want the output to be in the following format:
//   {
//     "question": "Explain the concept of polymorphism in object-oriented programming.",
//     "options": [],
//     "correctAnswer": "Polymorphism allows methods to do different things based on the object it is acting upon, enabling a single interface to represent different underlying forms (data types)."
//   }
//   For the DSA round, I want you to generate a Data Structures and Algorithms Problems
//   Give me the problem description of it, i want you to include the problem description, constraints, couple of sample test cases and also, as you do for the aptitude rounds, here the options are supposed to be the testcases and at the end give me the correct answer for them.
//   For this round the format should be:
//   {
//     "question": "Give all the data that i have asked for like the description, constraints, and sample test cases
//     "options": [test cases]
//     "correctAnswer": [answers for the test cases],
//   }
//   And for the HR Dont do anything, just leave it!
//     `,
// });
