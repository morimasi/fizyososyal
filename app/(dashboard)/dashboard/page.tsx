import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Users, Heart, Share2, Activity, Calendar, Zap } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { UpcomingPosts } from "@/components/dashboard/UpcomingPosts";
import { AITrendAnalysis } from "@/components/dashboard/AITrendAnalysis";
import { getDashboardInsights, getPersonalizedGreeting } from "@/services/ai/gemini.service";

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

        // 1. Prisma'dan gerçek verileri çek (Hata yakalama ile)
        let analyticsSum = { _sum: { likes: 0, comments: 0, reach: 0, saves: 0 } };
        let upcomingPosts: any[] = [];

        try {
            const [aSum, uPosts] = await Promise.all([
                prisma.analytics.aggregate({
                    _sum: { likes: true, comments: true, reach: true, saves: true },
                    where: { post: { userId } }
                }),
                prisma.post.findMany({
                    where: {
                        userId,
                        status: "ONAYLANDI",
                        scheduledDate: { gte: new Date() }
                    },
                    include: { media: { take: 1 } },
                    orderBy: { scheduledDate: "asc" },
                    take: 3
                })
            ]);
            if (aSum) analyticsSum = aSum as any;
            if (uPosts) upcomingPosts = uPosts;
        } catch (dbError) {
            console.error("[DASHBOARD] Veritabanı hatası:", dbError);
        }

        // 2. AI Verilerini çek (Hata yakalama ile)
        let greeting = `Tekrar hoş geldiniz, Dr. ${userName.split(" ")[0]}!`;
        let aiInsights = {
            trends: [
                { id: "1", title: "Bel Sağlığı", subtitle: "#1 Trend", description: "Oturarak çalışma artışıyla bel egzersizleri revaçta.", tag: "Popüler" },
                { id: "2", title: "Boyun Germe", subtitle: "Hızlı Yükselen", description: "Mobil cihaz kullanımı boyun ağrılarını artırıyor.", tag: "Yükselişte" }
            ]
        };

        try {
            const [greet, insights] = await Promise.all([
                getPersonalizedGreeting(userName),
                getDashboardInsights({
                    totalReach: analyticsSum._sum.reach || 0,
                    totalInteractions: (analyticsSum._sum.likes || 0) + (analyticsSum._sum.comments || 0)
                })
            ]);
            if (greet) greeting = greet;
            if (insights) aiInsights = insights;
        } catch (aiError) {
            console.error("[DASHBOARD] AI Servis hatası:", aiError);
        }

        // İstatistik objelerini hazırla
        const stats = [
            {
                title: "Toplam Erişim",
                value: analyticsSum._sum.reach || 0,
                trend: 12,
                icon: Activity,
                color: "blue" as const
            },
            {
                title: "Etkileşim (Interactions)",
                value: (analyticsSum._sum.likes || 0) + (analyticsSum._sum.comments || 0),
                trend: 8,
                icon: Heart,
                color: "rose" as const
            },
            {
                title: "Kaydedilme",
                value: analyticsSum._sum.saves || 0,
                trend: 15,
                icon: Share2,
                color: "violet" as const
            },
            {
                title: "Aktif Postlar",
                value: upcomingPosts.length,
                trend: 5,
                icon: Users,
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Gelecek Postlar (Real-time) */}
                    <UpcomingPosts
                        posts={upcomingPosts.map(p => ({
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
                            <h3 className="text-xl font-bold text-white mb-2">Haftalık Stratejiniz Hazır!</h3>
                            <p className="text-slate-400 text-sm max-w-lg">
                                Verileriniz analiz edildi. Bu hafta "Fizyoterapi ve Yaşam" odaklı içerikler üretmek kliniğinizin görünürlüğünü %15 artırabilir.
                            </p>
                        </div>
                        <button onClick={() => { }} className="px-6 py-3 rounded-xl bg-violet-600 text-white font-bold text-[13px] shadow-lg shadow-violet-600/20 hover:scale-105 transition-transform active:scale-95 uppercase tracking-widest">
                            Raporu Gör
                        </button>
                    </div>
                </div>
            </div>
        );
    } catch (fatalError) {
        console.error("[DASHBOARD] Fatal Render Error:", fatalError);
        return (
            <div className="p-12 text-center bg-slate-900/40 rounded-[32px] border border-white/5 backdrop-blur-xl">
                <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-rose-500/20">
                    <Activity className="text-rose-400 w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">Bir Sorun Oluştu</h2>
                <p className="text-slate-400 max-w-sm mx-auto mb-8">
                    Dashboard yüklenirken teknik bir aksaklık yaşandı. Lütfen sayfayı yenilemeyi deneyin.
                </p>
                <button onClick={() => typeof window !== 'undefined' && window.location.reload()} className="px-8 py-3 rounded-xl bg-white text-black font-bold text-sm">
                    Sayfayı Yenile
                </button>
            </div>
        );
    }
}
