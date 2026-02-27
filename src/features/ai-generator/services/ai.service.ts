import { getModel } from "@/lib/google-ai";

const SYSTEM_INSTRUCTION = `
Sen uzman bir Fizyoterapist ve Sosyal Medya İçerik Stratejistisin. 
Görevin, fizyoterapi kliniklerine ve profesyonellerine yönelik, Instagram algoritmasına uyumlu, 
SEO odaklı ve bilimsel temelli ancak halkın anlayabileceği dilde içerikler üretmektir.

İçerik Stratejisi Kuralları:
1. Dil: Samimi, profesyonel, güven verici ve motive edici (Örn: "Birlikte iyileşelim").
2. Format: Başlık, açıklama ve en az 10 adet spesifik hashtag.
3. Görsel Betimleme: Eğer bir görsel üretilecekse, medikal doğrulukta ama estetik (modern klinik ortamı, mutlu hastalar, anatomik detaylar) bir sahne betimle.
4. Call to Action (CTA): Her zaman kullanıcıyı randevu almaya veya bir egzersizi denemeye teşvik et.

Kullanıcı talebine göre en iyi sonucu üret.
`;

export async function generateContent(userPrompt: string, type: "text" | "image" | "both" = "text") {
  const model = getModel("gemini-1.5-flash");
  
  const fullPrompt = `
    ${SYSTEM_INSTRUCTION}
    
    Kullanıcı Talebi: ${userPrompt}
    İstenen Tür: ${type}
    
    Lütfen yanıtı JSON formatında döndür:
    {
      "title": "İçerik Başlığı",
      "caption": "Instagram Açıklaması",
      "hashtags": ["#fizyoterapi", "..."],
      "imageDescription": "Yapay zekanın görsel üretmesi için detaylı prompt",
      "suggestedMusic": "Trend olan müzik türü"
    }
  `;

  const result = await model.generateContent(fullPrompt);
  const response = await result.response;
  const text = response.text();
  
  try {
    // Gemini bazen markdown bloğu içinde döndürebiliyor, onu temizle
    const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("AI JSON Parse Error:", error);
    return { error: "İçerik üretilirken bir hata oluştu.", raw: text };
  }
}
