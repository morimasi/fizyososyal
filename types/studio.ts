export type PostFormat = "post" | "carousel" | "video" | "ad";
export type Platform = "instagram" | "linkedin" | "tiktok";
export type UserRole = "ADMIN" | "EDITOR" | "APPROVER";
export type AIModel = "gemini-3.1-flash-preview" | "gemini-1.5-pro";

export interface FormatSettings {
    slideCount?: number;
    videoStyle?: "informational" | "pov" | "tutorial" | "storytelling";
    visualStyle?: "minimal" | "clinical" | "energetic" | "premium" | "educational";
    targetAudience?: "athletes" | "elderly" | "office-workers" | "recovery" | "general";
}

export interface GeneratedPost {
    title: string;
    content: string;
    hashtags: string;
    mediaUrl?: string;
    postFormat: PostFormat;
    platform: Platform;
    settings?: FormatSettings;
}
