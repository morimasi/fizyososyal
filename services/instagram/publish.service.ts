import { prisma } from "@/lib/prisma";
import { schedulePublish } from "@/lib/upstash";
import { createImageContainer, publishContainer } from "./graph-api.service";
import type { SmartScheduleResult } from "@/types";

export async function publishPostNow(postId: string): Promise<void> {
    const post = await prisma.post.findUnique({
        where: { id: postId },
        include: { media: true, user: true },
    });

    if (!post) throw new Error("Post bulunamadı");
    if (!post.user.accessToken) throw new Error("Instagram bağlantısı yok");
    if (!post.user.instagramAccountId) throw new Error("Instagram hesabı bağlı değil");

    const caption = buildCaption(post.content ?? "", post.hashtags ?? "");

    try {
        // Medya varsa resimli post, yoksa caption modu
        if (post.media.length > 0) {
            const container = await createImageContainer(
                post.user.instagramAccountId,
                post.user.accessToken,
                post.media[0].mediaUrl,
                caption
            );

            // Kısa bekleme - Meta API'nin container'ı işlemesi için
            await new Promise((r) => setTimeout(r, 5000));

            await publishContainer(
                post.user.instagramAccountId,
                post.user.accessToken,
                container.id
            );
        }

        await prisma.post.update({
            where: { id: postId },
            data: { status: "YAYINLANDI" },
        });
    } catch (error) {
        await prisma.post.update({
            where: { id: postId },
            data: { status: "HATA" },
        });
        throw error;
    }
}

export async function schedulePost(postId: string, scheduledDate: Date): Promise<void> {
    await prisma.post.update({
        where: { id: postId },
        data: { scheduledDate, status: "ONAYLANDI" },
    });

    await schedulePublish(postId, scheduledDate);
}

export async function getSuggestedPublishTime(userId: string): Promise<SmartScheduleResult> {
    const recentPosts = await prisma.post.findMany({
        where: { userId, status: "YAYINLANDI" },
        include: { analytics: true },
        orderBy: { createdAt: "desc" },
        take: 20,
    });

    // Saatlere göre etkileşim ortalaması
    const hourlyEngagement: Record<number, { total: number; count: number }> = {};

    for (const post of recentPosts) {
        if (!post.scheduledDate || !post.analytics) continue;
        const hour = new Date(post.scheduledDate).getHours();
        const engagement = (post.analytics.likes + post.analytics.comments * 3 + post.analytics.saves * 2);

        if (!hourlyEngagement[hour]) hourlyEngagement[hour] = { total: 0, count: 0 };
        hourlyEngagement[hour].total += engagement;
        hourlyEngagement[hour].count += 1;
    }

    let bestHour = 18; // Varsayılan: akşam 18:00
    let bestScore = 0;

    for (const [hour, data] of Object.entries(hourlyEngagement)) {
        const avg = data.total / data.count;
        if (avg > bestScore) {
            bestScore = avg;
            bestHour = parseInt(hour);
        }
    }

    const suggestedTime = new Date();
    suggestedTime.setDate(suggestedTime.getDate() + 1);
    suggestedTime.setHours(bestHour, 0, 0, 0);

    return {
        suggestedTime,
        reason:
            recentPosts.length > 0
                ? `Önceki postlarınızda saat ${bestHour}:00'da en yüksek etkileşim alınmış.`
                : "Fizyoterapi kitlesi için önerilen paylaşım saati: 18:00",
        engagementScore: bestScore,
    };
}

function buildCaption(content: string, hashtags: string): string {
    return `${content}\n.\n.\n.\n${hashtags}`.trim();
}
