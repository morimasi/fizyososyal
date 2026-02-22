import type { TrendItem } from "@/types";

const GOOGLE_SEARCH_API_KEY = process.env.GOOGLE_SEARCH_API_KEY!;
const GOOGLE_SEARCH_ENGINE_ID = process.env.GOOGLE_SEARCH_ENGINE_ID!;

const PHYSIO_KEYWORDS = [
    "fizyoterapi egzersiz",
    "bel ağrısı tedavisi",
    "diz ağrısı rehabilitasyon",
    "boyun ağrısı fizyoterapi",
    "spor yaralanması tedavi",
    "omuz ağrısı egzersiz",
    "tenisçi dirseği tedavi",
    "plantar fasiit egzersiz",
    "skolyoz egzersiz",
    "denge egzersizleri",
];

export async function fetchHealthTrends(): Promise<TrendItem[]> {
    const trends: TrendItem[] = [];

    for (const keyword of PHYSIO_KEYWORDS.slice(0, 3)) {
        try {
            const url = new URL("https://www.googleapis.com/customsearch/v1");
            url.searchParams.set("key", GOOGLE_SEARCH_API_KEY);
            url.searchParams.set("cx", GOOGLE_SEARCH_ENGINE_ID);
            url.searchParams.set("q", keyword);
            url.searchParams.set("num", "5");
            url.searchParams.set("dateRestrict", "d7");

            const response = await fetch(url.toString());
            if (!response.ok) continue;

            const data = await response.json();

            trends.push({
                title: keyword,
                searchVolume: data.searchInformation?.totalResults ?? "Bilinmiyor",
                relatedTerms: data.items?.map((item: { title: string }) => item.title).slice(0, 3) ?? [],
            });
        } catch {
            // Hata olursa bu keyword'ü atla
        }
    }

    // API yoksa örnek trendler döndür
    if (trends.length === 0) {
        return getMockTrends();
    }

    return trends;
}

function getMockTrends(): TrendItem[] {
    return [
        {
            title: "Bel Ağrısı Egzersizleri",
            searchVolume: "45.000+",
            relatedTerms: ["lombalji tedavi", "bel fıtığı", "core güçlendirme"],
        },
        {
            title: "Diz Rehabilitasyonu",
            searchVolume: "28.000+",
            relatedTerms: ["ACL rehabilitasyon", "patella sorunu", "diz artriti egzersiz"],
        },
        {
            title: "Boyun Ağrısı",
            searchVolume: "67.000+",
            relatedTerms: ["servikal disk", "boyun streç", "whiplash"],
        },
    ];
}
