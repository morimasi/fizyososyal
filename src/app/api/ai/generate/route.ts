import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { generateContent } from "@/features/ai-generator/services/ai.service";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { ratelimit } from "@/lib/upstash";
import { z } from "zod";

const generateSchema = z.object({
  prompt: z.string().min(3, "Prompt en az 3 karakter olmalı").max(500, "Prompt çok uzun"),
  type: z.enum(["post", "carousel", "reels", "ad"]).default("post"),
  tone: z.enum(["professional", "friendly", "scientific", "motivational"]).default("professional"),
  language: z.enum(["tr", "en", "de"]).default("tr"),
});

export async function POST(req: Request) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Yetkisiz erişim", code: "UNAUTHORIZED" }, { status: 401 });
  }

  let body: unknown;
  
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ 
      error: "Geçersiz JSON formatı", 
      code: "PARSE_ERROR" 
    }, { status: 400 });
  }

  const validation = generateSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json({ 
      error: "Validasyon hatası", 
      details: validation.error.issues,
      code: "VALIDATION_ERROR"
    }, { status: 400 });
  }

  const { prompt, type, tone, language } = validation.data;

  try {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    
    if (ratelimit) {
      const { success } = await ratelimit.limit(ip);
      if (!success) {
        return NextResponse.json(
          { error: "Çok fazla istek gönderdiniz. Lütfen 1 dakika bekleyin.", code: "RATE_LIMITED" },
          { status: 429 }
        );
      }
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı", code: "USER_NOT_FOUND" }, { status: 404 });
    }

    if (user.aiCredits <= 0) {
      return NextResponse.json({ 
        error: "Yetersiz AI kredisi. Kredi satın almak için planlarınızı inceleyin.", 
        code: "INSUFFICIENT_CREDITS",
        credits: 0
      }, { status: 403 });
    }

    let content;
    try {
      content = await generateContent({ 
        userPrompt: prompt, 
        type, 
        tone, 
        language 
      });
    } catch (aiError: unknown) {
      const errorMsg = aiError instanceof Error ? aiError.message : String(aiError);
      console.error("Gemini Generation Error:", errorMsg);
      
      const lowerError = errorMsg.toLowerCase();
      
      if (lowerError.includes("quota") || lowerError.includes("rate limit")) {
        return NextResponse.json({ 
          error: "AI servisi şu anda yoğun. Lütfen daha sonra tekrar deneyin.", 
          code: "AI_QUOTA_EXCEEDED"
        }, { status: 503 });
      }
      
      if (lowerError.includes("api key") || lowerError.includes("permission")) {
        return NextResponse.json({ 
          error: "AI yapılandırma hatası. Lütfen destek ile iletişime geçin.", 
          code: "AI_CONFIG_ERROR"
        }, { status: 503 });
      }
      
      return NextResponse.json({ 
        error: "Yapay zeka içerik üretemedi", 
        details: errorMsg,
        code: "AI_GENERATION_ERROR"
      }, { status: 502 });
    }

    if (!content || (content as Record<string, unknown>).error) {
      return NextResponse.json({ 
        error: "AI yanıt hatası", 
        details: (content as Record<string, unknown>).error || "AI boş yanıt döndürdü",
        code: "AI_RESPONSE_ERROR"
      }, { status: 502 });
    }

    const newCredits = user.aiCredits - 1;
    await db.update(users)
      .set({ aiCredits: sql`${users.aiCredits} - 1` })
      .where(eq(users.id, session.user.id));

    return NextResponse.json({
      success: true,
      data: content,
      remainingCredits: newCredits,
      parsed: (content as Record<string, unknown>).parsed !== false
    });

  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("API AI Error:", error);
    return NextResponse.json(
      { 
        error: "Sunucu hatası", 
        message: process.env.NODE_ENV === "development" ? errorMsg : "Bilinmeyen bir hata oluştu",
        code: "SERVER_ERROR"
      }, 
      { status: 500 }
    );
  }
}
