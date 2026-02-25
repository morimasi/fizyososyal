import { prisma } from "@/lib/prisma";
import { PostStatus } from "@prisma/client";

export async function getCalendarPosts(userId: string, startDate: Date, endDate: Date) {
    try {
        return await prisma.post.findMany({
            where: {
                userId,
                scheduledDate: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: {
                media: {
                    take: 1,
                },
            },
            orderBy: {
                scheduledDate: "asc",
            },
        });
    } catch (error) {
        console.error("[DB/CALENDAR] Get calendar posts error:", error);
        return [];
    }
}

export async function updatePostDate(postId: string, userId: string, newDate: Date) {
    try {
        return await prisma.post.update({
            where: { id: postId, userId },
            data: { scheduledDate: newDate },
        });
    } catch (error) {
        console.error("[DB/CALENDAR] Update post date error:", error);
        throw error;
    }
}

export async function createCalendarPost(data: {
    userId: string;
    title: string;
    content?: string;
    scheduledDate: Date;
    status?: PostStatus;
}) {
    try {
        return await prisma.post.create({
            data: {
                ...data,
                status: data.status || "TASLAK",
            },
        });
    } catch (error) {
        console.error("[DB/CALENDAR] Create post error:", error);
        throw error;
    }
}
