export interface InstagramMediaContainer {
    id: string;
    status?: "EXPIRED" | "ERROR" | "FINISHED" | "IN_PROGRESS" | "PUBLISHED";
}

export interface InstagramPublishResult {
    id: string;
}

export interface InstagramTokenResponse {
    access_token: string;
    token_type: string;
    expires_in?: number;
}

export interface InstagramLongLivedTokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
}

export interface InstagramAccountInfo {
    id: string;
    username: string;
    name: string;
    biography?: string;
    followers_count: number;
    media_count: number;
    profile_picture_url?: string;
}

export interface InstagramMediaItem {
    id: string;
    caption?: string;
    media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
    media_url?: string;
    permalink?: string;
    thumbnail_url?: string;
    timestamp: string;
    like_count?: number;
    comments_count?: number;
    reach?: number;
    saved?: number;
}

export interface InstagramInsightsResponse {
    data: Array<{
        name: string;
        period: string;
        values: Array<{ value: number; end_time: string }>;
        title: string;
        description: string;
        id: string;
    }>;
}
