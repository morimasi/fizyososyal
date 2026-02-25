import { Client as QStashClient } from "@upstash/qstash";
import { Redis } from "@upstash/redis";
import { env } from "@/lib/env";

export const qstash = new QStashClient({
    token: env.QSTASH_TOKEN || "",
});

export const redis = new Redis({
    url: env.UPSTASH_REDIS_REST_URL || "",
    token: env.UPSTASH_REDIS_REST_TOKEN || "",
});

export async function schedulePublish(postId: string, scheduledDate: Date) {
    const delay = scheduledDate.getTime() - Date.now();
    if (delay < 0) throw new Error("Zamanlanmış tarih geçmişte olamaz.");

    const response = await qstash.publishJSON({
        url: env.QSTASH_WEBHOOK_URL || "",
        body: { postId },
        delay: Math.floor(delay / 1000),
    });

    return response;
}
