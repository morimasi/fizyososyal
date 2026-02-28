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
    console.log("First JSON parse failed, trying regex extraction");
    
    const jsonMatches = text.match(/\{[\s\S]*\}/g);
    
    if (jsonMatches) {
      for (const match of jsonMatches) {
        try {
          const cleanedMatch = cleanJSONResponse(match);
          const parsed = JSON.parse(cleanedMatch);
          
          if (parsed.title || parsed.caption || parsed.hook) {
            return parsed;
          }
        } catch {
          continue;
        }
      }
    }
    
    console.error("All JSON parsing attempts failed");
    
    return {
      error: "İçerik yapılandırılırken bir hata oluştu",
      raw: text.slice(0, 500),
      parsed: false,
      title: "İçerik Başlığı",
      hook: "Bu içerik için fizyoterapi uzmanınızdan randevu alın!",
      caption: text.slice(0, 500),
      hashtags: ["#fizyoterapi", "#rehabilitasyon", "#fizik tedavi", "#sağlık"],
      imageDescription: "Modern bir fizyoterapi kliniği iç mekanı",
      callToAction: "Detaylı bilgi için DM!"
    };
  }
}

export async function enrichPrompt(prompt: string): Promise<string> {
  const model = getModel("gemini-1.5-flash");
  const fullPrompt = `
    Sen profesyonel bir Prompt Mühendisi ve Fizyoterapi İçerik Stratejistisin.
    Aşağıdaki basit kullanıcı istemini, bir AI görsel ve metin üreticisinden en yüksek verimi alacak şekilde ultra profesyonel, detaylı ve klinik bağlamı güçlü bir prompte dönüştür.
    
    Kullanıcı İstemi: "${prompt}"
    
    Yeni prompt şunları içermeli:
    - Klinik doğruluk ve tıbbi terminoloji (uygun yerlerde)
    - Hedef kitlenin psikolojik tetikleyicileri
    - Görsel kompozisyon detayları
    - İçeriğin stratejik amacı (eğitici, güven verici, satış odaklı vb.)
    
    SADECE zenginleştirilmiş prompt metnini döndür.
  `;

  const result = await model.generateContent(fullPrompt);
  const response = await result.response;
  return response.text().trim();
}

export async function generateContent({ 
  userPrompt, type, tone, language, 
  targetAudience = "general", 
  postLength = "medium", 
  callToActionType = "appointment", 
  useEmojis = true 
}: GenerateParams) {
  const model = getModel("gemini-1.5-flash");
  
  // ... (Existing prompt logic)
  
  const result = await model.generateContent(fullPrompt);
  const response = await result.response;
  const text = response.text();
  
  console.log("AI Raw Response length:", text.length);

  const parsed = parseJSONWithFallback(text) as Record<string, unknown>;
  
  // Disabled Image generation to prevent 502 Bad Gateway (timeouts)
  // Let the client or a separate background job handle this if needed
  
  return {
    ...parsed,
    generatedImageBase64: undefined,
    parsed: (parsed as any).parsed !== false,
  };
}
