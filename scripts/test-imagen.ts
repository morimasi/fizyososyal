import { GoogleGenerativeAI } from "@google/generative-ai";

async function run() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  try {
    const model = genAI.getGenerativeModel({ model: "models/imagen-4.0-generate-001" });
    const result = await model.generateContent("A cute physical therapist puppy");
    console.log(result.response.text());
  } catch (e: any) {
    console.error("Imagen 4 error:", e.message);
  }
}

run();