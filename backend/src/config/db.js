import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/brain";
  try {
    await mongoose.connect(uri);
    console.log("[Brain] MongoDB connected");
  } catch (err) {
    console.error("[Brain] MongoDB connection failed:", err.message);
    console.warn("[Brain] Continuing without persistence — chats won't be saved.");
  }
}
