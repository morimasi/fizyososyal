import { GoogleGenerativeAI } from "@google/generative-ai";

// =====================================================
// Fizyososyal — Güncel AI Model Sabitleri (Şubat 2026)
// =====================================================

/** Metin + Strateji: Gemini 3.1 Pro Preview */
export const MODEL_TEXT = "gemini-3.1-pro-preview";

/** Görsel Üretim: Gemini 3.1 Flash Image (Nano Banana 2) */
export const MODEL_IMAGE = "gemini-3.1-flash-image-preview";

/** Prompt Zenginleştirme: Geriye dönük uyumlu ve en stabil model (v0.24 sdk fix) */
export const MODEL_ENRICH = "gemini-2.0-flash-exp";

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
