import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { generatePhysioImage, addLogoWatermark } from "@/services/ai/nanobanana.service";
import { prisma } from "@/lib/prisma";
import type { GenerateMediaInput } from "@/types";

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

        let mediaUrl = await generatePhysioImage(body);

        // Kullanıcının logosu varsa watermark ekle
        if (body.applyLogo) {
            const user = await prisma.user.findUnique({
                where: { id: session.user.id }
            }).catch(err => {
                console.error("[AI-Studio] Database hatası (User/Logo):", err);
                return null; // Don't crash for logo
            });

            if (user?.logoUrl) {
                mediaUrl = await addLogoWatermark(mediaUrl, user.logoUrl);
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
