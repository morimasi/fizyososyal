const { optimizePhysioPrompt } = require("./services/ai/gemini.service");
require("dotenv").config();

async function test() {
    console.log("Testing optimizePhysioPrompt...");
    try {
        const topic = "bel ağrısı için egzersizler";
        const result = await optimizePhysioPrompt(topic);
        console.log("Result:", result);
    } catch (err) {
        console.error("Error:", err);
    }
}

test();
