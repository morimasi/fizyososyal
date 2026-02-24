import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { generatePostText } from "@/services/ai/gemini.service";
import type { GenerateTextInput } from "@/types";

export async function POST(req: NextRequest) {
    try {
        console.log("[AI-Studio] Metin üretimi API çağrıldı.");

        const session = await auth().catch(err => {
            console.error("[AI-Studio] Auth hatası:", err);
            throw new Error(`Oturum doğrulaması başarısız: ${err.message}`);
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
        }

        const body: GenerateTextInput = await req.json();
        if (!body.topic) {
            return NextResponse.json({ error: "Konu gereklidir" }, { status: 400 });
        }

        const result = await generatePostText(body);
        return NextResponse.json(result);
    } catch (error: any) {
        console.error("[AI-Studio] KRİTİK HATA (generate-text):", error);
        return NextResponse.json({
            error: "Sistem hatası oluştu",
            details: error.message || "Bilinmeyen hata",
            stack: process.env.NODE_ENV === "development" ? error.stack : undefined
        }, { status: 500 });
    }
}
