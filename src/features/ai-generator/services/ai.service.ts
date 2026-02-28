import { getModel } from "@/lib/google-ai";

export type ContentType = "post" | "carousel" | "reels" | "ad";
export type ContentTone = "professional" | "friendly" | "scientific" | "motivational";

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

export async function generateContent({ 
  userPrompt, type, tone, language, 
  targetAudience = "general", 
  postLength = "medium", 
  callToActionType = "appointment", 
  useEmojis = true 
}: GenerateParams) {
  const model = getModel("gemini-2.5-flash");
  
  let typeSpecificPrompt = "";
  if (type === "carousel") {
    typeSpecificPrompt = "Bu bir Carousel (kaydırmalı post) içeriğidir. Lütfen her slayt için ayrı metinler üret (En az 5 slayt).";
  } else if (type === "reels") {
    typeSpecificPrompt = "Bu bir Reels videosu senaryosudur. Saniye saniye çekim planı ve seslendirme (voiceover) metni üret.";
  }

  // Audience context
  let audienceContext = "Genel kitle";
  if (targetAudience === "athletes") audienceContext = "Sporcular ve aktif bireyler (spor yaralanmaları, performans, rehabilitasyon odaklı)";
  else if (targetAudience === "elderly") audienceContext = "İleri yaş grubu (düşme önleme, osteoartrit, hareketliliği koruma, hafif ve güvenli egzersizler)";
  else if (targetAudience === "office_workers") audienceContext = "Masa başı / ofis çalışanları (boyun-sırt ağrısı, ergonomi, duruş bozuklukları odaklı)";
  else if (targetAudience === "women_health") audienceContext = "Kadın sağlığı (pelvik taban, hamilelik ve doğum sonrası rehabilitasyon)";

  // Length context
  let lengthContext = "Standart orta uzunlukta (Instagram algoritmasına uygun 3-4 paragraf)";
  if (postLength === "short") lengthContext = "Kısa ve çok net (Hap bilgi, 1-2 paragraf, hızlı okunan)";
  else if (postLength === "long") lengthContext = "Uzun ve çok detaylı (Kapsamlı eğitim, derinlemesine klinik bilgi, blog yazısı gibi detaylı)";

  // CTA context
  let ctaContext = "Kliniğe / fizyoterapiste randevu almaya teşvik et.";
  if (callToActionType === "comment") ctaContext = "Kullanıcıları yorumlarda soru sormaya veya deneyimlerini paylaşmaya teşvik et.";
  else if (callToActionType === "save") ctaContext = "Bu değerli bilgiyi sonradan kullanmak üzere kaydetmelerini iste.";
  else if (callToActionType === "share") ctaContext = "Bu sorunu yaşayan bir tanıdığına/arkadaşına göndermesi için teşvik et.";
  else if (callToActionType === "dm") ctaContext = "Detaylı bilgi veya ücretsiz danışmanlık için DM atmalarını iste.";

  const fullPrompt = `
    ${SYSTEM_INSTRUCTION}
    
    Kullanıcı Talebi: ${userPrompt}
    İçerik Türü: ${type}
    Tonlama: ${tone}
    Dil: ${language}
    Hedef Kitle: ${audienceContext}
    İçerik Uzunluğu: ${lengthContext}
    Emoji Kullanımı: ${useEmojis ? "Bol ve stratejik emoji kullan." : "LÜTFEN HİÇ EMOJİ KULLANMA (Sıfır emoji, ciddi görünüm)."}
    Aksiyon Çağrısı (CTA) Amacı: ${ctaContext}
    ${typeSpecificPrompt}
    
    ÖNEMLİ: Yanıtını SADECE ve SADECE geçerli JSON olarak döndür. Başka hiçbir metin yazma.
    JSON formatı:
    {
      "title": "İçerik Başlığı (Stratejik)",
      "hook": "Dikkat çekici kanca cümlesi",
      "caption": "Instagram Açıklaması (Emoji zengini, paragraflara bölünmüş)",
      "hashtags": ["#fizyoterapi", "#rehabilitasyon", ...],
      "imageDescription": "Görsel üretim modeli (Stable Diffusion) için ultra detaylı İNGİLİZCE prompt",
      "carouselSlides": [
         {"slide": 1, "text": "Slayt metni", "visual": "Görsel betimleme"},
         {"slide": 2, "text": "...", "visual": "..."}
      ],
      "reelsScript": {
         "scene1": {"duration": "0-3s", "action": "...", "voiceover": "..."},
         "scene2": "..."
      },
      "suggestedMusic": "Trend müzik önerisi",
      "callToAction": "Etkili bir kapanış cümlesi"
    }
  `;

  const result = await model.generateContent(fullPrompt);
  const response = await result.response;
  const text = response.text();
  
  console.log("AI Raw Response length:", text.length);

  const parsed = parseJSONWithFallback(text) as Record<string, unknown>;
  
  let safePrompt = parsed.imageDescription ? String(parsed.imageDescription).substring(0, 200) : "";
  // Ensure we don't end with a broken word or punctuation
  safePrompt = safePrompt.replace(/%20/g, ' ').replace(/[^a-zA-Z0-9\s,.-]/g, '').trim();
  
  const imageUrl = safePrompt 
    ? `https://image.pollinations.ai/prompt/${encodeURIComponent(safePrompt)}?width=1080&height=1080&nologo=true`
    : undefined;
  
  return {
    ...parsed,
    generatedImageUrl: imageUrl,
    parsed: parsed.parsed !== false,
  };
}
