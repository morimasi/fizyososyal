import { create } from "zustand";

export type ContentType = "post" | "carousel" | "reels" | "ad";
export type ContentTone = "professional" | "friendly" | "scientific" | "motivational";

interface AIContent {
  title: string;
  hook: string;
  caption: string;
  hashtags: string[];
  imageDescription: string;
  carouselSlides?: Array<{ slide: number; text: string; visual: string }>;
  reelsScript?: any;
  suggestedMusic?: string;
  callToAction: string;
}

interface StudioState {
  // Input State
  prompt: string;
  contentType: ContentType;
  tone: ContentTone;
  language: string;
  
  // App State
  isGenerating: boolean;
  aiContent: AIContent | null;
  history: AIContent[];

  // Actions
  setPrompt: (prompt: string) => void;
  setContentType: (type: ContentType) => void;
  setTone: (tone: ContentTone) => void;
  setLanguage: (lang: string) => void;
  setAIContent: (content: AIContent | null) => void;
  setIsGenerating: (status: boolean) => void;
  addToHistory: (content: AIContent) => void;
  clearContent: () => void;
}

export const useStudioStore = create<StudioState>((set) => ({
  prompt: "",
  contentType: "post",
  tone: "professional",
  language: "tr",
  isGenerating: false,
  aiContent: null,
  history: [],

  setPrompt: (prompt) => set({ prompt }),
  setContentType: (contentType) => set({ contentType }),
  setTone: (tone) => set({ tone }),
  setLanguage: (language) => set({ language }),
  setAIContent: (aiContent) => set({ aiContent }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  addToHistory: (content) => set((state) => ({ history: [content, ...state.history].slice(0, 10) })),
  clearContent: () => set({ aiContent: null }),
}));
