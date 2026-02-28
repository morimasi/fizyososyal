import { create } from "zustand";

export type ContentType = "post" | "carousel" | "reels" | "ad";
export type ContentTone = "professional" | "friendly" | "scientific" | "motivational";
export type TargetAudience = "general" | "athletes" | "elderly" | "office_workers" | "women_health";
export type PostLength = "short" | "medium" | "long";
export type CallToActionType = "appointment" | "comment" | "save" | "share" | "dm";

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
  generatedImageUrl?: string;
  // New Enhanced Fields
  mainHeadline?: string;
  subHeadline?: string;
  slogan?: string;
  vignette?: string;
  highlights?: string[];
  designHints?: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    layoutType: "minimal" | "bold" | "scientific" | "modern";
  };
}

interface StudioState {
  // Input State
  prompt: string;
  contentType: ContentType;
  tone: ContentTone;
  language: string;
  
  // Advanced Settings
  targetAudience: TargetAudience;
  postLength: PostLength;
  callToActionType: CallToActionType;
  useEmojis: boolean;
  
  // App State
  isGenerating: boolean;
  aiContent: AIContent | null;
  history: AIContent[];

  // Actions
  setPrompt: (prompt: string) => void;
  setContentType: (type: ContentType) => void;
  setTone: (tone: ContentTone) => void;
  setLanguage: (lang: string) => void;
  
  setTargetAudience: (audience: TargetAudience) => void;
  setPostLength: (length: PostLength) => void;
  setCallToActionType: (cta: CallToActionType) => void;
  setUseEmojis: (use: boolean) => void;

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
  
  targetAudience: "general",
  postLength: "medium",
  callToActionType: "appointment",
  useEmojis: true,
  
  isGenerating: false,
  aiContent: null,
  history: [],

  setPrompt: (prompt) => set({ prompt }),
  setContentType: (contentType) => set({ contentType }),
  setTone: (tone) => set({ tone }),
  setLanguage: (language) => set({ language }),
  
  setTargetAudience: (targetAudience) => set({ targetAudience }),
  setPostLength: (postLength) => set({ postLength }),
  setCallToActionType: (callToActionType) => set({ callToActionType }),
  setUseEmojis: (useEmojis) => set({ useEmojis }),
  
  setAIContent: (aiContent) => set({ aiContent }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  addToHistory: (content) => set((state) => ({ history: [content, ...state.history].slice(0, 10) })),
  clearContent: () => set({ aiContent: null }),
}));
