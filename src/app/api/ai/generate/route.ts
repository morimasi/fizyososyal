import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { generateContent } from "@/features/ai-generator/services/ai.service";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { ratelimit } from "@/lib/upstash";
import { z } from "zod";

const generateSchema = z.object({
  prompt: z.string().min(3).max(500),
  type: z.enum(["post", "carousel", "reels", "ad"]).default("post"),
  tone: z.enum(["professional", "friendly", "scientific", "motivational"]).default("professional"),
  language: z.enum(["tr", "en", "de"]).default("tr"),
  targetAudience: z.enum(["general", "athletes", "elderly", "office_workers", "women_health"]).default("general"),
  postLength: z.enum(["short", "medium", "long"]).default("medium"),
  callToActionType: z.enum(["appointment", "comment", "save", "share", "dm"]).default("appointment"),
  useEmojis: z.boolean().default(true),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz erişim", code: "UNAUTHORIZED" }, { status: 401 });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Geçersiz JSON", code: "PARSE_ERROR" }, { status: 400 });
    }

    const validation = generateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Validasyon hatası", code: "VALIDATION_ERROR" }, { status: 400 });
    }

    const { prompt, type, tone, language, targetAudience, postLength, callToActionType, useEmojis } = validation.data;

    if (ratelimit) {
      try {
        const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
        const { success } = await ratelimit.limit(ip);
        if (!success) {
          return NextResponse.json({ error: "Çok fazla istek", code: "RATE_LIMITED" }, { status: 429 });
        }
      } catch (rateError) {
        console.error("Rate limit error:", rateError);
      }
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı", code: "USER_NOT_FOUND" }, { status: 404 });
    }

    if (user.aiCredits <= 0) {
      return NextResponse.json({ error: "Yetersiz kredi", code: "INSUFFICIENT_CREDITS" }, { status: 403 });
    }

    let content;
    try {
      content = await generateContent({ 
        userPrompt: prompt, 
        type, 
        tone, 
        language,
        targetAudience,
        postLength,
        callToActionType,
        useEmojis
      });
    } catch (aiError) {
      const msg = aiError instanceof Error ? aiError.message : String(aiError);
      console.error("AI Error:", msg);
      return NextResponse.json({ error: "AI hatası: " + msg, code: "AI_ERROR" }, { status: 502 });
    }

    if (!content || (content as Record<string, unknown>).error) {
      return NextResponse.json({ error: "AI boş yanıt", code: "AI_RESPONSE_ERROR" }, { status: 502 });
    }

    await db.update(users)
      .set({ aiCredits: sql`${users.aiCredits} - 1` })
      .where(eq(users.id, session.user.id));

    return NextResponse.json({
      success: true,
      data: content,
      remainingCredits: user.aiCredits - 1
    });

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("API Error:", msg);
    return NextResponse.json({ error: "Sunucu hatası", details: msg, code: "SERVER_ERROR" }, { status: 500 });
  }
}
