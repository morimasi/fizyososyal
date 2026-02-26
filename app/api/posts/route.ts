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
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
        }

        const body = await req.json();
        const { title, content, hashtags, mediaUrl, postFormat, platform, scheduledDate } = body;

        if (!content) {
            return NextResponse.json({ error: "İçerik gereklidir" }, { status: 400 });
        }

        const post = await prisma.post.create({
            data: {
                userId: session.user.id,
                title: title || null,
                content,
                hashtags: hashtags || null,
                trendTopic: platform || "instagram",
                status: scheduledDate ? "ONAYLANDI" : "TASLAK",
                scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
                ...(mediaUrl && {
                    media: {
                        create: {
                            mediaUrl,
                            mediaType: postFormat === "video" ? "VIDEO" : "RESIM",
                            aspectRatio: postFormat === "video" ? "9:16" : "1:1",
                        }
                    }
                })
            },
            include: { media: true },
        });

        return NextResponse.json({ post }, { status: 201 });
    } catch (error: any) {
        console.error("[API/POSTS] POST hatası:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
