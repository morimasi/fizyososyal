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

        const body: GenerateMediaInput & { applyLogo?: boolean } = await req.json();
        if (!body.prompt) {
            return NextResponse.json({ error: "Prompt gereklidir" }, { status: 400 });
        }

        console.log("[AI-Studio] Görsel üretimi API çağrıldı (Prompt: %s)", body.prompt.substring(0, 50) + "...");

        let mediaUrl = "";
        let attempt = 1;
        const maxAttempts = 2;
        const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?auto=format&fit=crop&w=1000&q=80"; // Doğrulanmış Klinik Görseli

        while (attempt <= maxAttempts) {
            try {
                console.log(`[AI-Studio] Görsel üretimi denemesi ${attempt}/${maxAttempts} (${attempt === 2 ? 'Simplified' : 'Full'})`);

                mediaUrl = await generatePhysioImage({
                    ...body,
                    simplified: attempt === 2
                });
                break;
            } catch (imgErr: any) {
                console.warn(`[AI-Studio] Deneme ${attempt} hatası:`, imgErr.message);

                if (attempt === maxAttempts) {
                    console.error("[AI-Studio] Tüm görsel üretim denemeleri başarısız oldu. Fallback görseline geçiliyor.");
                    return NextResponse.json({
                        mediaUrl: FALLBACK_IMAGE,
                        aspectRatio: body.aspectRatio,
                        isFallback: true,
                        warning: "Görsel üretim servisi yoğun olduğu için standart bir klinik görseli atandı."
                    });
                }

                // 503/504 ise bir süre bekle ve tekrar dene
                if (imgErr.message.includes("503") || imgErr.message.includes("504")) {
                    await new Promise(resolve => setTimeout(resolve, 3000));
                }
                attempt++;
            }
        }

        // Kullanıcının logosu varsa watermark ekle - SADECE İLK DENEME BAŞARILIYSA
        if (body.applyLogo && mediaUrl && attempt === 1) {
            try {
                const user = await prisma.user.findUnique({
                    where: { id: session.user.id }
                });

                if (user?.logoUrl) {
                    const watermarked = await addLogoWatermark(mediaUrl, user.logoUrl);
                    if (watermarked) mediaUrl = watermarked;
                }
            } catch (logoErr: any) {
                console.warn("[AI-Studio] Logo watermark eklenemedi (Sessiz Hata):", logoErr.message);
            }
        }

        return NextResponse.json({ mediaUrl, aspectRatio: body.aspectRatio });
    } catch (error: any) {
        console.error("[AI-Studio] KRİTİK HATA (generate-media):", error);
        return NextResponse.json({
            error: "Sistem hatası oluştu",
            details: error.message || "Bilinmeyen hata"
        }, { status: 500 });
    }
}
