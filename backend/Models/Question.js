import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question:[
    {
      type:String,
      required:true,
    }
  ],
  testId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Test",
  }
});

const Question = mongoose.model("Question", questionSchema);

export default Question;
