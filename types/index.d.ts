export interface PostType {
    id: string;
    userId: string;
    title?: string;
    content?: string;
    hashtags?: string;
    trendTopic?: string;
    scheduledDate?: Date;
    status: "TASLAK" | "ONAYLANDI" | "YAYINLANDI" | "HATA";
    createdAt: Date;
    updatedAt: Date;
    media?: MediaItemType[];
    analytics?: AnalyticsType;
    user?: UserType;
}

export interface MediaItemType {
    id: string;
    postId: string;
    mediaUrl: string;
    mediaType: "RESIM" | "VIDEO" | "SES" | "BELGE";
    aspectRatio: "1:1" | "4:5" | "9:16";
    createdAt: Date;
}

export interface UserType {
    id: string;
    name?: string;
    email: string;
    image?: string;
    instagramAccountId?: string;
    accessToken?: string;
    subscriptionType: string;
    clinicName?: string;
    brandVoice?: string;
    logoUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface AnalyticsType {
    id: string;
    postId: string;
    likes: number;
    comments: number;
    reach: number;
    saves: number;
    lastUpdated: Date;
}

export interface GenerateTextInput {
    topic: string;
    brandVoice?: string;
    brandKeywords?: string[];
    trending?: boolean;
    tone?: "profesyonel" | "samimi" | "eğitici" | "motive edici";
    postType?: "bilgi" | "egzersiz" | "motivasyon" | "hizmet";
    postFormat?: "post" | "carousel" | "video" | "ad";
    evidenceBased?: boolean;
    model?: "gemini-3.1-flash-preview" | "gemini-1.5-pro";
}

export interface GenerateMediaInput {
    prompt: string;
    aspectRatio: "1:1" | "4:5" | "9:16";
    style?: string;
}

export interface TrendItem {
    title: string;
    searchVolume?: string;
    relatedTerms?: string[];
}

export interface SmartScheduleResult {
    suggestedTime: Date;
    reason: string;
    engagementScore: number;
}
