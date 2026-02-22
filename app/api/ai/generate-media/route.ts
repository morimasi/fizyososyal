import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { generatePhysioImage, addLogoWatermark } from "@/services/ai/nanobanana.service";
import { prisma } from "@/lib/prisma";
import type { GenerateMediaInput } from "@/types";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    try {
        const body: GenerateMediaInput & { applyLogo?: boolean } = await req.json();
        if (!body.prompt) {
            return NextResponse.json({ error: "Prompt gereklidir" }, { status: 400 });
        }

        let mediaUrl = await generatePhysioImage(body);

        // Kullanıcının logosu varsa watermark ekle
        if (body.applyLogo) {
            const user = await prisma.user.findUnique({ where: { id: session.user.id } });
            if (user?.logoUrl) {
                mediaUrl = await addLogoWatermark(mediaUrl, user.logoUrl);
            }
        }

        return NextResponse.json({ mediaUrl, aspectRatio: body.aspectRatio });
    } catch (error) {
        console.error("Görsel üretim hatası:", error);
        return NextResponse.json({ error: "Görsel üretimi başarısız" }, { status: 500 });
    }
}
