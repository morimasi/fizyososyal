import type { GenerateMediaInput } from "@/types";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta";
const IMAGE_MODEL = "gemini-2.5-flash-image";

const aspectRatioMap = {
    "1:1": { width: 1080, height: 1080 },
    "4:5": { width: 1080, height: 1350 },
    "9:16": { width: 1080, height: 1920 },
};

export async function generatePhysioImage(input: GenerateMediaInput): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY || process.env.NANOBANANA_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY veya NANOBANANA_API_KEY eksik. Lütfen Vercel ayarlarından ekleyin.");
    }

    const enhancedPrompt = buildPhysioPrompt(input.prompt, input.style);

    console.log("[NANOBANANA/GEMINI] Görsel üretimi isteği:", { aspectRatio: input.aspectRatio, style: input.style });

    try {
        console.log("[NANOBANANA/GEMINI] API çağrısı yapılıyor...");
        // Use the exact endpoint provided by the user
        const response = await fetch(`${GEMINI_API_URL}/models/${IMAGE_MODEL}:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: `Generate an image of: ${enhancedPrompt}` }]
                }],
                generationConfig: {
                    // Try to suggest image output structure
                }
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`[NANOBANANA/GEMINI] API Hatası (${response.status}):`, errorBody);
            throw new Error(`Görsel servis hatası (${response.status}): ${response.statusText}`);
        }

        console.log("[NANOBANANA/GEMINI] Yanıt alındı, veri ayrıştırılıyor...");
        const data = await response.json();

        // Debug the candidates structure
        if (data.candidates?.[0]?.content?.parts) {
            const parts = data.candidates[0].content.parts;
            for (const part of parts) {
                if (part.inlineData) {
                    console.log(`[NANOBANANA/GEMINI] Görsel verisi bulundu (${part.inlineData.mimeType}).`);
                    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                }
                if (part.text) {
                    console.warn("[NANOBANANA/GEMINI] API metin döndürdü:", part.text.substring(0, 100));
                }
            }
        }

        // Fallback or secondary checks
        const imageUrl = data.url || data.images?.[0]?.url;
        if (imageUrl) return imageUrl;

        console.error("[NANOBANANA/GEMINI] Geçerli görsel verisi bulunamadı:", JSON.stringify(data).substring(0, 500));
        throw new Error("Görsel üretilemedi, API'den görsel verisi yerine metin döndü. Lütfen model ayarlarını veya kotanızı kontrol edin.");
    } catch (error: any) {
        console.error("[NANOBANANA/GEMINI] Beklenmedik hata:", error.message);
        throw error;
    }
}

function buildPhysioPrompt(base: string, style?: string): string {
    const physioContext =
        "anatomically accurate physiotherapy exercise illustration, " +
        "professional medical setting, clean bright studio, " +
        "experienced physiotherapist, patient engagement, ";

    const styleContext =
        style === "infographic"
            ? "infographic style, bold text labels, educational, clean design"
            : "photorealistic, professional photography, well-lit, modern clinic";

    return `${physioContext}${base}, ${styleContext}`;
}

export async function addLogoWatermark(imageUrl: string, logoUrl: string): Promise<string> {
    console.warn("[NANOBANANA/GEMINI] Logo watermark servisi devre dışı.");
    return imageUrl;
}
