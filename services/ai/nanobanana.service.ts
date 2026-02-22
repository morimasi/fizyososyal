import type { GenerateMediaInput } from "@/types";

const NANOBANANA_API_URL = process.env.NANOBANANA_API_URL ?? "https://api.nanobanana.io/v1";
const NANOBANANA_API_KEY = process.env.NANOBANANA_API_KEY!;

const aspectRatioMap = {
    "1:1": { width: 1080, height: 1080 },
    "4:5": { width: 1080, height: 1350 },
    "9:16": { width: 1080, height: 1920 },
};

export async function generatePhysioImage(input: GenerateMediaInput): Promise<string> {
    const dimensions = aspectRatioMap[input.aspectRatio];
    const enhancedPrompt = buildPhysioPrompt(input.prompt, input.style);

    const response = await fetch(`${NANOBANANA_API_URL}/generate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${NANOBANANA_API_KEY}`,
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
        throw new Error(`NanaBanana API hatası: ${response.statusText}`);
    }

    const data = await response.json();
    return data.images?.[0]?.url ?? data.url;
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
    const response = await fetch(`${NANOBANANA_API_URL}/edit`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${NANOBANANA_API_KEY}`,
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
        throw new Error(`Logo ekleme hatası: ${response.statusText}`);
    }

    const data = await response.json();
    return data.result_url;
}
