import { GoogleGenerativeAI } from "@google/generative-ai";

// =====================================================
// Fizyososyal — Güncel AI Model Sabitleri (Şubat 2026)
// =====================================================

/** Metin + Strateji: Gemini 2.0 Flash (Hızlı ve Güçlü) */
export const MODEL_TEXT = "gemini-2.0-flash";

/** Görsel Üretim: Imagen 3 (Gemini 2.0 Flash üzerinden multimodal kullanım) */
export const MODEL_IMAGE = "gemini-2.0-flash";

/** Prompt Zenginleştirme: En stabil flash modeli */
export const MODEL_ENRICH = "gemini-2.0-flash";

function getGenAI(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY environment variable");
  }
  return new GoogleGenerativeAI(apiKey);
}

/** Metin modeli döndürür (varsayılan: MODEL_TEXT) */
export const getModel = (modelName: string = MODEL_TEXT) => {
  return getGenAI().getGenerativeModel({ model: modelName });
};

/** Görsel üretimi için — responseModalities: IMAGE destekli */
export const getImageModel = () => {
  return getGenAI().getGenerativeModel({
    model: MODEL_IMAGE,
    generationConfig: {
      // @ts-expect-error — SDK tip tanımı henüz güncellenmedi
      responseModalities: ["IMAGE", "TEXT"],
    },
  });
};
