import mongoose from "mongoose";
const answerSchema = new mongoose.Schema({
  a_answer: String,
  c_answer: String,
});
const questionSchema = new mongoose.Schema({
  question: String,
});

const roundSchema = new mongoose.Schema({
  description: String,
  roundType: {
    type: String,
    enum: [
      "Aptitude Round",
      "Telephonic Round",
      "DSA Round",
      "Technical Round",
      "HR Round",
    ],
  },
  isScorable: Boolean,
  questions: [questionSchema],
  answers: [answerSchema],
  score: Number,
  feedback: String,
});

const testSchema = new mongoose.Schema({
  testName: String,
  numberOfRounds: Number,
  rounds: [roundSchema],
});

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  role: {
    type: String,
    enum: ["Interviewee", "Interviewer"],
  },
  tests: [testSchema],
  interviewerProfile: {
    expertise: [String],
    availability: {
      days: [String],
    },
    bio: String,
    ratings: [Number],
  },
});
const User = mongoose.model("User", userSchema);
export default User;
