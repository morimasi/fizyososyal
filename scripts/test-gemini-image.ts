import { GoogleGenerativeAI } from "@google/generative-ai";

async function run() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  try {
    console.log("Testing gemini-2.5-flash-image...");
    const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash-image" });
    const result = await model.generateContent("A cute physical therapist puppy");
    console.log("Success! Output:", JSON.stringify(result.response, null, 2));
  } catch (e: any) {
    console.error("Error:", e.message);
  }
}

run();