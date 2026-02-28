async function run() {
  try {
    console.log("Testing Hugging Face...");
    const res = await fetch(
      "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-3.5-large",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: "A cute dog as a physical therapist",
        }),
      }
    );
    if (!res.ok) {
      console.log("HF Error:", res.status, await res.text());
    } else {
      console.log("HF Success!");
    }
  } catch (e: any) {
    console.error("HF exception:", e.message);
  }
}
run();