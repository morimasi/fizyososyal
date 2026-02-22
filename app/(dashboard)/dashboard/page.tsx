import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Users, Heart, Share2, Activity, Calendar } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export default async function DashboardPage() {
    const session = await auth();
    const userId = session?.user?.id;

    // Gerçek projede Prismadan çekilecek, şimdilik mockup
    const stats = [
        { title: "Toplam Profil Ziyareti", value: 4523, icon: Users, trend: 12, color: "violet" },
        { title: "Toplam Etkileşim", value: 12845, icon: Heart, trend: 8, color: "teal" },
        { title: "Erişim (Reach)", value: 85400, icon: Activity, trend: 24, color: "blue" },
        { title: "Kaydedilme", value: 890, icon: Share2, trend: -2, color: "rose" },
    ] as const;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                        Genel Bakış
                    </h1>
                    <p className="text-slate-400 mt-1">
                        Tekrar hoş geldiniz, Dr. {session?.user?.name?.split(" ")[0] || "Fizyoterapist"}
                    </p>
                </div>
            </div>

            {/* İstatistikler */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <StatsCard key={stat.title} {...stat} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Onay Bekleyen Postlar */}
                <Card glow className="lg:col-span-2">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-violet-400" />
                            <CardTitle>Yaklaşan Paylaşımlar (Onaylanmış)</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Şimdilik boş durum */}
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
                                <Calendar className="w-8 h-8 text-slate-500" />
                            </div>
                            <h4 className="text-lg font-medium text-white mb-2">Planlanmış gönderi yok</h4>
                            <p className="text-slate-400 max-w-sm mb-6">
                                AI Stüdyo'da yeni içerik üretip onaylayarak takviminizi doldurun.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* AI Trend Önerileri */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Activity className="w-5 h-5 text-teal-400" />
                            <CardTitle>Bugünün Trendleri</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-violet-500/20">
                            <span className="text-xs font-bold text-violet-400 uppercase tracking-wider mb-2 block">
                                #1 Trend (Google M.T)
                            </span>
                            <h4 className="font-semibold text-white">Tenisçi Dirseği</h4>
                            <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                                Son 24 saatte "Tenisçi dirseği evde tedavi" aramaları %125 arttı.
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                                #2 Hızlı Yükselen
                            </span>
                            <h4 className="font-semibold text-white">Hamile Pilatesi</h4>
                            <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                                Bahar aylarının gelmesiyle anne adaylarının aramaları zirvede.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
