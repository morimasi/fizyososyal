import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { generateContent } from "@/features/ai-generator/services/ai.service";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function POST(req: Request) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  try {
    const { prompt, type } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt gerekli" }, { status: 400 });
    }

    // Kullanıcı kredisini kontrol et
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user || user.aiCredits <= 0) {
      return NextResponse.json({ error: "Yetersiz kredi" }, { status: 403 });
    }

    // İçeriği üret
    const content = await generateContent(prompt, type);

    // Krediyi düş
    await db.update(users)
      .set({ aiCredits: sql`${users.aiCredits} - 1` })
      .where(eq(users.id, session.user.id));

    return NextResponse.json({
      success: true,
      data: content,
      remainingCredits: user.aiCredits - 1
    });

  } catch (error) {
    console.error("API AI Error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
