"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Users, Heart, Share2, Activity, ArrowUpRight } from "lucide-react";

export default function AnalyticsPage() {
    const stats = [
        { title: "Profil Ziyareti", value: "4.5K", icon: Users, trend: 12, color: "violet" },
        { title: "Toplam Etkileşim", value: "12.8K", icon: Heart, trend: 8, color: "teal" },
        { title: "Erişim (Reach)", value: "85.4K", icon: Activity, trend: 24, color: "blue" },
        { title: "Bağlantı Tıklaması", value: 342, icon: ArrowUpRight, trend: -2, color: "rose" },
    ] as const;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                    Analitik & ROI
                </h1>
                <p className="text-slate-400 mt-2">İçeriklerinizin performansını ve dönüşüm oranlarını takip edin.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <StatsCard key={stat.title} {...stat} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card glow className="border-teal-500/20">
                    <CardHeader>
                        <CardTitle>Etkileşim Trendi (Son 30 Gün)</CardTitle>
                    </CardHeader>
                    <CardContent className="h-64 flex items-center justify-center border-t border-white/5 pb-0">
                        {/* Gerçek projede Recharts gibi bir kütüphane konur */}
                        <div className="text-slate-500 flex flex-col items-center">
                            <Activity className="w-12 h-12 mb-2 opacity-50" />
                            <span>Grafik verisi yükleniyor...</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>En İyi Performans Gösteren Postlar</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/10">
                                <div className="w-16 h-16 bg-slate-800 rounded-lg flex-shrink-0" />
                                <div className="flex-1">
                                    <h4 className="text-white font-medium text-sm line-clamp-1">
                                        Skolyoz İçin Evde Yapılabilecek 5 Basit Egzersiz
                                    </h4>
                                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                                        <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-rose-400" /> 1.2K</span>
                                        <span className="flex items-center gap-1"><Share2 className="w-3 h-3 text-blue-400" /> 340</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
