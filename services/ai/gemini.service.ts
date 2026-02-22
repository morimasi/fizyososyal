import { GoogleGenerativeAI } from "@google/generative-ai";
import type { GenerateTextInput } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const PHYSIO_SYSTEM_PROMPT = `Sen bir fizyoterapi kliniği için uzman dijital içerik yazarısın. 
Tıbbi terimleri hasta dostu, anlaşılır bir dile çevir. 
Her zaman güvenli, kanıta dayalı fizyoterapi bilgisi sun.
Türkçe yaz. Empati kur. Motivasyonel ol. Müşteriyi klinik hizmetlerine çekmeye çalış.`;

export async function generatePostText(input: GenerateTextInput): Promise<{
    content: string;
    hashtags: string;
    title: string;
}> {
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
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

    const prompt = `
${voice}
Konu: "${input.topic}"
Ton: ${tone}
Post tipi: ${input.postType ?? "bilgi"}
${input.trending ? "Bu konu şu an trend. Dikkat çekici bir açılış yap." : ""}

Lütfen aşağıdaki JSON formatında yanıt ver:
{
  "title": "Post başlığı (max 60 karakter)",
  "content": "Instagram post metni (150-300 kelime, emoji kullan, paragraflar halinde)",
  "hashtags": "30 adet Türkçe ve İngilizce hashtag (# ile başlayan, aralarında boşluk)"
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
