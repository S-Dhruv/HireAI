import { getQuestions } from "../Ai-Interviewer/questionAi.js";
export const questions = async (req, res) => {
  try {
    const { topic, difficulty, numberOfQuestions, roundType, TestId } =
      req.body;
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
  } catch (error) {
    console.log(error.message);
  }
};
export const answers = async (req, res) => {
  try {
    const { question, testId } = req.body;

    const answer = [
      "I dont know",
      "I had a direct conversation to understand the issue and then redefined their responsibilities to match their strengths.",
      "I um think we should hear maybe the both parties and then decide i guess",
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
  } catch (error) {
    console.log(error.message);
  }
};

export const test = async (req, res) => {
  try {
    const { user } = req.body;
    if (!user) {
      return res.json({ message: "User not found" });
    }
    const test = new Test({
      user: user,
      Score: 0,
    });
    await test.save();
    res.json(test);
  } catch (error) {
    console.log(error.message);
  }
};
