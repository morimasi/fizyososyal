import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { publishPostNow } from "@/services/instagram/publish.service";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
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

        // Instagram hesabı bağlı mı kontrol et
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { accessToken: true, instagramAccountId: true },
        });

        if (!user?.accessToken || !user?.instagramAccountId) {
            // Bağlantı yok ama yine de durum güncelle (simüle yayın)
            await prisma.post.update({
                where: { id: params.id },
                data: { status: "YAYINLANDI" },
            });
            return NextResponse.json({
                success: true,
                message: "İçerik yayınlandı olarak işaretlendi (Instagram bağlantısı yok).",
                simulated: true,
            });
        }

        // Gerçek Instagram yayını
        await publishPostNow(params.id);

        return NextResponse.json({
            success: true,
            message: "İçerik Instagram'da başarıyla yayınlandı!",
        });
    } catch (error: any) {
        console.error("[API/POSTS/PUBLISH] Hata:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
