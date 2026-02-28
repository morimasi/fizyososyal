import { put } from "@vercel/blob";

async function run() {
  try {
    console.log("Fetching image from Pollinations...");
    const prompt = "A clean minimalist office environment with a physical therapist, highly detailed";
    const res = await fetch("https://image.pollinations.ai/prompt/" + encodeURIComponent(prompt), {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    
    if (!res.ok) {
      throw new Error("Failed to fetch from Pollinations: " + res.status + " " + res.statusText);
    }

    console.log("Image fetched. Type:", res.headers.get("content-type"));
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log("Buffer size:", buffer.length);
  } catch (e: any) {
    console.error("Error:", e.message);
  }
}

run();