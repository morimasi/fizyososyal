import { GoogleGenerativeAI } from "@google/generative-ai";
import type { GenerateTextInput } from "@/types";

const PHYSIO_SYSTEM_PROMPT = `Sen bir fizyoterapi kliniği için uzman dijital içerik yazarısın. 
Tıbbi terimleri hasta dostu, anlaşılır bir dile çevir. 
Her zaman güvenli, kanıta dayalı fizyoterapi bilgisi sun.
Türkçe yaz. Empati kur. Motivasyonel ol. Müşteriyi klinik hizmetlerine çekmeye çalış.`;

const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY eksik. Lütfen Vercel ayarlarından ekleyin.");
    }
    return new GoogleGenerativeAI(apiKey);
};

export async function generatePostText(input: GenerateTextInput): Promise<{
    content: string;
    hashtags: string;
    title: string;
}> {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({
        model: input.model === "gemini-pro" ? "gemini-1.5-pro" : "gemini-1.5-flash",
        systemInstruction: PHYSIO_SYSTEM_PROMPT,
    });

    const toneMap = {
        profesyonel: "resmi ve güven verici",
        samimi: "samimi ve sıcak",
        eğitici: "eğitici ve bilgilendirici",
        "motive edici": "motive edici ve enerjik",
    };

    const tone = input.tone ? toneMap[input.tone] : "samimi ve eğitici";
    const voice = input.brandVoice ? `Klinik marka sesi: "${input.brandVoice}". ` : "";

    let formatInstruction = `"content" alanı içine tek sayfalık standart Instagram post metni yaz (150-300 kelime, emoji kullan, HTML <br/> ile paragraflara ayır).`;
    if (input.postFormat === "carousel") {
        formatInstruction = `"content" alanı içine 5-8 sayfalık bir kaydırmalı (carousel) gönderi metni yaz. Her slayt için HTML yapısı kullan. Örnek: <b>Slayt 1: [Başlık]</b><br/>[Metin...]<br/><br/><b>Slayt 2: ...</b>`;
    } else if (input.postFormat === "video") {
        formatInstruction = `"content" alanı içine kısa bir Reels/TikTok video senaryosu yaz. HTML yapısı kullan. Örnek: <b>Sahne 1:</b> [Görüntü Açıklaması]<br/>🎤 <b>Seslendirme:</b> [Konuşma Metni...]<br/><br/>`;
    } else if (input.postFormat === "ad") {
        formatInstruction = `"content" alanı içine dikkat çekici, hasta dönüşümü odaklı (AIDA modeli) bir reklam broşürü/post metni yaz. HTML yapısı kullanıp, dikkat çekici yerleri <strong> ile vurgula. Call-to-action (Eyleme Çağrı) içersin.`;
    }

    const evidencePrompt = input.evidenceBased
        ? "DİKKAT KANITA DAYALI İÇERİK: Üreteceğin bu içerikte mutlaka gerçek fizyoterapi literatüründen, Cochrane derleme veya JOSPT gibi popüler tıbbi makalelerden referanslar ver. 'Kaynaklar' başlığı altında metnin sonunda alıntıları (yazar, yıl, dergi) listele. Asla uydurma (hallucination) bilgi verme."
        : "";

    const prompt = `
${voice}
Konu: "${input.topic}"
Ton: ${tone}
Format: ${input.postFormat ?? "post"}
${input.trending ? "Bu konu şu an trend. Dikkat çekici bir açılış yap." : ""}
${evidencePrompt}

Lütfen aşağıdaki JSON formatında yanıt ver:
{
  "title": "Başlık (max 60 karakter)",
  "content": ${formatInstruction},
  "hashtags": "25 adet sektörel hashtag (# ile başlayan, aralarında boşluk)"
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // JSON parse - markdown code fence temizle
    const jsonStr = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    try {
        const parsed = JSON.parse(jsonStr);
        return {
            title: parsed.title ?? "Fizyoterapi İçeriği",
            content: parsed.content ?? text,
            hashtags: parsed.hashtags ?? "#fizyoterapi #physiotherapy #sağlık",
        };
    } catch {
        return {
            title: input.topic,
            content: text,
            hashtags: "#fizyoterapi #physiotherapy #sağlık #egzersiz #rehabilitasyon",
        };
    }
}

export async function generateVoiceCommandResponse(transcript: string): Promise<string> {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: `Sen bir fizyoterapi kliniğinin AI asistanısın. 
    Sesli komutları anlayıp ne tür içerik üretileceğini belirle. 
    Kısa, net JSON yanıtlar ver.`,
    });

    const prompt = `
Sesli komut: "${transcript}"

Bu komuttan içerik üretim parametreleri çıkar ve aşağıdaki JSON formatında ver:
{
  "topic": "İçerik konusu",
  "postType": "bilgi | egzersiz | motivasyon | hizmet",
  "tone": "profesyonel | samimi | eğitici | motive edici",
  "message": "Kullanıcıya gösterilecek onay mesajı"
}
`;

    const result = await model.generateContent(prompt);
    return result.response.text();
}
