import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createMediaContainer, publishMedia } from "@/features/social-publisher/services/instagram.service";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  try {
    const { imageUrl, caption } = await req.json();

    if (!imageUrl) {
      return NextResponse.json({ error: "Görsel URL'si gerekli" }, { status: 400 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user || !user.instagramAccountId || !user.instagramToken) {
      return NextResponse.json({ error: "Instagram hesabı bağlı değil" }, { status: 400 });
    }

    // 1. Create Media Container
    const containerResult = await createMediaContainer(
      user.instagramAccountId,
      user.instagramToken,
      imageUrl,
      caption || ""
    );

    if (containerResult.error) {
      console.error("Meta API Container Error:", containerResult.error);
      return NextResponse.json({ error: containerResult.error.message }, { status: 500 });
    }

    // 2. Publish Media
    const publishResult = await publishMedia(
      user.instagramAccountId,
      user.instagramToken,
      containerResult.id
    );

    if (publishResult.error) {
      console.error("Meta API Publish Error:", publishResult.error);
      return NextResponse.json({ error: publishResult.error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: publishResult.id });
  } catch (error) {
    console.error("Publish Error:", error);
    return NextResponse.json({ error: "Paylaşım sırasında bir hata oluştu" }, { status: 500 });
  }
}
