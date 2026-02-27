import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generatePostText } from "@/services/ai/gemini.service";
import type { GenerateTextInput } from "@/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
    try {
        console.log("[AI-Studio] Metin üretimi API başlatıldı. (Vercel-Node-Bridge)");

        const session = await auth().catch(e => {
            console.error("[AI-Studio] Auth patladı:", e);
            return null;
        });
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
        }

        const body: GenerateTextInput = await req.json();
        if (!body.topic) {
            return NextResponse.json({ error: "Konu gereklidir" }, { status: 400 });
        }

        // 1. Prisma Marka Verisi (Sessiz Kurtarma ile)
        let brandContext = { brandVoice: undefined, brandKeywords: [] };
        try {
            const team = await prisma.team.findFirst({
                where: {
                    OR: [
                        { ownerId: session.user.id },
                        { members: { some: { userId: session.user.id } } }
                    ]
                },
                select: { brandVoice: true, brandKeywords: true },
            });
            if (team) {
                brandContext.brandVoice = team.brandVoice as any;
                brandContext.brandKeywords = (team.brandKeywords || []) as any;
            }
        } catch (dbErr) {
            console.warn("[AI-Studio] Veritabanı marka verisi çekilemedi (Skip):", dbErr);
        }

        // 2. AI servisine marka verilerini enjekte et
        const aiInput: GenerateTextInput = {
            ...body,
            ...brandContext
        };

        console.log("[AI-Studio] Servis çağrılıyor (Model: %s, Topic: %s)", aiInput.model || "default", body.topic);

        try {
            const result = await generatePostText(aiInput);
            return NextResponse.json(result);
        } catch (aiErr: any) {
            console.error("[AI-Studio] AI Servis Hatası:", aiErr.message);
            return NextResponse.json({
                error: "İçerik üretim servisi hata verdi",
                details: aiErr.message,
                code: "AI_SERVICE_ERROR"
            }, { status: 500 });
        }
    } catch (globalErr: any) {
        console.error("[AI-Studio] Beklenmedik Rota Hatası:", globalErr);
        return NextResponse.json({
            error: "Sistem hatası",
            details: globalErr.message,
            code: "INTERNAL_SERVER_ERROR"
        }, { status: 500 });
    }
}
