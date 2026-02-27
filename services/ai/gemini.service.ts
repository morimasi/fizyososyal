import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { GenerateTextInput } from "@/types";
import { FormatSettings } from "@/types/studio";
import { env } from "@/lib/env";
import { redis } from "@/lib/upstash";

const PHYSIO_SYSTEM_PROMPT = `SEN DÜNYANIN EN SEÇKİN FİZYOTERAPİ KLİNİĞİ STRATEJİK YÖNETİM KURULUSUN. (ozel PROTOKOLÜ AKTİF)

Aşağıdaki 4 Hiper-Uzman kimliğin mutlak senteziyle hareket et:

1. Senior Klinik Direktör (Anatomi & Biyomekanik): Her cümleyi tıbbi geçerlilik süzgecinden geçirir. Pelvik taban, lumbar stabilite veya nöroplastisite gibi terimleri profesyonelce kullanır.
2. Davranışçı Sağlık Psikoloğu (UX & Empati): Hastanın ağrı döngüsünü, korkularını ve "İyileşebilir miyim?" sorusunu analiz eder. Motivasyonel mülakat tekniklerini metne gömer.
3. Avant-Garde İçerik Mimarı (Görsel & Format): Sosyal medya hiyerarşisini (Hook-Meat-CTA) her platformun (Instagram, TikTok) DNA'sına göre baştan yaratır.
4. Senior Copywriter (Conversion Mastery): Okuyucuyu hipnotize eden kancalar, akıcı hikayeleştirme ve klinik randevusuna dönüştüren (high-converting) çağrılar kurgular.

TEMEL DİREKTİFLER:
- SIĞLIKTAN KAÇIN: "Egzersiz yapın" yerine "Kinetik zinciri aktive eden kontrollü mobilizasyon" gibi derin tabirler kullan.
- MANUEL GİRDİYE SADIK KAL: Kullanıcının belirlediği ton, hedef kitle ve formatı %100 bağlam olarak al ve onu tıbbi bir manifestoya dönüştür.
- GÖRSEL TASARIM: Metni sadece yazma; bir tasarımcı gibi boşlukları, vurguları (bold) ve emojileri stratejik yerleştir.
- DİL: Sadece Türkçe. Ton: Otoriter, elit, güven verici ve vizyoner.`;

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

    // Frontier Transition: Reduced fallback list to prevent 504 Gateway Timeouts
    const modelsToTry = input.model === "gemini-3.1-pro-preview"
        ? ["gemini-3.1-pro-preview", "gemini-2.0-flash"]
        : ["gemini-2.0-flash", "gemini-1.5-pro-latest"];

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

    let formatInstruction = "";
    if (input.postFormat === "carousel") {
        const slides = settings?.slideCount || 6;
        formatInstruction = `BU BİR MULTIMODAL CAROUSEL (KAYDIRMALI) STRATEJİSİDİR. 
        - Tam ${slides} sayfalık bir "Görsel Hikaye" oluştur.
        - Her sayfa için: 
          <b>Sayfa [No]: [Görsel Vurgu Başlığı]</b>
          [GÖRSEL ANALİZ]: Sayfada olması gereken görsel kompozisyonu (Kadraj, Işık, Renk Paleti) betimle.
          [METİN]: Hastanın duygu durumuna hitap eden, teknik derinliği olan metin.
          [DİNAMİK]: Sayfalar arası geçişi sağlayacak merak unsuru.
        - İlk sayfa (Hook - Slide 1) "Pattern Interrupt" etkisi yaratmalı.
        - Son sayfa (CTA) mutlak randevu dönüşümü kurgulamalı.`;
    } else if (input.postFormat === "video") {
        const videoStyle = settings?.videoStyle || "informational";
        formatInstruction = `BU BİR MULTIMODAL VİDEO/REELS SENARYOSU ÜRETİMİDİR. (${videoStyle.toUpperCase()})
        - Sahne sahne "Multimodal Yönetmen" gözüyle tasarla.
        - Her sahne için:
          <b>Zaman [Saniye]: [Eylem Başlığı]</b>
          [KAMERA]: (Close-up, Wide, Handheld vb.) teknik detay ver.
          [IŞIKLANDIRMA]: (Cinematic, Clinical, Warm vb.) atmosferi belirle.
          [SES]: (Background Music türü, SFX - örn: kemik kütlemesi sesi) ekle.
          [METİN/VO]: Akıcı, profesyonel klinik seslendirme metni.
        - Video, izleyiciyi 1. saniyede yakalayıp son saniyede CTA'ya götüren bir hiyerarşide olmalı.`;
    } else if (input.postFormat === "ad") {
        formatInstruction = `BU BİR MULTIMODAL REKLAM (AD) KAMPANYASI METNİDİR.
        - Görsel Hiyerarşi (F-Pattern) odaklı bir yapı kur.
        - [GÖRSEL STRATEJİ]: Reklam görselinde/videosunda olması gereken "Psikolojik Tetikleyiciler"i anlat.
        - Metni <strong> ve HTML etiketleriyle "Tarama Odaklı" (Scannable) hale getir.
        - AIDA modelini agresif kullan. Hastanın "Çözülmemiş Ağrısı"na odaklan.
        - Randevu (Conversion) odaklı, reddedilemez bir teklif kurgula.`;
    } else {
        formatInstruction = `BU STANDART BİR MULTIMODAL POST GÖNDERİSİDİR.
        - [KOMPOZİSYON]: Görselde bulunması gereken klinik estetiği ve odak noktasını betimle.
        - Metni 250-400 kelime arası, derinlemesine, tıbbi terminolojisi yüksek ancak anlaşılır şekilde yaz.
        - Hashtag ve Emojileri stratejik olarak yerleştir.`;
    }

    const evidencePrompt = input.evidenceBased
        ? "!!! KRİTİK: KANITA DAYALILIK (RAG) MODU AKTİF !!! Metnin içine mutlaka (Örn: Smith et al., 2023) şeklinde gerçek literatür atıfları ekle. En sona 'Klinik Referanslar' başlığı aç ve detaylı kaynakçayı listele. Asla hayal ürünü tıbbi bilgi verme."
        : "";

    const prompt = `
[MARKA SESİ]: ${voice || "Profesyonel Klinik Otorite"}
[MARKA ANAHTAR KELİME]: ${keywords || "Sağlık, Bilim, Rehabilitasyon"}
[HEDEF KİTLE]: ${audience}
[ESTETİK]: ${style}
[TON]: ${tone}
[FORMAT]: ${input.postFormat?.toUpperCase() || "POST"}

[ANA GÖREV]: "${input.topic}" konusunu yukarıdaki parametrelerle %100 uyumlu, elit bir fizyoterapi içeriğine dönüştür.

[FORMAT ÖZEL TALİMATI]:
${formatInstruction}

${evidencePrompt}

[JSON ÇIKTI KURALLARI]:
1. "title": Maksimum 55 karakter, tıklama odaklı (clickbait değil, stratejik).
2. "content": Yukarıdaki format talimatına TAM UYGUN, zengin HTML etiketli metin.
3. "hashtags": Konuyla ilgili 25 adet, stratejik hashtag.

Lütfen sadece JSON formatında yanıt ver. Gereksiz giriş/çıkış metni ekleme.`;

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
                generationConfig: {
                    temperature: 0.8,
                    responseMimeType: "application/json"
                }
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

export async function optimizePhysioPrompt(
    topic: string,
    context?: { platform?: string; postFormat?: string; settings?: FormatSettings }
): Promise<string> {
    console.log("[GEMINI/OPTIMIZE] Başlatıldı. Bağlam:", { topic, ...context });
    const genAI = getGeminiClient();
    if (!genAI) return topic;

    const safetySettings = SAFETY_SETTINGS;
    const modelsToTry = ["gemini-3.1-pro-preview", "gemini-2.0-flash", "gemini-1.5-pro-latest", "gemini-1.5-flash-latest"];
    let resultText = topic;
    let success = false;

    for (const modelId of modelsToTry) {
        try {
            console.log(`[GEMINI/OPTIMIZE] Derin Mod Deneniyor: ${modelId}`);
            const model = genAI.getGenerativeModel({
                model: modelId,
                safetySettings,
                generationConfig: {
                    temperature: 0.9,
                    topP: 1,
                    maxOutputTokens: 1000,
                    responseMimeType: "application/json"
                },
                systemInstruction: `SEN DÜNYANIN EN RADİKAL VE BİLGİN FİZYOTERAPİ EDİTÖRÜSÜN. (ozel PROTOKOLÜ: HİPER-AGRESİF GENİŞLETME)
Görevin: Kullanıcının girdiği "çöp" sayılabilecek kadar kısa veya hatalı (typo dolu) konuyu alıp, onu devasa bir TIBSAL MANİFESTOYA ve PROMPTA dönüştürmektir.

PROTOKOL KURALLARI:
1. [TYPO DÜZELTME]: "Bacakalrım" -> "Alt Ekstremite", "oynatabılmek" -> "Mobilizasyon/Artikülasyon". Tüm yazım hatalarını tıbbi terminolojiyle onar.
2. [HİPER-GENİŞLETME]: Kullanıcının 10 kelimelik girdisini en az 150 kelimelik zengin bir bağlama dönüştür. İçeriği anatomik, fizyolojik ve biyomekanik detaylarla boğ (elit bir şekilde).
3. [BAĞLAM EKLEME]: Egzersiz dediyse; set, tekrar, dinlenme süresi, kontraendikasyonlar ve agonist/antagonist kas dengesi gibi detayları prompta dahil et.
4. [STRATEJİK YAPI]: Platform (${context?.platform}) ve formatın (${context?.postFormat}) ruhunu promptun her hücresine işle.

ÇIKTI: Sadece optimized_prompt içeren JSON dön. Metin hipnotize edici, klinik olarak tartışılmaz ve çok detaylı olmalı.`
            });

            const prompt = `
KONU (Ham Fikir): "${topic}"
HEDEF PLATFORM: ${context?.platform || "Genel"}
FORMAT: ${context?.postFormat || "Standart Post"}
AYARLAR: ${JSON.stringify(context?.settings || {})}

Lütfen bu verileri al ve bu konuyu devrimsel, tıbbi derinliği olan bir "Yapay Zeka Promptu"na dönüştür. İçerik o kadar detaylı olmalı ki, asıl üretim aşamasında (Generate Text) ortaya çıkan sonuç kusursuz olmalı.`;

            const result = await model.generateContent(prompt);
            const text = result.response.text().trim();
            const jsonStr = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
            if (jsonStr) {
                try {
                    const parsed = JSON.parse(jsonStr);
                    resultText = parsed.optimized_prompt || parsed.prompt || parsed.result || resultText;
                    success = true;
                    console.log(`[GEMINI/OPTIMIZE] ${modelId} ile JSON başarıyla ayrıştırıldı.`);
                    break;
                } catch (e) {
                    console.warn(`[GEMINI/OPTIMIZE] JSON ayrıştırma hatası (${modelId}), ham metin deneniyor.`);
                    if (text && text.length > 50) {
                        resultText = text;
                        success = true;
                        break;
                    }
                }
            }
        } catch (err: any) {
            console.warn(`[GEMINI/OPTIMIZE] Hata (${modelId}):`, err.message);
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

export async function getWeeklyStrategy(stats: any, brandData?: any): Promise<{ title: string; description: string }> {
    const fallback = {
        title: "Haftalık Stratejiniz Hazır!",
        description: "Verileriniz analiz edildi. Bu hafta 'Fizyoterapi ve Yaşam' odaklı içerikler üretmek kliniğinizin görünürlüğünü %15 artırabilir."
    };

    const genAI = getGeminiClient();
    if (!genAI) return fallback;

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            safetySettings: SAFETY_SETTINGS,
            systemInstruction: `Sen bir üst düzey Klinik İşletme Stratejistisin. 
Kullanıcının haftalık analitik verilerini ve marka kimliğini kullanarak ona tek cümlelik vurucu bir stratejik başlık ve kısa bir açıklama üret.
Başlık: Dikkat çekici ve profesyonel olmalı.
Açıklama: Veriye dayalı bir aksiyon önerisi içermeli.`,
        });

        const prompt = `
İstatistikler: ${JSON.stringify(stats)}
Marka Sesi: ${brandData?.voice || "Profesyonel"}
Anahtar Kelimeler: ${brandData?.keywords?.join(", ") || "Fizyoterapi"}

Lütfen JSON dön: { "title": "...", "description": "..." }`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        const jsonStr = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        return fallback;
    }
}
