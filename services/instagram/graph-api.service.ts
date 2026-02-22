import type {
    InstagramMediaContainer,
    InstagramPublishResult,
    InstagramAccountInfo,
    InstagramMediaItem,
    InstagramLongLivedTokenResponse,
} from "@/types/instagram";

const GRAPH_API_BASE = "https://graph.facebook.com/v20.0";

export async function getAccountInfo(accountId: string, accessToken: string): Promise<InstagramAccountInfo> {
    const url = `${GRAPH_API_BASE}/${accountId}?fields=id,username,name,biography,followers_count,media_count,profile_picture_url&access_token=${accessToken}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Meta API hatası: ${res.statusText}`);
    return res.json();
}

export async function createImageContainer(
    accountId: string,
    accessToken: string,
    imageUrl: string,
    caption: string
): Promise<InstagramMediaContainer> {
    const url = `${GRAPH_API_BASE}/${accountId}/media`;
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            image_url: imageUrl,
            caption,
            access_token: accessToken,
        }),
    });
    if (!res.ok) throw new Error(`Konteyner oluşturma hatası: ${res.statusText}`);
    return res.json();
}

export async function createCarouselContainer(
    accountId: string,
    accessToken: string,
    children: string[],
    caption: string
): Promise<InstagramMediaContainer> {
    const url = `${GRAPH_API_BASE}/${accountId}/media`;
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            media_type: "CAROUSEL",
            children: children.join(","),
            caption,
            access_token: accessToken,
        }),
    });
    if (!res.ok) throw new Error(`Carousel konteyner hatası: ${res.statusText}`);
    return res.json();
}

export async function publishContainer(
    accountId: string,
    accessToken: string,
    containerId: string
): Promise<InstagramPublishResult> {
    const url = `${GRAPH_API_BASE}/${accountId}/media_publish`;
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            creation_id: containerId,
            access_token: accessToken,
        }),
    });
    if (!res.ok) throw new Error(`Yayınlama hatası: ${res.statusText}`);
    return res.json();
}

export async function exchangeForLongLivedToken(
    shortToken: string
): Promise<InstagramLongLivedTokenResponse> {
    const url = `${GRAPH_API_BASE}/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.META_APP_ID}&client_secret=${process.env.META_APP_SECRET}&fb_exchange_token=${shortToken}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Token değişim hatası: ${res.statusText}`);
    return res.json();
}

export async function getRecentMedia(
    accountId: string,
    accessToken: string,
    limit: number = 10
): Promise<InstagramMediaItem[]> {
    const url = `${GRAPH_API_BASE}/${accountId}/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,like_count,comments_count&limit=${limit}&access_token=${accessToken}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Medya çekme hatası: ${res.statusText}`);
    const data = await res.json();
    return data.data ?? [];
}
