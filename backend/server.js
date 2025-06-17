import express from "express";
import dotenv from "dotenv";
import { getQuestions } from "./Ai-Interviewer/questionAi.js";
import mongoose from "mongoose";
import Question from "./Models/Question.js";
import Test from "./Models/Test.js";
import User from "./Models/User.js";
import Answer from "./Models/Answer.js";
import cors from "cors";
import { Db } from "./connectDb/Db.js";
import { validateAnswer } from "./Ai-Interviewer/validateAnswer.js";
dotenv.config();
Db();
const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());
app.post("/ai/register", async (req, res) => {
  const { name, email, password } = req.body;
  const exist = await User.findOne({ email: email });
  if (exist) {
    return res.json({ message: "User already exists" });
  }
  const user = new User({
    name: name,
    email: email,
    password: password,
  });
  await user.save();
  res.json(user);
});
app.post("/ai/test", async (req, res) => {
  const { user } = req.body;
  // const exist = Test.findOne({user:user});
  if (!user) {
    return res.json({ message: "User not found" });
  }
  const test = new Test({
    user: user,
    Score: 0,
  });
  await test.save();
  const currentUser = await User.findById(user);
  currentUser.tests.push(test._id);
  await currentUser.save();
  res.json(test);
});
app.post("/ai/question", async (req, res) => {
  const { topic, difficulty, numberOfQuestions, roundType, TestId } = req.body;
  const questions = await getQuestions(
    topic,
    difficulty,
    numberOfQuestions,
    roundType
  );
  console.log("Raw questions response:", questions);
  const requiredData = questions.content;
  const matches = requiredData.match(/```json\n([\s\S]*?)\n```/)[1];
  const parsedData = JSON.parse(matches);
  console.log("Parsed data structure:", JSON.stringify(parsedData, null, 2));

  let questionsArray = [];

  if (!parsedData.questions) {
    console.error("Error: parsedData.questions is undefined");

    if (Array.isArray(parsedData)) {
      parsedData.forEach((item) => {
        if (item.question) questionsArray.push(item.question);
      });
    } else {
      Object.keys(parsedData).forEach((key) => {
        if (
          key.toLowerCase().includes("question") &&
          Array.isArray(parsedData[key])
        ) {
          parsedData[key].forEach((item) => {
            if (typeof item === "string") questionsArray.push(item);
            else if (item.question) questionsArray.push(item.question);
          });
        } else if (
          typeof parsedData[key] === "string" &&
          key.toLowerCase().includes("question")
        ) {
          questionsArray.push(parsedData[key]);
        }
      });
    }
  } else {
    questionsArray = parsedData.questions.map((item) => item.question);
  }

  console.log("Final questions array:", questionsArray);
  const question = new Question({
    testId: TestId,
    question: questionsArray,
  });
  await question.save();
  console.log(question);
  res.json(parsedData);
});
app.post("/ai/answer", async (req, res) => {
  const { question, testId } = req.body;
  //comment the below line and destruct the answer from the req.body
  const answer = [
    "== is used to check strings equality and .equals is used to check objects equality.",
    "Garbage collection is used to free up memory after its use, this include objects,arrays,functions which are no longer in use",
    "Final ensured that the value of a variable is not changed after its declaration.",
  ];
  const answers = new Answer({
    question: question,
    answers: answer,
    testId: testId,
  });
  await answers.save();
  const questions = await Question.findOne({ testId: testId });

  const validate = await validateAnswer(questions, answer);
  console.log(validate.content);
  const text = validate.content;
  const match = text.match(/End Score:\s*([\d.]+)/);
  // const score = -1
  if (match) {
    const score = match[1];
    console.log("Average Score is:", score);
    const currentTest = await Test.findById(testId);
    currentTest.Score = score;
    await currentTest.save();
    res.json(currentTest);
  } else {
    console.log("Average Score not found");
    res.json(validate);
  }

  // res.json(currentTest);
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
