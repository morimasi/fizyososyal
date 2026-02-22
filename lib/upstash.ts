import { Client } from "@upstash/qstash";

export const qstash = new Client({
    token: process.env.QSTASH_TOKEN!,
});

export async function schedulePublish(postId: string, scheduledDate: Date) {
    const delay = scheduledDate.getTime() - Date.now();
    if (delay < 0) throw new Error("Zamanlanmış tarih geçmişte olamaz.");

    const response = await qstash.publishJSON({
        url: process.env.QSTASH_WEBHOOK_URL!,
        body: { postId },
        delay: Math.floor(delay / 1000),
    });

    return response;
}
