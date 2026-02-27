import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
    return new Intl.DateTimeFormat("tr-TR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(date));
}

export function truncateText(text: string, maxLength: number = 100): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
}

export function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export function extractHashtags(text: string): string[] {
    const matches = text.match(/#\w+/g);
    return matches || [];
}

export function formatNumber(num: number): string {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
    return num.toString();
}

/**
 * AI tarafından üretilen teknik multimodal blokları temizleyen ve metni 
 * önizleme için uygun hale getiren klinik filtre.
 */
export function cleanClinicContent(text: string): string {
    if (!text) return "";

    // 1. [GÖRSEL ANALİZ] bloklarını tamamen kaldır (İçsel notlar)
    let cleaned = text.replace(/\[GÖRSEL ANALİZ\]:?[\s\S]*?(?=\[METİN\]|Sayfa \d+|$)/gi, "");

    // 2. [METİN]: etiketlerini kaldır ama içeriği koru
    cleaned = cleaned.replace(/\[METİN\]:?\s*/gi, "");

    // 3. [DİNAMİK]: etiketlerini interaktif sembollerle değiştir veya temizle
    cleaned = cleaned.replace(/\[DİNAMİK\]:?\s*/gi, "✨ ");

    // 4. Gereksiz boşlukları temizle
    return cleaned.trim();
}
