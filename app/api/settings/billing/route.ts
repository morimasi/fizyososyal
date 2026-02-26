import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
        }

        // Örnek kullanım: Gerçekte kullanıcının gönderi sayısı (bu ay) kullanılabilir
        // Biz burada demo amaçlı o ayki Post tablosu sayısını dönüyoruz
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        const currentMonthPostsCount = await prisma.post.count({
            where: {
                userId: session.user.id,
                createdAt: {
                    gte: startOfMonth
                }
            }
        });

        // Kullanıcının paketine göre limitleme planı çekiyoruz.
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { subscriptionType: true }
        });

        const limits = {
            monthlyPostsLimit: user?.subscriptionType === "premium" ? 500 : 200,
            aiCreditsLimit: user?.subscriptionType === "premium" ? 5000 : 1000,

            usedPosts: currentMonthPostsCount,
            // Gerçekte AI kullanım tablosu oluşturulabilir, şu an simüle ediyoruz:
            usedAiCredits: currentMonthPostsCount * 8, // ortalama 8 kredi/post
        };

        return NextResponse.json({ limits });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
