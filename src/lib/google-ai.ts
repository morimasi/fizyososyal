import { GoogleGenerativeAI } from "@google/generative-ai";

export const getModel = (modelName: string = "gemini-2.0-flash") => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY environment variable");
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: modelName });
};
