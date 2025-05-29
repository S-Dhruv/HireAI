import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
  answers: [
    {
      type: String,
      required: true,
    },
  ],
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question",
  },
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Test",
  },
});

const Answer = mongoose.model("Answer", answerSchema);

export default Answer;
