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
        try {
            mediaUrl = await generatePhysioImage(body);
        } catch (imgErr: any) {
            console.error("[AI-Studio] Nanobanana üretim hatası:", imgErr.message);
            return NextResponse.json({
                error: "Görsel üretim servisi şu an yanıt vermiyor.",
                details: imgErr.message
            }, { status: 503 });
        }

        // Kullanıcının logosu varsa watermark ekle - Sessiz hata modu
        if (body.applyLogo && mediaUrl) {
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
                // Orijinal görselle devam et
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
