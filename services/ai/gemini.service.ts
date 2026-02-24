import { GoogleGenerativeAI } from "@google/generative-ai";
import { GenerateTextInput } from "@/types";
import { FormatSettings } from "@/types/studio";

const PHYSIO_SYSTEM_PROMPT = `Sen dünyanın en iyi fizyoterapi kliniği içerik ekibisin. Şu 4 uzman kimliğiyle hareket et:
1. Kıdemli Fizyoterapist: Tıbbi doğruluk ve hasta güvenliğinden sorumlu.
2. Kreatif Grafik Tasarımcı: Görsel hiyerarşi ve estetikten sorumlu.
3. Dijital Reklamcı (Copywriter): Dönüşüm oranı (conversion) ve ilgi çekici metinlerden sorumlu.
4. Sanat Danışmanı: Renk uyumu, kompozisyon ve marka prestijinden sorumlu.

Tıbbi terimleri hasta dostu dile çevirirken reklamcı kimliğinle merak uyandır, tasarımcı kimliğinle görsel yapıyı (HTML tagları ile) kurgula. Türkçe yaz. Empati kur. Motivasyonel ol.`;

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
    console.log("[GEMINI] İstek alındı:", { topic: input.topic, model: input.model });

    const genAI = getGeminiClient();

    // Comprehensive fallback list for production reliability
    const modelsToTry = input.model === "gemini-pro"
        ? ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-1.0-pro", "gemini-pro"]
        : ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.0-pro", "gemini-pro"];

    const toneMap = {
        profesyonel: "resmi ve güven verici",
        samimi: "samimi ve sıcak",
        eğitici: "eğitici ve bilgilendirici",
        "motive edici": "motive edici ve enerjik",
    };

    const tone = input.tone ? toneMap[input.tone] : "samimi ve eğitici";
    const voice = input.brandVoice ? `Klinik marka sesi: "${input.brandVoice}". ` : "";

    const settings = (input as any).settings as FormatSettings;
    const style = settings?.visualStyle || "clinical";
    const audience = settings?.targetAudience || "general";

    let formatInstruction = `"content" alanı içine tek sayfalık standart Instagram post metni yaz (150-300 kelime, emoji kullan, HTML <br/> ile paragraflara ayır).`;
    if (input.postFormat === "carousel") {
        const slides = settings?.slideCount || 6;
        formatInstruction = `"content" alanı içine tam ${slides} sayfalık bir kaydırmalı (carousel) gönderi metni yaz. Her slayt için HTML yapısı kullan. Örnek: <b>Slayt 1: [Başlık]</b><br/>[Metin...]<br/><br/><b>Slayt 2: ...</b>`;
    } else if (input.postFormat === "video") {
        const videoStyle = settings?.videoStyle || "informational";
        formatInstruction = `"content" alanı içine bir ${videoStyle} tarzında Reels/TikTok video senaryosu yaz. HTML yapısı kullan. Örnek: <b>Sahne 1:</b> [Görüntü Açıklaması]<br/>🎤 <b>Seslendirme:</b> [Konuşma Metni...]<br/><br/>`;
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
${evidencePrompt}

Ek Direktifler:
1. Görsel Stil: ${style} (Bu stili yansıtacak kelimeler seç).
2. Hedef Kitle: ${audience} (Bu kitleye uygun bir dil ve hitabet kullan).
3. Sanat Danışmanı Notu: İçerik premium ve prestijli hissettirmeli.

Lütfen aşağıdaki JSON formatında yanıt ver:
{
  "title": "Başlık (max 60 karakter)",
  "content": ${formatInstruction},
  "hashtags": "25 adet sektörel hashtag (# ile başlayan, aralarında boşluk)"
}
`;

    let text: string = "";
    let success = false;
    let lastError: any = null;

    for (const modelId of modelsToTry) {
        try {
            console.log(`[GEMINI] Model deneniyor: ${modelId}`);
            const model = genAI.getGenerativeModel({
                model: modelId,
                systemInstruction: PHYSIO_SYSTEM_PROMPT,
            });

            const result = await model.generateContent(prompt);
            const response = result.response;

            if (response.promptFeedback?.blockReason) {
                console.warn(`[GEMINI] ${modelId} engellendi: ${response.promptFeedback.blockReason}`);
                continue;
            }

            text = response.text();
            success = true;
            console.log(`[GEMINI] ${modelId} ile üretim başarılı.`);
            break;
        } catch (err: any) {
            lastError = err;
            console.warn(`[GEMINI] ${modelId} hatası:`, err.message);
        }
    }

    if (!success) {
        console.error("[GEMINI] Tüm model denemeleri başarısız oldu.");
        throw lastError || new Error("İçerik üretilemedi, Google API modellerine ulaşılamıyor.");
    }

    try {
        console.log("[GEMINI] Yanıt metni uzunluğu:", text.length);
        const jsonStr = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

        try {
            console.log("[GEMINI] JSON ayrıştırılıyor...");
            const parsed = JSON.parse(jsonStr);
            return {
                title: parsed.title ?? "Fizyoterapi İçeriği",
                content: parsed.content ?? text,
                hashtags: parsed.hashtags ?? "#fizyoterapi #physiotherapy #sağlık",
            };
        } catch (jsonErr: any) {
            console.warn("[GEMINI] JSON ayrıştırma hatası, ham metin dönülüyor:", jsonErr.message);
            return {
                title: input.topic,
                content: text,
                hashtags: "#fizyoterapi #physiotherapy #sağlık #egzersiz #rehabilitasyon",
            };
        }
    } catch (apiErr: any) {
        console.error("[GEMINI] Veri İşleme Hatası:", apiErr.message);
        throw apiErr;
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

export async function optimizePhysioPrompt(topic: string): Promise<string> {
    console.log("[GEMINI/OPTIMIZE] Başlatıldı. Konu:", topic);
    const genAI = getGeminiClient();

    const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.0-pro", "gemini-pro"];
    let success = false;
    let lastError: any = null;
    let resultText = topic;

    for (const modelId of modelsToTry) {
        try {
            console.log(`[GEMINI/OPTIMIZE] Model deneniyor: ${modelId}`);
            const model = genAI.getGenerativeModel({
                model: modelId,
                systemInstruction: `Sen dünyanın en iyi fizyoterapi kliniği kreatif ekibisin (Fizyoterapist + Grafik Tasarımcı + Sanat Danışmanı + Reklamcı). 
Kullanıcının girdiği basit fikirleri, görsel üretim modelleri için sanat yönetmenliği yapılmış profesyonel promptlara dönüştür.

Görsel Direktiflerin:
1. Anatomik ve teknik fizyoterapi doğruluğu (Fizyoterapist gözü).
2. Altın oran, derinlik ve sinematik kompozisyon (Sanat Danışmanı gözü).
3. Modern, minimalist ve premium klinik estetiği (Grafik Tasarımcı gözü).
4. İnsan psikolojisini etkileyen ışık ve renk kullanımı (Reklamcı gözü).

SADECE İngilizce prompt döndür.`,
            });

            const prompt = `Şu konuyu profesyonel bir görsel üretim promptuna dönüştür: "${topic}"`;
            const result = await model.generateContent(prompt);
            const text = result.response.text().trim();

            if (text) {
                console.log(`[GEMINI/OPTIMIZE] ${modelId} ile üretim başarılı.`);
                resultText = text;
                success = true;
                break;
            }
        } catch (err: any) {
            lastError = err;
            console.warn(`[GEMINI/OPTIMIZE] ${modelId} hatası:`, err.message);
        }
    }

    if (!success) {
        console.error("[GEMINI/OPTIMIZE] Tüm model denemeleri başarısız oldu:", lastError?.message);
    }

    return resultText;
}
