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

        const { topic } = await req.json();
        console.log("[API/OPTIMIZE] Gelen konu:", topic);
        if (!topic) {
            return NextResponse.json({ error: "Konu gereklidir" }, { status: 400 });
        }

        const optimized = await optimizePhysioPrompt(topic);
        console.log("[API/OPTIMIZE] Optimize edilmiş sonuç:", optimized);
        return NextResponse.json({ optimized });
    } catch (error: any) {
        console.error("[API] Optimize Prompt Hatası:", error);
        return NextResponse.json({ error: "Prompt optimize edilemedi" }, { status: 500 });
    }
}
