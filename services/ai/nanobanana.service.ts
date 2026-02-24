import type { GenerateMediaInput } from "@/types";

const NANOBANANA_API_URL = process.env.NANOBANANA_API_URL ?? "https://nanobananavideo.com/api/v1";

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
    const apiKey = getNanoBananaApiKey();
    const dimensions = aspectRatioMap[input.aspectRatio] || aspectRatioMap["1:1"];
    const enhancedPrompt = buildPhysioPrompt(input.prompt, input.style);

    console.log("[NANOBANANA] Görsel üretimi isteği:", { aspectRatio: input.aspectRatio, style: input.style });
    console.log(`[NANOBANANA] Prompt (ön izleme): "${enhancedPrompt.substring(0, 50)}..."`);

    try {
        console.log("[NANOBANANA] API çağrısı yapılıyor...");
        const response = await fetch(`${NANOBANANA_API_URL}/generate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                prompt: enhancedPrompt,
                width: dimensions.width,
                height: dimensions.height,
                style: input.style ?? "realistic-medical",
                num_outputs: 1,
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`[NANOBANANA] API Hatası (${response.status}):`, errorBody);
            throw new Error(`Görsel servis hatası (${response.status}): ${response.statusText}`);
        }

        console.log("[NANOBANANA] Yanıt alındı, veri ayrıştırılıyor...");
        const data = await response.json();
        const imageUrl = data.images?.[0]?.url ?? data.url;

        if (!imageUrl) {
            console.error("[NANOBANANA] API yanıtında görsel bulunamadı:", data);
            throw new Error("Görsel üretilemedi, API'den URL dönmedi.");
        }

        console.log("[NANOBANANA] Görsel başarıyla üretildi.");
        return imageUrl;
    } catch (error: any) {
        console.error("[NANOBANANA] Beklenmedik hata:", error.message);
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
    const apiKey = getNanoBananaApiKey();
    const response = await fetch(`${NANOBANANA_API_URL}/edit`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            image_url: imageUrl,
            overlay_url: logoUrl,
            overlay_position: "bottom-right",
            overlay_size: 0.15,
            overlay_opacity: 0.85,
        }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error(`[AI-Studio] Logo Ekleme Hatası (${response.status}):`, errorBody);
        throw new Error(`Logo ekleme hatası: ${response.statusText}`);
    }

    const data = await response.json();
    return data.result_url;
}
