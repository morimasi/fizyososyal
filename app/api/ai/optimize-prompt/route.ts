import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { optimizePhysioPrompt } from "@/services/ai/gemini.service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
        }

        const { topic, platform, postFormat, settings } = await req.json();
        console.log("[API/OPTIMIZE] Gelen bağlam:", { topic, platform, postFormat });
        if (!topic) {
            return NextResponse.json({ error: "Konu gereklidir" }, { status: 400 });
        }

        const optimized = await optimizePhysioPrompt(topic, { platform, postFormat, settings });
        console.log("[API/OPTIMIZE] Derin sonuç üretildi.");
        return NextResponse.json({ optimized });
    } catch (error: any) {
        console.error("[API] Optimize Prompt Hatası:", error);
        return NextResponse.json({ error: "Prompt optimize edilemedi" }, { status: 500 });
    }
}
