const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testOptimize() {
    console.log("Testing Prompt Optimization Logic...");
    const topic = "bel ağrısı için egzersizler";

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Lütfen şu konuyu ultra-profesyonel bir prompta dönüştür, zenginleştir ve asla kısa kesme: "${topic}"`;

        const result = await model.generateContent(prompt);
        console.log("Original Topic:", topic);
        console.log("Optimized Result:", result.response.text().trim());
    } catch (err) {
        console.error("Test Error:", err.message);
    }
}

testOptimize();
