import type { GenerateMediaInput } from "@/types";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta";
const IMAGE_MODEL = "gemini-2.5-flash-image";

const aspectRatioMap = {
    "1:1": { width: 1080, height: 1080 },
    "4:5": { width: 1080, height: 1350 },
    "9:16": { width: 1080, height: 1920 },
};

const getNanoBananaApiKey = () => {
    const apiKey = process.env.NANOBANANA_API_KEY;
    if (!apiKey) {
        throw new Error("NANOBANANA_API_KEY eksik. Lütfen Vercel ayarlarından ekleyin.");
    }
    return apiKey;
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
        const response = await fetch(`${GEMINI_API_URL}/models/${IMAGE_MODEL}:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: enhancedPrompt }]
                }],
                generationConfig: {
                    // Gemini Image specific configs if any, keeping it simple for now
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

        // Gemini'nin görsel döndürme yapısına göre URL veya base64 ayıkla
        // Şimdilik URL döndüğünü varsayıyoruz veya data yapısını kontrol ediyoruz
        const imageUrl = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data
            ? `data:image/png;base64,${data.candidates[0].content.parts[0].inlineData.data}`
            : data.url; // Eğer servis bir URL dönüyorsa

        if (!imageUrl) {
            console.error("[NANOBANANA/GEMINI] API yanıtında görsel bulunamadı:", JSON.stringify(data).substring(0, 200));
            throw new Error("Görsel üretilemedi, API'den geçerli veri dönmedi.");
        }

        console.log("[NANOBANANA/GEMINI] Görsel başarıyla üretildi.");
        return imageUrl;
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
    console.warn("[NANOBANANA/GEMINI] Logo watermark servisi şu an devre dışı (Gemini API'ye geçiş nedeniyle).");
    return imageUrl; // Fallback to original image
}
