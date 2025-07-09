import mongoose from "mongoose";

export const Db = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("connected to DB");
  } catch (err) {
    console.log(err);
  }
};
