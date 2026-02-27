import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { generatePhysioImage, addLogoWatermark } from "@/services/ai/nanobanana.service";
import { prisma } from "@/lib/prisma";
import type { GenerateMediaInput } from "@/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
    try {
        console.log("[AI-Studio] Görsel üretimi API çağrıldı.");

        const session = await auth().catch(err => {
            console.error("[AI-Studio] Auth hatası:", err);
            throw new Error(`Oturum doğrulaması başarısız: ${err.message}`);
        });

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
        }

        const body: (GenerateMediaInput | { prompts: string[] }) & { applyLogo?: boolean } = await req.json();
        const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?auto=format&fit=crop&w=1000&q=80";

        // Tek bir görsel üretimi (Geriye dönük uyumluluk ve Statik/Ad/Video için)
        const produceSingleImage = async (prompt: string, aspectRatio: string) => {
            let mediaUrl = "";
            let attempt = 1;
            const maxAttempts = 2;

            while (attempt <= maxAttempts) {
                try {
                    mediaUrl = await generatePhysioImage({
                        prompt,
                        aspectRatio: aspectRatio as any,
                        simplified: attempt === 2
                    });
                    break;
                } catch (imgErr: any) {
                    if (attempt === maxAttempts) return FALLBACK_IMAGE;
                    if (imgErr.message.includes("503") || imgErr.message.includes("504")) {
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    }
                    attempt++;
                }
            }

            // Logo Watermark (Sadece ilk deneme başarılıysa)
            if (body.applyLogo && mediaUrl && mediaUrl !== FALLBACK_IMAGE && attempt === 1 && session?.user?.id) {
                try {
                    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
                    if (user?.logoUrl) {
                        const watermarked = await addLogoWatermark(mediaUrl, user.logoUrl);
                        if (watermarked) mediaUrl = watermarked;
                    }
                } catch (e) { console.warn("[AI-Studio] Logo hatası:", e); }
            }

            return mediaUrl;
        };

        // Çoklu Görsel Üretimi (Carousel için)
        if ('prompts' in body && Array.isArray(body.prompts)) {
            console.log(`[AI-Studio] BATCH Üretim Başlatıldı: ${body.prompts.length} görsel.`);
            const mediaUrls = await Promise.all(
                body.prompts.map(p => produceSingleImage(p, (body as any).aspectRatio || "1:1"))
            );
            return NextResponse.json({ mediaUrls, aspectRatio: (body as any).aspectRatio });
        }

        // Standart Üretim
        const prompt = (body as GenerateMediaInput).prompt;
        if (!prompt) return NextResponse.json({ error: "Prompt gereklidir" }, { status: 400 });

        const mediaUrl = await produceSingleImage(prompt, (body as GenerateMediaInput).aspectRatio);
        return NextResponse.json({ mediaUrl, aspectRatio: (body as GenerateMediaInput).aspectRatio });
    } catch (error: any) {
        console.error("[AI-Studio] KRİTİK HATA (generate-media):", error);
        return NextResponse.json({
            error: "Sistem hatası oluştu",
            details: error.message || "Bilinmeyen hata"
        }, { status: 500 });
    }
}
