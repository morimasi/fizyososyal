import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET: Kullanıcının postlarını listele
export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");
        const month = searchParams.get("month");
        const year = searchParams.get("year");

        const where: any = { userId: session.user.id };

        if (status) where.status = status;

        if (month && year) {
            const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
            const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
            where.scheduledDate = { gte: startDate, lte: endDate };
        }

        const posts = await prisma.post.findMany({
            where,
            include: { media: true, analytics: true },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ posts });
    } catch (error: any) {
        console.error("[API/POSTS] GET hatası:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Yeni post kaydet (Studio'dan)
export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            console.warn("[API/POSTS] Yetkisiz POST isteği.");
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
        }

        const body = await req.json();
        console.log("[API/POSTS] Gelen veri:", JSON.stringify(body).slice(0, 100) + "...");

        const { title, content, hashtags, mediaUrl, postFormat, platform, scheduledDate } = body;

        if (!content || content.trim() === "") {
            console.warn("[API/POSTS] BOŞ İÇERİK HATASI: Content eksik.");
            return NextResponse.json({ error: "İçerik gereklidir (Content is empty)" }, { status: 400 });
        }

        // 1. Kullanıcının ve Takımın varlığını kontrol et (Opsiyonel)
        let teamId = null;
        try {
            const team = await prisma.team.findFirst({
                where: { ownerId: session.user.id },
                select: { id: true }
            });
            teamId = team?.id || null;
        } catch (teamErr) {
            console.error("[API/POSTS] Team sorgusu hatası (Yoksayılıyor):", teamErr);
        }

        console.log("[API/POSTS] Veritabanına kayıt başlatılıyor...");
        const post = await prisma.post.create({
            data: {
                userId: session.user.id,
                teamId: teamId,
                title: title || "Yeni Gönderi (Studio)",
                content: content,
                hashtags: hashtags ? String(hashtags) : null,
                trendTopic: platform || "instagram",
                status: scheduledDate ? "ONAYLANDI" : "TASLAK",
                scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
                ...(mediaUrl ? {
                    media: {
                        create: {
                            mediaUrl,
                            mediaType: postFormat === "video" ? "VIDEO" : "RESIM",
                            aspectRatio: postFormat === "video" ? "9:16" : "1:1",
                        }
                    }
                } : {})
            },
            include: { media: true },
        });

        console.log("[API/POSTS] Kayıt başarılı. Post ID:", post.id);
        return NextResponse.json({ post }, { status: 201 });
    } catch (error: any) {
        console.error("[API/POSTS] KRİTİK KAYIT HATASI:", {
            message: error.message,
            code: error.code,
            meta: error.meta
        });

        // P2002, P2003 gibi Prisma hatalarını yakala
        return NextResponse.json({
            error: "Post kaydedilirken bir veritabanı hatası oluştu",
            details: error.message,
            code: error.code
        }, { status: 500 });
    }
}
