import { GoogleGenerativeAI } from "@google/generative-ai";

// Gemini 2.0 Flash Thinking - Multimodal ve Akıl Yürütme yeteneği en yüksek model
export const getModel = (modelName: string = "gemini-2.0-flash-thinking-exp-01-21") => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY environment variable");
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: modelName });
};
