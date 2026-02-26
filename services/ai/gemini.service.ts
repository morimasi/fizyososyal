import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { GenerateTextInput } from "@/types";
import { FormatSettings } from "@/types/studio";
import { env } from "@/lib/env";
import { redis } from "@/lib/upstash";

const PHYSIO_SYSTEM_PROMPT = `Sen dünyanın en iyi fizyoterapi kliniği içerik ekibisin. Şu 4 uzman kimliğiyle hareket et:
1. Kıdemli Fizyoterapist: Tıbbi doğruluk ve hasta güvenliğinden sorumlu.
2. Kreatif Grafik Tasarımcı: Görsel hiyerarşi ve estetikten sorumlu.
3. Dijital Reklamcı (Copywriter): Dönüşüm oranı (conversion) ve ilgi çekici metinlerden sorumlu.
4. Sanat Danışmanı: Renk uyumu, kompozisyon ve marka prestijinden sorumlu.

Tıbbi terimleri hasta dostu dile çevirirken reklamcı kimliğinle merak uyandır, tasarımcı kimliğinle görsel yapıyı (HTML tagları ile) kurgula. Türkçe yaz. Empati kur. Motivasyonel ol.`;

const getGeminiClient = () => {
    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
        console.warn("[GEMINI] GEMINI_API_KEY eksik. AI özellikleri devre dışı kalabilir.");
        return null; // Don't throw, just return null
    }
    return new GoogleGenerativeAI(apiKey);
};

const SAFETY_SETTINGS = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

export async function generatePostText(input: GenerateTextInput): Promise<{
    content: string;
    hashtags: string;
    title: string;
}> {
    console.log("[GEMINI] İstek alındı:", { topic: input.topic, model: input.model });

    const genAI = getGeminiClient();
    if (!genAI) {
        return {
            title: input.topic,
            content: "AI Servisi şu an ulaşılamaz durumda. Lütfen API anahtarınızı kontrol edin.",
            hashtags: "#fizyoterapi #sağlık",
        };
    }

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
    const voice = input.brandVoice ? `Aşağıdaki klinik marka sesi ve kimliğine KESİNLİKLE uy: "${input.brandVoice}". ` : "";
    const keywords = (input as any).brandKeywords?.length > 0
        ? `Aşağıdaki marka anahtar kelimelerini mutlaka içerikte yansıt: ${(input as any).brandKeywords.join(", ")}. `
        : "";

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
${keywords}
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
                safetySettings: SAFETY_SETTINGS,
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
    if (!genAI) return JSON.stringify({ message: "AI Servisi kapalı.", topic: transcript });

    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: `Sen bir fizyoterapi kliniğinin AI asistanısın. 
    Sesli komutları anlayıp ne tür içerik üretileceğini belirle. 
    Kısa, net JSON yanıtlar ver.`,
        safetySettings: SAFETY_SETTINGS,
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
    if (!genAI) return topic;

    const safetySettings = SAFETY_SETTINGS;
    const modelsToTry = ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-1.0-pro"];
    let resultText = topic;
    let success = false;

    // Uzmanlaşmış, Düşünce Zinciri (Chain of Thought - CoT) destekli Prompt Mühendisliği
    for (const modelId of modelsToTry) {
        try {
            console.log(`[GEMINI/OPTIMIZE] Stage 1 deneniyor: ${modelId}`);
            const model = genAI.getGenerativeModel({
                model: modelId,
                safetySettings,
                generationConfig: {
                    temperature: 0.8, // Daha tutarlı yapı için biraz düşürüldü
                    topP: 1,
                    maxOutputTokens: 600,
                    responseMimeType: "application/json" // Çıktıyı kesin garantiye al
                },
                systemInstruction: `Sen dünyanın en inovatif fizyoterapi ve sağlık içerik stratejistisin. 
Kullanıcının verdiği basit kelimeyi veya fikri, tam teşekküllü ve derinlikli bir içerik projesine ('prompt'a) çevirmelisin.

DÜŞÜNCE ZİNCİRİ (Chain of Thought):
1. [Agresif/Gerçekçi Problem]: Hastanın bu konuda yaşadığı asıl zorluk nedir? (Örn: "Sırt ağrısından uyuyamamak")
2. [Bilimsel/Anatomik Neden]: Bu sorunun arkasında hangi biyomekanik veya fizyolojik gerçek var? (Örn: "Postürel kas zayıflığı")
3. [Eyleme Dönük Çözüm]: Fizyoterapi kliniği burada nasıl nokta atışı bir çözüm sunar? (Örn: "3 adımlı postür düzeltici manipülasyon")

KESİN KURALLAR:
1. Girdi metnini kopyalama, doğrudan genişlet.
2. Anlatımı 3. tekil şahıs yerine, doğrudan bir senaryo veya manifesto gibi yaz.
3. Çıktıyı SADECE JSON olarak dön.`
            });

            const prompt = `Girdi Fikri: "${topic}"

Lütfen bu fikri al ve aşağıdaki JSON formatına birebir uyan, 2-3 paragraflık etkileyici bir metne dönüştür:
{
  "optimized_prompt": "Buraya minimum 100 kelimelik, güçlü kancası (hook) olan, anatomik bilgiler içeren ve hastayı kliniğe davet eden büyüleyici metni yaz."
}`;

            const result = await model.generateContent(prompt);
            const text = result.response.text().trim();

            // JSON ayrıştırma güvenliği
            const parsed = JSON.parse(text.replace(/```json\n?/g, "").replace(/```\n?/g, ""));

            if (parsed.optimized_prompt && parsed.optimized_prompt.length > topic.length + 10) {
                console.log(`[GEMINI/OPTIMIZE] Stage 1 başarılı. Uzunluk: ${parsed.optimized_prompt.length}`);
                resultText = parsed.optimized_prompt;
                success = true;
                break;
            }
        } catch (err: any) {
            console.warn(`[GEMINI/OPTIMIZE] Stage 1 (${modelId}) hatası:`, err.message);
        }
    }

    // Stage 2: Prompt Engineering Fallback
    if (!success) {
        try {
            console.log("[GEMINI/OPTIMIZE] Stage 2 (Backup) başlatıldı.");
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", safetySettings });
            const prompt = `Kullanıcının girdiği şu basit konuyu, profesyonel bir sağlık iletişimcisi gibi ele al ve onu detaylı, tıbbi ama anlaşılır, 3 farklı perspektifle (anatomik, psikolojik ve pratik çözüm) genişleterek tek bir zengin bağlam paragrafına çevir. Eski metni tekrar etme! Fikir: "${topic}"`;
            const result = await model.generateContent(prompt);
            const text = result.response.text().trim();
            if (text && text.length > topic.length) {
                resultText = text;
            }
        } catch (err: any) {
            console.error("[GEMINI/OPTIMIZE] Stage 2 başarısız:", err.message);
        }
    }

    return resultText;
}

export async function getDashboardInsights(stats: any, brandData?: { voice?: string, keywords?: string[] }): Promise<{
    trends: Array<{
        id: string;
        title: string;
        subtitle: string;
        description: string;
        tag: string;
        score: number;
        strategy: string;
    }>;
}> {
    const fallback = {
        trends: [
            { id: "1", title: "Bel Sağlığı & Ergonomi", subtitle: "#1 Trend", description: "Oturarak çalışma artışıyla bel egzersizleri revaçta.", tag: "Popüler", score: 85, strategy: "Ofis çalışanlarına yönelik '3 Dakikada Bel Rahatlatma' videosu çekin." },
            { id: "2", title: "Boyun Germe Teknikleri", subtitle: "Hızlı Yükselen", description: "Mobil cihaz kullanımı boyun ağrılarını artırıyor.", tag: "Yükselişte", score: 72, strategy: "Shorts/Reels formatında 'Tech-Neck' çözüm egzersizleri paylaşın." }
        ]
    };

    const cacheKey = "dashboard:insights";
    try {
        if (env.UPSTASH_REDIS_REST_URL) {
            const cached = await redis.get(cacheKey);
            if (cached) {
                console.log("[REDIS/DASHBOARD] Cache hit for insights");
                return cached as any;
            }
        }
    } catch (e) {
        console.warn("[REDIS] Cache read failed for insights:", e);
    }

    const genAI = getGeminiClient();
    if (!genAI) return fallback;

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            safetySettings: SAFETY_SETTINGS,
            generationConfig: {
                temperature: 0.7,
                responseMimeType: "application/json"
            },
            systemInstruction: `Sen dünyanın en iyi dijital sağlık stratejisti ve fizyoterapi trend analistisin. 
Görevin: Kullanıcının kliniğine ait verileri ve marka kimliğini analiz ederek, ona sosyal medyada en yüksek etkileşimi getirecek 3 adet nokta atışı içerik fikri (trend) sunmaktır.

ANALİZ KRİTERLERİ:
1. Marka Sesi: ${brandData?.voice || "Profesyonel ve Güven Verici"}
2. Anahtar Kelimeler: ${brandData?.keywords?.join(", ") || "Fizyoterapi, Sağlık, Egzersiz, İyileşme"}
3. Klinik İstatistikleri (Toplam Erişim, Etkileşimler vb.): ${JSON.stringify(stats)}

ÇIKTI FORMATI (KESİN JSON):
Şu JSON şemasına tamamen uyan bir obje döndür:
{
  "trends": [
    {
      "id": "1",
      "title": "Kısa ve çarpıcı içerik başlığı (max 50 karakter)",
      "subtitle": "Durum etiketi (Örn: 'En Çok Etkileşim Alan')",
      "description": "Neden bu içeriği paylaşmalı? Mevcut istatistiklerle bağ kurarak açıkla (max 100 karakter).",
      "tag": "Kategori (Örn: 'Biyomekanik' veya 'Rehabilitasyon')",
      "score": 95,
      "strategy": "Kısa ve net eyleme geçirici taktik (Örn: '15 saniyelik Reels çek')"
    }
  ]
}`
        });

        const prompt = `Şu anki gerçek zamanlı verilere dayanarak kliniğim için en iyi 3 stratejik içerik fikrini üret.`;
        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        const jsonStr = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const parsed = JSON.parse(jsonStr);

        // API'den bazen beklenen format gelmeyebilir, doğrula
        if (!parsed.trends || !Array.isArray(parsed.trends)) {
            throw new Error("Geçersiz AI yanıt formatı");
        }

        try {
            if (env.UPSTASH_REDIS_REST_URL) {
                await redis.setex(cacheKey, 7200, parsed); // 2 saatlik cache
            }
        } catch (e) {
            console.warn("[REDIS] Cache write failed for insights:", e);
        }

        return parsed;
    } catch (error) {
        console.error("[GEMINI/DASHBOARD] Insight hatası:", error);
        return fallback;
    }
}

export async function getPersonalizedGreeting(userName: string): Promise<string> {
    const fallback = `Tekrar hoş geldiniz, Dr. ${userName.split(" ")[0]}! Bugün harika içerikler üretmeye hazırız.`;

    const cacheKey = `dashboard:greeting:${userName.replace(/\s+/g, '_')}`;
    try {
        if (env.UPSTASH_REDIS_REST_URL) {
            const cached = await redis.get(cacheKey);
            if (cached) {
                console.log("[REDIS/DASHBOARD] Cache hit for greeting");
                return cached as string;
            }
        }
    } catch (e) {
        console.warn("[REDIS] Cache read failed for greeting:", e);
    }

    const genAI = getGeminiClient();
    if (!genAI) return fallback;

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            safetySettings: SAFETY_SETTINGS,
            systemInstruction: "Sen bir fizyoterapi kliniğinin motivasyonel AI asistanısın. Tek bir cümleyle, enerjik ve profesyonel bir karşılama metni yaz. Türkçe olsun.",
        });

        const result = await model.generateContent(`${userName} için kısa bir karşılama yaz.`);
        const text = result.response.text().trim();

        try {
            if (env.UPSTASH_REDIS_REST_URL) {
                await redis.setex(cacheKey, 43200, text); // Cache for 12 hours
            }
        } catch (e) {
            console.warn("[REDIS] Cache write failed for greeting:", e);
        }

        return text;
    } catch (error) {
        return fallback;
    }
}
