import { NextRequest, NextResponse } from "next/server";
import { Receiver } from "@upstash/qstash";
import { publishPostNow } from "@/services/instagram/publish.service";

const receiver = new Receiver({
    currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
    nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
});

export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = req.headers.get("upstash-signature") ?? "";

    // İmza doğrulama — unauthorized istekleri reddet
    const isValid = await receiver.verify({
        signature,
        body,
        clockTolerance: 5,
    });

    if (!isValid) {
        return NextResponse.json({ error: "Geçersiz imza" }, { status: 401 });
    }

    try {
        const payload = JSON.parse(body) as { postId: string };
        if (!payload.postId) {
            return NextResponse.json({ error: "postId eksik" }, { status: 400 });
        }

        await publishPostNow(payload.postId);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("QStash webhook hatası:", error);
        return NextResponse.json({ error: "Yayınlama başarısız" }, { status: 500 });
    }
}
