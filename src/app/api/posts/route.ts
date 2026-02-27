import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { postSchema } from "@/lib/validations/post";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const result = postSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: result.error.format() },
        { status: 400 }
      );
    }

    const { type, mediaUrl, caption, settings, status } = result.data;

    const [newPost] = await db
      .insert(posts)
      .values({
        userId: session.user.id,
        type,
        mediaUrl,
        caption,
        settings,
        status,
      })
      .returning();

    return NextResponse.json({ success: true, post: newPost }, { status: 201 });
  } catch (error) {
    console.error("Save Post Error:", error);
    return NextResponse.json(
      { error: "Post kaydedilirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
