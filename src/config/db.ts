import mongoose from "mongoose";

const connectDB = async (uri: string) => {
  if (!uri) throw new Error("MONGO_URI is not defined");
  await mongoose.connect(uri, {});
  console.log("Connected to MongoDB");
};

export default connectDB;
