import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import connectDB from "./config/db";

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

async function start() {
  await connectDB(process.env.MONGO_URI || "mongodb://localhost:27017/number_discussions");
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start", err);
  process.exit(1);
});
