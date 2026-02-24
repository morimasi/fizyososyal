import type { GenerateMediaInput } from "@/types";

const NANOBANANA_API_URL = process.env.NANOBANANA_API_URL ?? "https://api.nanobanana.io/v1";

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

    console.log(`[AI-Studio] Görsel üretimi başlıyor: Prompt: "${enhancedPrompt.substring(0, 50)}..."`);

    try {
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
            console.error(`[AI-Studio] NanoBanana API Hatası (${response.status}):`, errorBody);
            throw new Error(`Görsel üretim servisi hata verdi: ${response.statusText}`);
        }

        const data = await response.json();
        const imageUrl = data.images?.[0]?.url ?? data.url;

        if (!imageUrl) {
            throw new Error("Görsel üretilemedi, API'den URL dönmedi.");
        }

        return imageUrl;
    } catch (error) {
        console.error("[AI-Studio] Görsel üretiminde beklenmedik hata:", error);
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
