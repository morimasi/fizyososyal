import { getModel } from "@/lib/google-ai";

export type ContentType = "post" | "carousel" | "reels" | "ad" | "thread" | "story" | "article" | "newsletter";
export type ContentTone = "professional" | "friendly" | "scientific" | "motivational" | "empathetic" | "bold" | "educational";

export interface GenerateParams {
  userPrompt: string;
  type: ContentType;
  tone: ContentTone;
  language: string;
  targetAudience?: string;
  postLength?: string;
  callToActionType?: string;
  useEmojis?: boolean;
}

const SYSTEM_INSTRUCTION = `
Sen "Fizyososyal AI v2" multimodal strateji modelisin.
Görevin, fizyoterapi profesyonelleri için en etkili, tıbbi doğrulukta ve stratejik sosyal medya içeriklerini üretmektir.
Çok hızlı ve doğrudan sonuç odaklı çalışmalısın.
`;

function cleanJSONResponse(text: string): string {
  let cleaned = text;
  cleaned = cleaned.replace(/```json\n?/g, "");
  cleaned = cleaned.replace(/```\n?/g, "");
  cleaned = cleaned.replace(/^```\w*\n?/g, "");
  cleaned = cleaned.replace(/\n```$/g, "");
  cleaned = cleaned.trim();
  const jsonStart = cleaned.indexOf("{");
  const jsonEnd = cleaned.lastIndexOf("}");
  if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
    cleaned = cleaned.slice(jsonStart, jsonEnd + 1);
  }
  return cleaned;
}

function parseJSONWithFallback(text: string): object {
  try {
    return JSON.parse(cleanJSONResponse(text));
  } catch (e) {
    return {
      error: "JSON Parsing Error",
      title: "Yeni Fizyoterapi İçeriği",
      caption: text.slice(0, 500)
    };
  }
}

async function generateFreeImage(prompt: string): Promise<string> {
  const seed = Math.floor(Math.random() * 1000000);
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?seed=${seed}&width=1024&height=1024&nologo=true&enhance=true`;
}

export async function enrichPrompt(prompt: string): Promise<string> {
  try {
    const model = getModel("gemini-2.0-flash-exp");
    const fullPrompt = `Kullanıcı İstemi: "${prompt}". Bu istemi sosyal medya AI görsel ve metin üreticisi için ultra profesyonel bir prompte dönüştür. SADECE promptu döndür.`;
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    return prompt; 
  }
}

export async function generateContent({ 
  userPrompt, type, tone, language, 
  targetAudience = "general", 
  postLength = "medium", 
  callToActionType = "appointment", 
  useEmojis = true 
}: GenerateParams) {
  try {
    const model = getModel("gemini-2.0-flash-exp");
    
    const fullPrompt = `
      ${SYSTEM_INSTRUCTION}
      Kullanıcı İsteği: "${userPrompt}"
      Format: ${type} | Ton: ${tone} | Kitle: ${targetAudience}
      
      Lütfen şu JSON yapısında yanıt ver:
      {
        "thinking": "Stratejik kısa not",
        "title": "İçerik Başlığı",
        "hook": "Durdurucu ilk cümle",
        "mainHeadline": "Ana slogan",
        "caption": "Instagram açıklaması",
        "hashtags": ["#etiket"],
        "imageDescription": "Ultra realistic English prompt for clinical photography",
        "designHints": {
           "primaryColor": "#HEX",
           "layoutType": "modern"
        },
        "strategy": {
           "bestTimeToPost": "Saat",
           "contentPillar": "Pillar"
        }
      }
    `;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();
    const parsed = parseJSONWithFallback(text) as any;
    
    const freeImageUrl = await generateFreeImage(parsed.imageDescription || userPrompt);
    
    return {
      ...parsed,
      generatedImageUrl: freeImageUrl,
      parsed: true
    };
  } catch (error) {
    console.error("Generation error:", error);
    return {
      title: "Hata",
      caption: "Sistem şu an çok yoğun. Lütfen 30 saniye sonra tekrar deneyin.",
      generatedImageUrl: `https://image.pollinations.ai/prompt/${encodeURIComponent(userPrompt)}?enhance=true`,
      error: true
    };
  }
}
