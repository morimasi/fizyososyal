export type PostFormat = "post" | "carousel" | "video" | "ad";
export type Platform = "instagram" | "linkedin" | "tiktok";
export type UserRole = "ADMIN" | "EDITOR" | "APPROVER";
export type AIModel = "gemini-3.1-pro-preview" | "gemini-2.0-flash" | "gemini-1.5-pro-latest";

export interface FormatSettings {
    slideCount?: number;
    videoStyle?: "informational" | "pov" | "tutorial" | "storytelling";
    visualStyle?: "minimal" | "clinical" | "energetic" | "premium" | "educational";
    targetAudience?: "athletes" | "elderly" | "office-workers" | "recovery" | "general";
}

export interface GeneratedSlide {
    text: string;
    mediaUrl?: string;
    visualPrompt?: string;
}

export interface GeneratedPost {
    title: string;
    content: string;
    hashtags: string;
    mediaUrl?: string;
    mediaUrls?: string[]; // Çoklu görseller (Carousel vb.) için
    slides?: GeneratedSlide[]; // Yapısal slayt içeriği
    postFormat: PostFormat;
    platform: Platform;
    settings?: FormatSettings;
}
