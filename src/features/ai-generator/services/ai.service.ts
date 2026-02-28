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
Sen "Fizyososyal AI v2" multimodal akıl yürütme (thinking) modelisin.
Görevin, sadece içerik üretmek değil, bir stratejist gibi "DÜŞÜNEREK" en etkili sonucu bulmaktır.

AKIL YÜRÜTME ADIMLARIN (THINKING STEPS):
1. KLİNİK ANALİZ: Konunun fizyoterapi bilimindeki yerini analiz et (biyomekanik, anatomi, rehabilitasyon).
2. PSİKOLOJİK ANALİZ: Hedef kitlenin o anki duygusal durumunu ve ağrı seviyesini düşün.
3. STRATEJİK TASARIM: Hangi renklerin ve hangi yerleşimin güven vereceğine karar ver.
4. MULTIMODAL KURGU: Görselin nasıl olması gerektiğini bir film yönetmeni gibi kurgula.

Üretimlerini bu derinlikte yapmalısın.
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
  cleaned = cleaned.replace(/,\s*}/g, "}");
  cleaned = cleaned.replace(/,\s*\]/g, "]");
  return cleaned;
}

function parseJSONWithFallback(text: string): object {
  const cleaned = cleanJSONResponse(text);
  try {
    return JSON.parse(cleaned);
  } catch (firstError) {
    const jsonMatches = text.match(/\{[\s\S]*\}/g);
    if (jsonMatches) {
      for (const match of jsonMatches) {
        try {
          const parsed = JSON.parse(cleanJSONResponse(match));
          if (parsed.title || parsed.caption || parsed.hook) return parsed;
        } catch { continue; }
      }
    }
    return {
      error: "İçerik yapılandırılırken bir hata oluştu",
      title: "İçerik Başlığı",
      hook: "Fizyoterapi uzmanınızdan randevu alın!",
      caption: text.slice(0, 500),
      hashtags: ["#fizyoterapi", "#sağlık"],
      callToAction: "Detaylı bilgi için DM!"
    };
  }
}

// ÜCRETSİZ VE HIZLI GÖRSEL ÜRETİMİ (POLLINATIONS)
async function generateFreeImage(prompt: string): Promise<string> {
  const seed = Math.floor(Math.random() * 1000000);
  const encodedPrompt = encodeURIComponent(prompt);
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?seed=${seed}&width=1024&height=1024&nologo=true&enhance=true`;
}

export async function enrichPrompt(prompt: string): Promise<string> {
  try {
    const model = getModel("gemini-2.0-flash-thinking-exp-01-21");
    const fullPrompt = `
      Sen profesyonel bir Prompt Mühendisi ve Fizyoterapi İçerik Stratejistisin.
      Kullanıcı İstemi: "${prompt}"
      SADECE zenginleştirilmiş prompt metnini döndür.
    `;
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Enrichment error:", error);
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
    const model = getModel("gemini-2.0-flash-thinking-exp-01-21");
    
    const fullPrompt = `
      Kullanıcı İsteği: "${userPrompt}"
      Format: ${type} | Ton: ${tone} | Kitle: ${targetAudience}
      
      Lütfen önce bu içeriği DÜŞÜN (Thinking Process) ve ardından şu JSON yapısında yanıt ver:
      {
        "thinking": "İçeriği neden bu şekilde yapılandırdığına dair kısa stratejik notun",
        "title": "İçerik Başlığı",
        "hook": "Durdurucu ilk cümle",
        "mainHeadline": "Ana Başlık",
        "subHeadline": "Alt Başlık",
        "slogan": "Slogan",
        "vignette": "Özet",
        "highlights": ["Madde 1", "Madde 2"],
        "caption": "Instagram açıklaması",
        "hashtags": ["#etiket"],
        "imageDescription": "Görsel için ultra gerçekçi İngilizce prompt",
        "designHints": {
           "primaryColor": "#HEX",
           "secondaryColor": "#HEX",
           "fontFamily": "Inter",
           "layoutType": "modern | scientific | bold"
        },
        "strategy": {
           "bestTimeToPost": "Saat",
           "targetKeywords": ["kelime"],
           "potentialReach": "Erişim",
           "contentPillar": "Pillar"
        }
      }
    `;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();
    const parsed = parseJSONWithFallback(text) as any;
    
    // ÜCRETSİZ VE HIZLI GÖRSEL ÜRETİMİ
    const freeImageUrl = await generateFreeImage(parsed.imageDescription || userPrompt);
    
    return {
      ...parsed,
      generatedImageUrl: freeImageUrl,
      parsed: parsed.error ? false : true
    };
  } catch (error) {
    console.error("Generation error:", error);
    return {
      title: "Yeni Fizyoterapi İçeriği",
      caption: userPrompt,
      generatedImageUrl: `https://image.pollinations.ai/prompt/${encodeURIComponent(userPrompt)}?enhance=true`,
      error: true
    };
  }
}
