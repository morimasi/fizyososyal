import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { schedulePost, publishPostNow } from "@/services/instagram/publish.service";
import { getSuggestedPublishTime } from "@/services/instagram/publish.service";

// POST /api/instagram/publish
export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const body = await req.json();
    const { postId, action, scheduledDate } = body;

    if (!postId || !action) {
        return NextResponse.json({ error: "postId ve action gereklidir" }, { status: 400 });
    }

    // Post sahibi doğrula
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post || post.userId !== session.user.id) {
        return NextResponse.json({ error: "Post bulunamadı" }, { status: 404 });
    }

    try {
        if (action === "now") {
            await publishPostNow(postId);
            return NextResponse.json({ success: true, message: "Post yayınlandı" });
        }

        if (action === "schedule" && scheduledDate) {
            await schedulePost(postId, new Date(scheduledDate));
            return NextResponse.json({ success: true, message: "Post zamanlandı" });
        }

        if (action === "suggest-time") {
            const suggestion = await getSuggestedPublishTime(session.user.id);
            return NextResponse.json(suggestion);
        }

        return NextResponse.json({ error: "Geçersiz action" }, { status: 400 });
    } catch (error) {
        console.error("Yayınlama hatası:", error);
        return NextResponse.json({ error: "Yayınlama başarısız" }, { status: 500 });
    }
}
