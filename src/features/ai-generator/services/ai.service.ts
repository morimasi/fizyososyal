import { getModel, getImageModel, MODEL_TEXT, MODEL_ENRICH } from "@/lib/google-ai";
import { HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
];

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

// =====================================================
// Video içerik türleri için Veo 3.1 yönlendirme bilgisi
// =====================================================
const VIDEO_TYPES: ContentType[] = ["reels", "story"];

const VIDEO_INFO = {
  engine: "Veo 3.1",
  tools: ["Flow (AI Filmmaking Suite)", "Whisk Animate"],
  freeCredits: "Ayda 100 kredi (4–8 sn klipler)",
  note: "Filigran dahil. 720p/1080p çözünürlük, native ses destekli.",
  links: {
    flow: "https://flow.google",
    whisk: "https://labs.google/whisk",
    veo: "https://deepmind.google/technologies/veo/",
  },
};

const SYSTEM_INSTRUCTION = `
Sen "Fizyososyal AI" multimodal strateji modelisin (Gemini 3.1 Pro).
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

// =====================================================
// Görsel Üretim — Gemini 3.1 Flash Image (Nano Banana 2)
// =====================================================
async function generateGeminiImage(prompt: string): Promise<string | null> {
  try {
    const model = getImageModel();
    const result = await model.generateContent(
      `Generate a high-quality, clinical, professional medical photography image for physiotherapy social media. Style: ultra realistic, clean white/medical environment. Subject: ${prompt}`
    );
    const response = result.response;

    // Önce inline data (base64) kontrol et
    for (const candidate of response.candidates ?? []) {
      for (const part of candidate.content?.parts ?? []) {
        if ((part as any).inlineData?.mimeType?.startsWith("image/")) {
          const { mimeType, data } = (part as any).inlineData;
          return `data:${mimeType};base64,${data}`;
        }
      }
    }
    return null;
  } catch (err) {
    console.warn("Gemini Image API hatası, fallback devrede:", err);
    return null;
  }
}

// Fallback: Pollinations (API erişimi yokken)
function fallbackImageUrl(prompt: string): string {
  const seed = Math.floor(Math.random() * 1000000);
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?seed=${seed}&width=1024&height=1024&nologo=true&enhance=true`;
}

export async function enrichPrompt(prompt: string): Promise<string> {
  try {
    const model = getModel(MODEL_ENRICH);
    const fullPrompt = `Sen bir sosyal medya yöneticisi ve klinik metin yazarısın. Kullanıcının şu fikrini profesyonel, tıbbi açıdan güvenilir ve estetik bir prompta çevir: "${prompt}". Lütfen MERHABA veya AÇIKLAMA yazma. YALNIZCA KULLANILABİLECEK YENİ PROMPTU DÖNDÜR.`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const enrichedText = response.text().trim();

    if (!enrichedText || enrichedText.length < 5) {
      throw new Error("AI sonucu eksik dondurdu.");
    }
    return enrichedText;
  } catch (error: any) {
    console.error("Enrich API Hatasi:", error?.message || error);
    // Hatanın tam yansıması yerine, en azından orijinal metni biraz estetikleştirip geri dönüyoruz
    return `${prompt} (Yüksek çözünürlüklü, klinik standartlarda)`;
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
    const model = getModel(MODEL_TEXT, SAFETY_SETTINGS);

    const fullPrompt = `
      ${SYSTEM_INSTRUCTION}
      Kullanıcı İsteği: "${userPrompt}"
      Format: ${type} | Ton: ${tone} | Kitle: ${targetAudience}
      İçerik Uzunluğu: ${postLength} | CTA: ${callToActionType} | Emoji: ${useEmojis}
      
      Lütfen şu JSON yapısında yanıt ver:
      {
        "thinking": "Stratejik kısa not",
        "title": "İçerik Başlığı",
        "hook": "Durdurucu ilk cümle",
        "mainHeadline": "Ana slogan",
        "caption": "Instagram açıklaması",
        "hashtags": ["#etiket"],
        "imageDescription": "Ultra realistic English prompt for clinical physiotherapy photography",
        "designHints": {
           "primaryColor": "#HEX",
           "layoutType": "modern"
        },
        "strategy": {
           "bestTimeToPost": "Saat",
           "contentPillar": "Pillar",
           "potentialReach": "X.Xk - X.Xk",
           "targetKeywords": ["kelime"]
        }
      }
    `;

    // 1. Metin ve Görsel Üretimini Paralel Başlat
    const textPromise = model.generateContent(fullPrompt);
    const imagePromise = generateGeminiImage(userPrompt);

    const [textResult, geminiImageBase64] = await Promise.all([textPromise, imagePromise]);

    const response = await textResult.response;
    const text = response.text();
    const parsed = parseJSONWithFallback(text) as any;

    // Görsel base64 varsa route'taki Vercel Blob yükleyici devreye girer
    const imageResult = geminiImageBase64
      ? { generatedImageBase64: geminiImageBase64 }
      : { generatedImageUrl: fallbackImageUrl(parsed.imageDescription || userPrompt) };

    const videoExtra = VIDEO_TYPES.includes(type) ? { videoInfo: VIDEO_INFO } : {};

    return {
      ...parsed,
      ...imageResult,
      ...videoExtra,
      imageModel: "gemini-1.5-flash-image",
      textModel: "gemini-1.5-flash-text",
      parsed: true
    };
  } catch (error: any) {
    console.error("Generation error details:", error);

    let detailMessage = error?.message || String(error);
    if (detailMessage.includes("SAFETY")) {
      detailMessage = "İçerik Gemini güvenlik filtrelerine takıldı. Lütfen tıbbi tavsiye içermeyen, daha genel bir dil kullanmayı deneyin.";
    }

    return {
      title: "Hata",
      caption: "Sistem şu an bu içeriği oluştururken bir kısıtlamaya takıldı.",
      details: detailMessage,
      error: true
    };
  }
}
