import { GoogleGenerativeAI } from "@google/generative-ai";

// Gemini 2.0 Flash - En hızlı ve multimodal yeteneği en yüksek ücretsiz deneme sürümü
export const getModel = (modelName: string = "gemini-2.0-flash-exp") => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY environment variable");
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: modelName });
};
