import mongoose from "mongoose";

const testSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  Score:{
    type:Number,
  },
  questions:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Question",
  },
  answers:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Answer",
  }
  
});

const Test = mongoose.model("Test", testSchema);

export default Test;
