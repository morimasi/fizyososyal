import { getModel } from "@/lib/google-ai";

export type ContentType = "post" | "carousel" | "reels" | "ad";
export type ContentTone = "professional" | "friendly" | "scientific" | "motivational";

interface GenerateParams {
  userPrompt: string;
  type: ContentType;
  tone: ContentTone;
  language: string;
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

export async function generateContent({ userPrompt, type, tone, language }: GenerateParams) {
  const model = getModel("gemini-1.5-pro"); // Daha kaliteli sonuç için Pro kullanıyoruz
  
  let typeSpecificPrompt = "";
  if (type === "carousel") {
    typeSpecificPrompt = "Bu bir Carousel (kaydırmalı post) içeriğidir. Lütfen her slayt için ayrı metinler üret (En az 5 slayt).";
  } else if (type === "reels") {
    typeSpecificPrompt = "Bu bir Reels videosu senaryosudur. Saniye saniye çekim planı ve seslendirme (voiceover) metni üret.";
  }

  const fullPrompt = `
    ${SYSTEM_INSTRUCTION}
    
    Kullanıcı Talebi: ${userPrompt}
    İçerik Türü: ${type}
    Tonlama: ${tone}
    Dil: ${language}
    ${typeSpecificPrompt}
    
    Lütfen yanıtı ŞEKİLLENDİRİLMİŞ JSON formatında döndür:
    {
      "title": "İçerik Başlığı (Stratejik)",
      "hook": "Dikkat çekici kanca cümlesi",
      "caption": "Instagram Açıklaması (Emoji zengini, paragraflara bölünmüş)",
      "hashtags": ["#fizyoterapi", "#rehabilitasyon", "... (en az 15 adet)"],
      "imageDescription": "Görsel üretim modeli için ultra detaylı, ışıklandırma ve kompozisyon içeren prompt",
      "carouselSlides": [
         {"slide": 1, "text": "Slayt metni", "visual": "Görsel betimleme"},
         {"slide": 2, "text": "...", "visual": "..."}
      ],
      "reelsScript": {
         "scene1": {"duration": "0-3s", "action": "...", "voiceover": "..."},
         "scene2": "..."
      },
      "suggestedMusic": "Spesifik bir trend müzik türü veya ritmi",
      "callToAction": "Etkili bir kapanış cümlesi"
    }
  `;

  const result = await model.generateContent(fullPrompt);
  const response = await result.response;
  const text = response.text();
  
  try {
    const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("AI JSON Parse Error:", error);
    return { error: "İçerik yapılandırılırken bir hata oluştu.", raw: text };
  }
}
