import { prisma } from "@/lib/prisma";

export async function getDashboardAnalyticsSum(userId: string) {
    try {
        const result = await prisma.analytics.aggregate({
            _sum: { likes: true, comments: true, reach: true, saves: true },
            where: { post: { userId } }
        });

        return {
            likes: result._sum.likes || 0,
            comments: result._sum.comments || 0,
            reach: result._sum.reach || 0,
            saves: result._sum.saves || 0,
            totalInteractions: (result._sum.likes || 0) + (result._sum.comments || 0)
        };
    } catch (error) {
        console.error("[DB/DASHBOARD] Analytics aggregation error:", error);
        return { likes: 0, comments: 0, reach: 0, saves: 0, totalInteractions: 0 };
    }
}

export async function getUpcomingPosts(userId: string, limit: number = 3) {
    try {
        return await prisma.post.findMany({
            where: {
                userId,
                status: "ONAYLANDI",
                scheduledDate: { gte: new Date() }
            },
            include: { media: { take: 1 } },
            orderBy: { scheduledDate: "asc" },
            take: limit
        });
    } catch (error) {
        console.error("[DB/DASHBOARD] Upcoming posts fetch error:", error);
        return [];
    }
}
