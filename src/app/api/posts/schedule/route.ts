import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { Client } from "@upstash/qstash";
import { postSchema } from "@/lib/validations/post";

const qstashClient = new Client({
  token: process.env.QSTASH_TOKEN!,
});

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  try {
    const { postData, scheduledAt } = await req.json();
    
    // Validate post data
    const validation = postSchema.safeParse(postData);
    if (!validation.success) {
      return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });
    }

    // 1. Save to DB
    const [newPost] = await db.insert(posts).values({
      userId: session.user.id,
      ...validation.data,
      status: "scheduled",
    }).returning();

    // 2. Schedule with QStash
    const delay = Math.max(0, Math.floor((new Date(scheduledAt).getTime() - Date.now()) / 1000));
    
    await qstashClient.publishJSON({
      url: process.env.QSTASH_WEBHOOK_URL!,
      body: { postId: newPost.id },
      delay,
    });

    return NextResponse.json({ success: true, post: newPost });

  } catch (error) {
    console.error("Scheduling Error:", error);
    return NextResponse.json({ error: "Planlama başarısız" }, { status: 500 });
  }
}
