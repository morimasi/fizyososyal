import { NextResponse } from "next/server";
import { Receiver } from "@upstash/qstash";
import { db } from "@/db";
import { posts, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createMediaContainer, publishMedia } from "@/features/social-publisher/services/instagram.service";
import { getDecryptedToken } from "@/lib/instagram-crypto";

const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("upstash-signature")!;

  try {
    const isValid = await receiver.verify({
      body,
      signature,
    });

    if (!isValid) {
      return NextResponse.json({ error: "Geçersiz imza", code: "INVALID_SIGNATURE" }, { status: 401 });
    }

    const { postId } = JSON.parse(body);

    if (!postId) {
      return NextResponse.json({ error: "Post ID eksik", code: "MISSING_POST_ID" }, { status: 400 });
    }

    const post = await db.query.posts.findFirst({
      where: eq(posts.id, postId),
    });

    if (!post || post.status !== "scheduled") {
      return NextResponse.json({ error: "Post bulunamadı veya planlı değil", code: "POST_NOT_FOUND" }, { status: 404 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, post.userId),
    });

    if (!user?.instagramAccountId || !user?.instagramToken) {
      console.error("QStash: Instagram not connected", { postId, userId: post.userId });
      return NextResponse.json({ error: "Instagram bağlantısı eksik", code: "INSTAGRAM_NOT_CONNECTED" }, { status: 400 });
    }

    const accessToken = getDecryptedToken(user.instagramToken);
    const accountId = user.instagramAccountId;

    console.log("QStash: Publishing scheduled post", { postId, userId: post.userId, accountId });

    const containerResult = await createMediaContainer(
      accountId,
      accessToken,
      post.mediaUrl,
      post.caption || ""
    );

    if (containerResult.error) {
      console.error("QStash: Container error", { postId, error: containerResult.error.message });
      throw new Error(containerResult.error.message);
    }

    const publishResult = await publishMedia(
      accountId,
      accessToken,
      containerResult.id
    );

    if (publishResult.error) {
      console.error("QStash: Publish error", { postId, error: publishResult.error.message });
      throw new Error(publishResult.error.message);
    }

    await db.update(posts)
      .set({ status: "published", updatedAt: new Date() })
      .where(eq(posts.id, post.id));

    console.log("QStash: Successfully published", { postId, instagramId: publishResult.id });

    return NextResponse.json({ success: true, id: publishResult.id });

  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("QStash Webhook Error:", errorMsg);
    return NextResponse.json({ error: errorMsg, code: "WEBHOOK_ERROR" }, { status: 500 });
  }
}
