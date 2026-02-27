import { NextResponse } from "next/server";
import { Receiver } from "@upstash/qstash";
import { db } from "@/db";
import { posts, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createMediaContainer, publishMedia } from "@/features/social-publisher/services/instagram.service";

const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("upstash-signature")!;

  try {
    // Verify QStash signature
    const isValid = await receiver.verify({
      body,
      signature,
    });

    if (!isValid) {
      return NextResponse.json({ error: "Geçersiz imza" }, { status: 401 });
    }

    const { postId } = JSON.parse(body);

    if (!postId) {
      return NextResponse.json({ error: "Post ID eksik" }, { status: 400 });
    }

    // 1. Fetch Post
    const post = await db.query.posts.findFirst({
      where: eq(posts.id, postId),
    });

    if (!post || post.status !== "scheduled") {
      return NextResponse.json({ error: "Post bulunamadı veya planlı değil" }, { status: 404 });
    }

    // 2. Fetch User
    const user = await db.query.users.findFirst({
      where: eq(users.id, post.userId),
    });

    if (!user || !user.instagramAccountId || !user.instagramToken) {
      return NextResponse.json({ error: "Instagram bağlantısı eksik" }, { status: 400 });
    }

    // 3. Publish to Instagram
    const containerResult = await createMediaContainer(
      user.instagramAccountId,
      user.instagramToken,
      post.mediaUrl,
      post.caption || ""
    );

    if (containerResult.error) throw new Error(containerResult.error.message);

    const publishResult = await publishMedia(
      user.instagramAccountId,
      user.instagramToken,
      containerResult.id
    );

    if (publishResult.error) throw new Error(publishResult.error.message);

    // 4. Update Status
    await db.update(posts)
      .set({ status: "published", updatedAt: new Date() })
      .where(eq(posts.id, post.id));

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("QStash Webhook Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
