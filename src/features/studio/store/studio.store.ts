import { create } from "zustand";

interface AIContent {
  title: string;
  caption: string;
  hashtags: string[];
  imageDescription: string;
  suggestedMusic?: string;
}

interface StudioState {
  aiContent: AIContent | null;
  setAIContent: (content: AIContent | null) => void;
  clearContent: () => void;
}

export const useStudioStore = create<StudioState>((set) => ({
  aiContent: null,
  setAIContent: (content) => set({ aiContent: content }),
  clearContent: () => set({ aiContent: null }),
}));
