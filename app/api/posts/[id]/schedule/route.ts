import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { schedulePost } from "@/services/instagram/publish.service";

export const dynamic = "force-dynamic";

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
        }

        const body = await req.json();
        const { scheduledDate } = body;

        if (!scheduledDate) {
            return NextResponse.json({ error: "Tarih gereklidir" }, { status: 400 });
        }

        const post = await prisma.post.findUnique({
            where: { id: params.id },
        });

        if (!post) {
            return NextResponse.json({ error: "Post bulunamadı" }, { status: 404 });
        }

        if (post.userId !== session.user.id) {
            return NextResponse.json({ error: "Bu post size ait değil" }, { status: 403 });
        }

        await schedulePost(params.id, new Date(scheduledDate));

        return NextResponse.json({
            success: true,
            message: `İçerik ${new Date(scheduledDate).toLocaleString("tr-TR")} için zamanlandı.`,
        });
    } catch (error: any) {
        console.error("[API/POSTS/SCHEDULE] Hata:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
