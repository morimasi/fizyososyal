import { NextResponse } from "next/server";
import { enrichPrompt } from "@/features/ai-generator/services/ai.service";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: "Prompt is required" },
        { status: 400 }
      );
    }

    const enriched = await enrichPrompt(prompt);

    return NextResponse.json({
      success: true,
      data: enriched,
    });
  } catch (error) {
    console.error("Prompt Enrichment Error:", error);
    return NextResponse.json(
      { success: false, error: "Prompt zenginleştirilirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
