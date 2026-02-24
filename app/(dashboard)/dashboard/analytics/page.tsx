"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Users, Heart, Share2, Activity, Target, TrendingUp, BarChart2, PieChart as PieChartIcon } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';

const trendData = [
    { name: '1 Eyl', etkilesim: 4000, randevuTiklamasi: 240 },
    { name: '5 Eyl', etkilesim: 4500, randevuTiklamasi: 280 },
    { name: '10 Eyl', etkilesim: 3800, randevuTiklamasi: 190 },
    { name: '15 Eyl', etkilesim: 5200, randevuTiklamasi: 390 },
    { name: '20 Eyl', etkilesim: 4800, randevuTiklamasi: 310 },
    { name: '25 Eyl', etkilesim: 6100, randevuTiklamasi: 420 },
    { name: '30 Eyl', etkilesim: 7500, randevuTiklamasi: 580 },
];

const competitorData = [
    { name: 'Klinic Fizyo (Biz)', etkilesimOrani: 5.2, postSayisi: 24 },
    { name: 'Rakip A Merkezi', etkilesimOrani: 2.1, postSayisi: 12 },
    { name: 'Rakip B Terapi', etkilesimOrani: 4.4, postSayisi: 30 },
    { name: 'Rakip C Sağlık', etkilesimOrani: 1.8, postSayisi: 8 },
];

const themeData = [
    { name: 'Omurga Sağlığı', value: 45, color: '#8b5cf6' }, // violet
    { name: 'Manuel Terapi', value: 25, color: '#14b8a6' }, // teal
    { name: 'Sporcu Rehb.', value: 20, color: '#0ea5e9' }, // sky blue
    { name: 'Klinik İçi', value: 10, color: '#f43f5e' }, // rose
];

export default function AnalyticsPage() {
    const stats = [
        { title: "Profil Ziyareti", value: "8.2K", icon: Users, trend: 15, color: "violet" },
        { title: "Toplam Etkileşim", value: "35.9K", icon: Heart, trend: 22, color: "teal" },
        { title: "Dönüşüm (Randevu Butonu)", value: "2,180", icon: Target, trend: 34, color: "blue" },
        { title: "Aylık Erişim (Reach)", value: "145.4K", icon: Activity, trend: -3, color: "rose" },
    ] as const;

    // Custom Tooltip for dark mode
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl">
                    <p className="text-slate-300 font-medium mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} style={{ color: entry.color }} className="text-sm">
                            {entry.name}: <span className="font-bold">{entry.value}</span>
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent flex items-center gap-3">
                    <TrendingUp className="w-8 h-8 text-teal-400" />
                    Gelişmiş Analitik & ROI V2
                </h1>
                <p className="text-slate-400 mt-2">İçeriklerinizin kliniğinize getirdiği hastaları ve rakiplerinize kıyasla performansınızı ölçün.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <StatsCard key={stat.title} {...stat} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 1. Dönüşüm Hunisi ve Etkileşim Trendi */}
                <Card glow className="col-span-1 lg:col-span-2 border-teal-500/20">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Activity className="w-5 h-5 text-teal-400" />
                            <CardTitle>Etkileşim ve Randevu Dönüşüm Hunisi</CardTitle>
                        </div>
                        <CardDescription>Son 30 gündeki Instagram etkileşimlerinin link-in-bio tıklamalarına oranı</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorEtkilesim" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorRandevu" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend verticalAlign="top" height={36} iconType="circle" />
                                <Area type="monotone" name="Etkileşim (Beğeni/Yorum)" dataKey="etkilesim" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorEtkilesim)" />
                                <Area type="monotone" name="Randevu Tıklaması" dataKey="randevuTiklamasi" stroke="#14b8a6" strokeWidth={3} fillOpacity={1} fill="url(#colorRandevu)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* 2. İçerik Teması Analizi */}
                <Card className="col-span-1">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <PieChartIcon className="w-5 h-5 text-violet-400" />
                            <CardTitle>En Çok Dönüşüm Getiren Temalar</CardTitle>
                        </div>
                        <CardDescription>Hangi içerik tipleri daha çok hasta çekiyor?</CardDescription>
                    </CardHeader>
                    <CardContent className="min-h-[350px] flex flex-col items-center justify-center">
                        <div className="w-full h-[220px]">
                            <ResponsiveContainer width="100%" height="100%" minHeight={220}>
                                <PieChart>
                                    <Pie
                                        data={themeData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {themeData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="w-full mt-4 space-y-2">
                            {themeData.map((item) => (
                                <div key={item.name} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-slate-300">{item.name}</span>
                                    </div>
                                    <span className="text-white font-medium">%{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Rakip Analizi (Competitor Tracking) */}
                <Card className="col-span-1 lg:col-span-3 border-blue-500/20">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <BarChart2 className="w-5 h-5 text-blue-400" />
                            <CardTitle>Canlı Rakip Analizi (Bölgesel Klinikler)</CardTitle>
                        </div>
                        <CardDescription>Bulunduğunuz şehirdeki diğer 3 kliniğin bu ayki Instagram performansı ile kliniğinizin karşılaştırması.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[400px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={competitorData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                layout="vertical"
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={true} vertical={false} />
                                <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis dataKey="name" type="category" width={130} stroke="#94a3b8" fontSize={13} fontWeight="500" tickLine={false} axisLine={false} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                                <Legend verticalAlign="top" height={36} iconType="circle" />
                                <Bar name="Etkileşim Oranı (%)" dataKey="etkilesimOrani" fill="#0ea5e9" radius={[0, 4, 4, 0]} barSize={20} />
                                <Bar name="Paylaşılan Post Sayısı" dataKey="postSayisi" fill="#64748b" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
