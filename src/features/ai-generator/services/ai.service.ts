import { getModel } from "@/lib/google-ai";

export type ContentType = "post" | "carousel" | "reels" | "ad" | "thread" | "story" | "article" | "newsletter";
export type ContentTone = "professional" | "friendly" | "scientific" | "motivational" | "empathetic" | "bold" | "educational";

interface GenerateParams {
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
Sen kıdemli bir Fizyoterapist, Klinik İşletmecisi ve Sosyal Medya İçerik Stratejistisin. 
Görevin, fizyoterapi profesyonelleri için "Premium" kalitede, bilimsel temelli ama yüksek etkileşimli içerikler üretmektir.

Stratejik Kurallar:
1. TIBBİ DOĞRULUK: Fizyoterapi prensiplerine (egzersiz fizyolojisi, biyomekanik) tam uyum sağla.
2. ETKİLEŞİM ODAKLI: Instagram algoritmasının sevdiği "Saveable" (kaydedilebilir) ve "Shareable" (paylaşılabilir) içerik yapıları kur.
3. KANCA (HOOK): İçeriğin ilk cümlesi mutlaka kullanıcının dikkatini çeken bir kanca içermeli.
4. SEO: Fizyoterapi, rehabilitasyon ve ilgili semptomlara yönelik anahtar kelimeleri doğal bir şekilde kullan.
5. GÖRSEL REHBER: Tasarımcıya/AI'ya (Imagen/DALL-E) hitap eden, klinik estetiği yansıtan çok detaylı görsel betimlemeler yap.
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

export async function enrichPrompt(prompt: string): Promise<string> {
  try {
    const model = getModel("gemini-1.5-flash-latest");
    const fullPrompt = `
      Sen profesyonel bir Prompt Mühendisi ve Fizyoterapi İçerik Stratejistisin.
      Kullanıcı İstemi: "${prompt}"
      SADECE zenginleştirilmiş prompt metnini döndür.
    `;
    
    // Using a timeout for the AI call to prevent Vercel 504/502
    const aiPromise = model.generateContent(fullPrompt);
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("AI Timeout")), 15000));
    
    const result = (await Promise.race([aiPromise, timeoutPromise])) as any;
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
    const model = getModel("gemini-1.5-flash-latest");
    
    let typeSpecificPrompt = "";
    if (type === "carousel") typeSpecificPrompt = "Carousel içeriği. 6-10 slayt üret.";
    else if (type === "reels") typeSpecificPrompt = "Reels senaryosu. Saniye saniye plan üret.";
    else if (type === "thread") typeSpecificPrompt = "X/Twitter thread. 5-10 tweet.";
    else if (type === "article") typeSpecificPrompt = "Detaylı makale. H1, H2 başlıkları kullan.";

    let audienceContext = "Genel kitle";
    if (targetAudience === "athletes") audienceContext = "Sporcular";
    else if (targetAudience === "elderly") audienceContext = "İleri yaş grubu";
    else if (targetAudience === "office_workers") audienceContext = "Ofis çalışanları";
    else if (targetAudience === "women_health") audienceContext = "Kadın sağlığı";
    else if (targetAudience === "chronic_pain") audienceContext = "Kronik ağrı";
    else if (targetAudience === "post_op") audienceContext = "Ameliyat sonrası";

    const fullPrompt = `
      ${SYSTEM_INSTRUCTION}
      Kullanıcı Talebi: ${userPrompt}
      İçerik Türü: ${type} | Ton: ${tone} | Dil: ${language}
      Hedef Kitle: ${audienceContext} | Uzunluk: ${postLength}
      Emoji: ${useEmojis ? "Kullan" : "Kullanma"}
      Aksiyon: ${callToActionType}
      ${typeSpecificPrompt}
      
      Yanıtını SADECE şu JSON formatında döndür:
      {
        "title": "Başlık",
        "hook": "Kanca",
        "mainHeadline": "Ana Başlık",
        "subHeadline": "Alt Başlık",
        "slogan": "Slogan",
        "vignette": "Özet",
        "highlights": ["Madde 1", "Madde 2"],
        "caption": "Instagram Açıklaması",
        "hashtags": ["#etiket1"],
        "imageDescription": "Detailed English prompt for image generation",
        "designHints": {
           "primaryColor": "#HEX",
           "secondaryColor": "#HEX",
           "fontFamily": "Inter",
           "layoutType": "modern"
        },
        "strategy": {
           "bestTimeToPost": "Saat",
           "targetKeywords": ["kelime"],
           "potentialReach": "Erişim",
           "contentPillar": "Pillar"
        }
      }
    `;
    
    const aiPromise = model.generateContent(fullPrompt);
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("AI Timeout")), 20000));
    
    const result = (await Promise.race([aiPromise, timeoutPromise])) as any;
    const response = await result.response;
    const text = response.text();
    const parsed = parseJSONWithFallback(text) as any;
    
    return {
      ...parsed,
      generatedImageBase64: undefined,
      parsed: parsed.error ? false : true
    };
  } catch (error) {
    console.error("Generation error:", error);
    // FALLBACK TO PRO IF FLASH FAILS
    try {
      const model = getModel("gemini-pro");
      const result = await model.generateContent(userPrompt);
      const response = await result.response;
      const text = response.text();
      return {
        title: "Fizyoterapi İçeriği",
        hook: "Hareket sağlıktır!",
        caption: text.slice(0, 500),
        hashtags: ["#fizyoterapi"],
        callToAction: "Randevu Al"
      };
    } catch (fallbackError) {
       return {
         title: "Yeni Fizyoterapi İçeriği",
         hook: "Biliyoruz ki hareket sağlıktır!",
         caption: userPrompt + "\n\nDetaylı bilgi için bizimle iletişime geçin.",
         hashtags: ["#fizyoterapi", "#sağlık"],
         callToAction: "Randevu Al"
       };
    }
  }
}
