import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { generatePostText } from "@/services/ai/gemini.service";
import type { GenerateTextInput } from "@/types";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    try {
        const body: GenerateTextInput = await req.json();
        if (!body.topic) {
            return NextResponse.json({ error: "Konu gereklidir" }, { status: 400 });
        }

        const result = await generatePostText(body);
        return NextResponse.json(result);
    } catch (error) {
        console.error("Metin üretimi hatası:", error);
        return NextResponse.json({ error: "Metin üretimi başarısız" }, { status: 500 });
    }
}
