import type { GenerateMediaInput } from "@/types";
import { env } from "@/lib/env";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const API_URL = (env as any).NANOBANANA_API_URL || "https://api.nanobanana.io/v1";

export async function generatePhysioImage(input: GenerateMediaInput): Promise<string> {
    const apiKey = env.NANOBANANA_API_KEY;
    if (!apiKey) {
        throw new Error("NANOBANANA_API_KEY eksik. Lütfen yapılandırmayı kontrol edin.");
    }

    const enhancedPrompt = buildPhysioPrompt(input.prompt, input.style);

    console.log("[NANOBANANA] Görsel üretimi başlatılıyor:", {
        promptLength: enhancedPrompt.length,
        aspectRatio: input.aspectRatio
    });

    try {
        const response = await fetch(`${API_URL}/images/generations`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                prompt: enhancedPrompt,
                n: 1,
                size: input.aspectRatio === "9:16" ? "1024x1792" : "1024x1024",
                response_format: "url"
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("[NANOBANANA] API Hatası:", errorData);
            throw new Error(`Görsel üretilemedi: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        const imageUrl = data.data?.[0]?.url;

        if (!imageUrl) {
            throw new Error("API'den geçerli bir görsel URL'si dönmedi.");
        }

        return imageUrl;
    } catch (error: any) {
        console.error("[NANOBANANA] Kritik Hata:", error.message);
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
