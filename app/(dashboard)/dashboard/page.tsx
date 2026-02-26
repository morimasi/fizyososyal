import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Users, Heart, Share2, Activity, Calendar, Zap } from "lucide-react";
import { auth } from "@/auth";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { UpcomingPosts } from "@/components/dashboard/UpcomingPosts";
import { AITrendAnalysis } from "@/components/dashboard/AITrendAnalysis";
import { ApprovalPanel } from "@/components/dashboard/ApprovalPanel";
import { getDashboardInsights, getPersonalizedGreeting, getWeeklyStrategy } from "@/services/ai/gemini.service";
import { getDashboardAnalyticsSum, getUpcomingPosts, getTeamBrandData } from "@/services/db/dashboard.service";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
    try {
        const session = await auth();
        const userId = session?.user?.id;
        const userName = session?.user?.name || "Fizyoterapist";

        if (!userId) {
            return (
                <div className="p-8 text-center bg-slate-900/50 rounded-3xl border border-white/5">
                    <h2 className="text-xl font-bold text-white mb-2">Oturum Gerekli</h2>
                    <p className="text-slate-400">Lütfen devam etmek için giriş yapın.</p>
                </div>
            );
        }

        // 1. Prisma'dan gerçek verileri çek (Service Pattern üzerinden)
        const [analyticsSum, upcomingPosts, brandData] = await Promise.all([
            getDashboardAnalyticsSum(userId),
            getUpcomingPosts(userId, 3),
            getTeamBrandData(userId)
        ]);

        // 2. AI Verilerini çek (Hata yakalama ile)
        let greeting = `Tekrar hoş geldiniz, Dr. ${userName.split(" ")[0]}!`;
        let aiInsights = {
            trends: [
                { id: "1", title: "Bel Sağlığı", subtitle: "#1 Trend", description: "Oturarak çalışma artışıyla bel egzersizleri revaçta.", tag: "Popüler" },
                { id: "2", title: "Boyun Germe", subtitle: "Hızlı Yükselen", description: "Mobil cihaz kullanımı boyun ağrılarını artırıyor.", tag: "Yükselişte" }
            ]
        };
        let weeklyStrategy = {
            title: "Haftalık Stratejiniz Hazır!",
            description: "Verileriniz analiz edildi. Bu hafta 'Fizyoterapi ve Yaşam' odaklı içerikler üretmek kliniğinizin görünürlüğünü %15 artırabilir."
        };

        try {
            const [greet, insights, strategy] = await Promise.all([
                getPersonalizedGreeting(userName),
                getDashboardInsights({
                    totalReach: analyticsSum.reach,
                    totalInteractions: analyticsSum.totalInteractions
                }, brandData),
                getWeeklyStrategy(analyticsSum, brandData)
            ]);
            if (greet) greeting = greet;
            if (insights) aiInsights = insights;
            if (strategy) weeklyStrategy = strategy;
        } catch (aiError) {
            console.error("[DASHBOARD] AI Servis hatası:", aiError);
        }

        // İstatistik objelerini hazırla
        const stats: any[] = [
            {
                title: "Toplam Erişim",
                value: analyticsSum.reach,
                trend: 12,
                icon: "activity",
                color: "blue" as const
            },
            {
                title: "Etkileşim (Interactions)",
                value: analyticsSum.totalInteractions,
                trend: 8,
                icon: "heart",
                color: "rose" as const
            },
            {
                title: "Kaydedilme",
                value: analyticsSum.saves,
                trend: 15,
                icon: "share",
                color: "violet" as const
            },
            {
                title: "Aktif Postlar",
                value: upcomingPosts.length,
                trend: 5,
                icon: "users",
                color: "teal" as const
            },
        ];

        return (
            <div className="space-y-10 animate-fade-in-up">
                {/* AI Akıllı Başlık */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-8 bg-violet-600 rounded-full animate-pulse" />
                        <h1 className="text-4xl font-black bg-gradient-to-r from-white via-slate-200 to-slate-500 bg-clip-text text-transparent tracking-tighter">
                            Genel Bakış
                        </h1>
                    </div>
                    <p className="text-lg text-slate-400 font-medium leading-relaxed">
                        {greeting}
                    </p>
                </div>

                {/* İstatistikler (Real-time) */}
                <DashboardStats stats={stats} />

                {/* Onay Bekleyen İçerikler (APPROVER/ADMIN için) */}
                <ApprovalPanel />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Gelecek Postlar (Real-time) */}
                    <UpcomingPosts
                        posts={upcomingPosts.map((p: any) => ({
                            id: p.id,
                            title: p.title || "Adsız",
                            scheduledDate: p.scheduledDate!,
                            status: p.status,
                            platform: "Instagram"
                        }))}
                    />

                    {/* AI Trend Önerileri (Deep AI) */}
                    <AITrendAnalysis trends={aiInsights.trends} />
                </div>

                {/* Premium Alt Panel */}
                <div className="p-8 rounded-3xl bg-gradient-to-r from-violet-600/10 to-transparent border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/5 blur-[100px] -z-10 group-hover:bg-violet-600/10 transition-all duration-700" />
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">{weeklyStrategy.title}</h3>
                            <p className="text-slate-400 text-sm max-w-lg">
                                {weeklyStrategy.description}
                            </p>
                        </div>
                        <button className="px-6 py-3 rounded-xl bg-violet-600 text-white font-bold text-[13px] shadow-lg shadow-violet-600/20 hover:scale-105 transition-transform active:scale-95 uppercase tracking-widest">
                            Raporu Gör
                        </button>
                    </div>
                </div>
            </div>
        );
    } catch (fatalError: any) {
        console.error("[DASHBOARD] Fatal Render Error Detail:", {
            message: fatalError.message,
            stack: fatalError.stack,
            digest: fatalError.digest
        });
        return (
            <div className="p-12 text-center bg-slate-900/40 rounded-[32px] border border-white/5 backdrop-blur-xl font-sans">
                <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-rose-500/20">
                    <Activity className="text-rose-400 w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">⚠️ Teknik Bir Aksaklık</h2>
                <p className="text-slate-400 max-w-sm mx-auto mb-8">
                    Dashboard yüklenirken teknik bir aksaklık yaşandı. Lütfen sayfayı yenilemeyi deneyin.
                </p>
                <div className="text-[10px] text-slate-600 mb-6 font-mono opacity-50 overflow-hidden text-ellipsis">
                    Hata Kodu: {fatalError.digest || "INTERNAL_RENDER_ERROR"}
                </div>
                <a
                    href="/dashboard"
                    className="inline-block px-8 py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-slate-200 transition-colors"
                >
                    Tekrar Dene
                </a>
            </div>
        );
    }
}
