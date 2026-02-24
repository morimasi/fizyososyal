import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Users, Heart, Share2, Activity, Calendar, Zap } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { UpcomingPosts } from "@/components/dashboard/UpcomingPosts";
import { AITrendAnalysis } from "@/components/dashboard/AITrendAnalysis";
import { getDashboardInsights, getPersonalizedGreeting } from "@/services/ai/gemini.service";
import { Suspense } from "react";

export default async function DashboardPage() {
    const session = await auth();
    const userId = session?.user?.id;
    const userName = session?.user?.name || "Fizyoterapist";

    if (!userId) {
        return <div>Lütfen giriş yapın.</div>;
    }

    // 1. Prisma'dan gerçek verileri çek
    const [analyticsSum, upcomingPosts] = await Promise.all([
        prisma.analytics.aggregate({
            _sum: {
                likes: true,
                comments: true,
                reach: true,
                saves: true
            },
            where: {
                post: { userId }
            }
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

    // 2. AI Verilerini çek
    const [greeting, aiInsights] = await Promise.all([
        getPersonalizedGreeting(userName),
        getDashboardInsights({
            totalReach: analyticsSum._sum.reach || 0,
            totalInteractions: (analyticsSum._sum.likes || 0) + (analyticsSum._sum.comments || 0)
        })
    ]);

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
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* AI Akıllı Başlık */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-8 bg-violet-600 rounded-full animate-pulse" />
                    <h1 className="text-4xl font-black bg-gradient-to-r from-white via-slate-200 to-slate-500 bg-clip-text text-transparent">
                        Genel Bakış
                    </h1>
                </div>
                <p className="text-lg text-slate-400 font-medium">
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
                        platform: "Instagram" // Prisma'ya platform eklenince güncellenir
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
                            İstatistikleriniz %12'lik bir artış ivmesinde. Bu hafta özellikle hastaların ev ödevleri hakkında video içerik paylaşmanız, etkileşimi %20 daha artırabilir.
                        </p>
                    </div>
                    <button className="px-6 py-3 rounded-xl bg-violet-600 text-white font-bold text-sm shadow-lg shadow-violet-600/20 hover:scale-105 transition-transform active:scale-95">
                        Tam Raporu İndir
                    </button>
                </div>
            </div>
        </div>
    );
}
