import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generatePostText } from "@/services/ai/gemini.service";
import type { GenerateTextInput } from "@/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
    try {
        console.log("[AI-Studio] Metin üretimi API başlatıldı.");

        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
        }

        const body: GenerateTextInput = await req.json();
        if (!body.topic) {
            return NextResponse.json({ error: "Konu gereklidir" }, { status: 400 });
        }

        // 1. Kullanıcının marka verilerini çek (Sahibi olduğu veya üyesi olduğu takım)
        const team = await prisma.team.findFirst({
            where: {
                OR: [
                    { ownerId: session.user.id },
                    { members: { some: { userId: session.user.id } } }
                ]
            },
            select: {
                brandVoice: true,
                brandKeywords: true,
            },
        });

        // 2. AI servisine marka verilerini enjekte et
        const aiInput: GenerateTextInput = {
            ...body,
            brandVoice: team?.brandVoice || undefined,
            brandKeywords: team?.brandKeywords || [],
        };

        console.log("[AI-Studio] Servis çağrılıyor (Konu: %s)", body.topic);
        const result = await generatePostText(aiInput);

        return NextResponse.json(result);
    } catch (error: any) {
        const errorMsg = error.message || "Bilinmeyen AI Hatası";
        console.error("[AI-Studio] KRİTİK HATA (generate-text):", {
            message: errorMsg,
            stack: error.stack?.substring(0, 300),
            name: error.name
        });

        return NextResponse.json({
            error: "İçerik üretiminde teknik bir sorun oluştu",
            details: errorMsg,
            code: "AI_GENERATION_FAILED"
        }, { status: 500 });
    }
}
