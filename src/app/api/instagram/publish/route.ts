import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createMediaContainer, publishMedia } from "@/features/social-publisher/services/instagram.service";
import { getDecryptedToken } from "@/lib/instagram-crypto";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Yetkisiz erişim", code: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { imageUrl, caption } = body;

    if (!imageUrl) {
      return NextResponse.json({ error: "Görsel URL'si gerekli", code: "MISSING_IMAGE_URL" }, { status: 400 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user?.instagramAccountId || !user?.instagramToken) {
      return NextResponse.json({ 
        error: "Instagram hesabı bağlı değil. Lütfen önce Instagram'ı bağlayın.", 
        code: "INSTAGRAM_NOT_CONNECTED" 
      }, { status: 400 });
    }

    const accessToken = getDecryptedToken(user.instagramToken);
    const accountId = user.instagramAccountId;

    if (!accessToken) {
      return NextResponse.json({ 
        error: "Instagram erişim tokeni geçersiz. Lütfen hesabınızı yeniden bağlayın.", 
        code: "INVALID_TOKEN" 
      }, { status: 400 });
    }

    console.log("Publishing to Instagram:", { userId: session.user.id, accountId, imageUrl: imageUrl.substring(0, 50) + "..." });

    const containerResult = await createMediaContainer(
      accountId,
      accessToken,
      imageUrl,
      caption || ""
    );

    if (containerResult.error) {
      console.error("Meta API Container Error:", { 
        userId: session.user.id, 
        error: containerResult.error.message 
      });
      
      if (containerResult.error.message?.includes("invalid")) {
        return NextResponse.json({ 
          error: "Instagram tokeni süresi dolmuş veya geçersiz. Lütfen hesabınızı yeniden bağlayın.", 
          code: "TOKEN_EXPIRED" 
        }, { status: 401 });
      }
      
      return NextResponse.json({ error: containerResult.error.message, code: "META_API_ERROR" }, { status: 500 });
    }

    const publishResult = await publishMedia(
      accountId,
      accessToken,
      containerResult.id
    );

    if (publishResult.error) {
      console.error("Meta API Publish Error:", { 
        userId: session.user.id, 
        error: publishResult.error.message 
      });
      return NextResponse.json({ error: publishResult.error.message, code: "META_PUBLISH_ERROR" }, { status: 500 });
    }

    console.log("Successfully published:", { userId: session.user.id, postId: publishResult.id });

    return NextResponse.json({ success: true, id: publishResult.id });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("Publish Error:", { userId: session?.user?.id, error: errorMsg });
    return NextResponse.json({ 
      error: "Paylaşım sırasında bir hata oluştu", 
      details: process.env.NODE_ENV === "development" ? errorMsg : undefined,
      code: "SERVER_ERROR" 
    }, { status: 500 });
  }
}
