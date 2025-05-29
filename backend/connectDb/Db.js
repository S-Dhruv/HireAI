import mongoose from "mongoose";

export const Db = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("connected to db");
  } catch (err) {
    console.log(err);
  }
};
