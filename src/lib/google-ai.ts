import { GoogleGenerativeAI } from "@google/generative-ai";

export const getModel = (modelName: string = "gemini-1.5-flash") => {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GOOGLE_AI_API_KEY environment variable");
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: modelName });
};
