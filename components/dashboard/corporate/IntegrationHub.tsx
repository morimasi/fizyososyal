"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
    Instagram, Database, Zap,
    AlertCircle, CheckCircle2, RefreshCw,
    ExternalLink, Unlink, Users, AtSign
} from "lucide-react";
import { useInstagramAuth } from "@/hooks/useInstagramAuth";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export function IntegrationHub() {
    const { isConnected, isLoading, error, username, accountId, connect, disconnect, refresh } = useInstagramAuth(null);
    const searchParams = useSearchParams();

    // OAuth sonrası geri dönüş — durum yenile
    useEffect(() => {
        if (searchParams.get("success") === "connected" || searchParams.get("error")) {
            refresh();
        }
    }, [searchParams, refresh]);

    const successParam = searchParams.get("success");
    const errorParam = searchParams.get("error");

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">

            {/* OAuth Geri Bildirim Mesajları */}
            {successParam === "connected" && (
                <div className="flex items-center gap-3 text-emerald-400 text-sm bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20 animate-in fade-in duration-300">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">Instagram hesabınız başarıyla bağlandı! İçerikleri artık otomatik yayınlayabilirsiniz.</span>
                </div>
            )}
            {errorParam && (
                <div className="flex items-center gap-3 text-rose-400 text-sm bg-rose-500/10 p-4 rounded-xl border border-rose-500/20">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">
                        {errorParam === "no_code" ? "Instagram izin vermedi. Lütfen tekrar deneyin." : "Bağlantı sırasında bir hata oluştu."}
                    </span>
                </div>
            )}

            {/* Instagram Bağlantı Kartı */}
            <Card className={cn(
                "border-2 transition-all duration-500 relative overflow-hidden",
                isConnected
                    ? "border-pink-500/30 bg-gradient-to-br from-pink-500/5 to-rose-500/5"
                    : "border-white/5 bg-slate-900/50"
            )}>
                {isConnected && (
                    <div className="absolute top-0 right-0 w-48 h-48 bg-pink-600/10 blur-[80px] -z-0 pointer-events-none" />
                )}
                <CardHeader className="pb-4 relative z-10">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                "w-14 h-14 rounded-2xl flex items-center justify-center border transition-all",
                                isConnected
                                    ? "bg-gradient-to-br from-pink-500/20 to-rose-500/20 border-pink-500/30"
                                    : "bg-black/20 border-white/5"
                            )}>
                                <Instagram className={cn("w-7 h-7", isConnected ? "text-pink-400" : "text-slate-600")} />
                            </div>
                            <div>
                                <CardTitle className="text-lg text-white">Instagram Business</CardTitle>
                                <p className="text-xs text-slate-500 mt-1">Otomatik yayınlama · Analitik · DM Yönetimi</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" />
                            ) : isConnected ? (
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Bağlı</span>
                                </div>
                            ) : (
                                <div className="px-3 py-1.5 bg-slate-800/50 border border-white/10 rounded-full">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">Bağlı Değil</span>
                                </div>
                            )}
                            <button
                                onClick={refresh}
                                className="p-2 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-colors"
                                title="Yenile"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-5 relative z-10">
                    {isConnected && (
                        <div className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                                <AtSign className="w-4 h-4 text-pink-400" />
                                <span className="text-white font-semibold">{username || "Instagram Hesabı"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span className="font-mono bg-slate-800/50 px-2 py-0.5 rounded text-slate-400">ID: {accountId}</span>
                                <span className="text-emerald-500 font-bold">● Aktif Token</span>
                            </div>
                        </div>
                    )}

                    {!isConnected && (
                        <div className="space-y-3">
                            <div className="grid grid-cols-3 gap-3 text-center">
                                {[
                                    { label: "Otomatik Yayın", desc: "Takvimden tek tıkla" },
                                    { label: "Analitik Takip", desc: "Etkileşim verileri" },
                                    { label: "Zamanlama", desc: "En uygun saat önerisi" },
                                ].map(item => (
                                    <div key={item.label} className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                                        <p className="text-[11px] font-black text-white">{item.label}</p>
                                        <p className="text-[10px] text-slate-500 mt-0.5">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3">
                        {isConnected ? (
                            <>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="flex-1 border-white/5 hover:border-white/20"
                                    onClick={disconnect}
                                    isLoading={isLoading}
                                >
                                    <Unlink className="w-4 h-4 mr-2" />
                                    Bağlantıyı Kes
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="border-white/5 hover:border-white/20"
                                    onClick={() => window.open("https://business.instagram.com", "_blank")}
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </Button>
                            </>
                        ) : (
                            <Button
                                size="sm"
                                className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 shadow-lg shadow-pink-600/20 border-0"
                                onClick={connect}
                                isLoading={isLoading}
                            >
                                <Instagram className="w-4 h-4 mr-2" />
                                Instagram ile Bağlan
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Diğer Entegrasyonlar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                    { id: "leads", name: "CRM / Hasta Kayıtları", desc: "Potansiyel hasta verilerini otomatik aktar.", icon: Database, color: "text-blue-400", active: false },
                    { id: "webhooks", name: "Webhooks (API)", desc: "Dış sistemler için veri çıkışları.", icon: Zap, color: "text-amber-400", active: true },
                ].map((item) => (
                    <Card key={item.id} className={cn(
                        "border-white/5 group transition-all duration-300 hover:border-white/10",
                        item.active ? "bg-white/[0.02]" : "bg-slate-900/50"
                    )}>
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border border-white/5", item.active ? "bg-white/5" : "bg-black/20")}>
                                        <item.icon className={cn("w-5 h-5", item.color)} />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-white text-sm">{item.name}</h4>
                                        <p className="text-xs text-slate-500">{item.desc}</p>
                                    </div>
                                </div>
                                <div className={cn(
                                    "text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full border",
                                    item.active
                                        ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                                        : "text-slate-600 bg-slate-800/50 border-white/5"
                                )}>
                                    {item.active ? "Aktif" : "Yakında"}
                                </div>
                            </div>
                            <Button
                                variant="secondary"
                                size="sm"
                                className="w-full border-white/5 hover:border-white/20"
                                disabled={!item.active}
                            >
                                {item.active ? "Konfigüre Et" : "Çok Yakında"}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {error && (
                <div className="flex items-center gap-3 text-rose-400 text-sm bg-rose-500/10 p-4 rounded-xl border border-rose-500/20">
                    <AlertCircle className="w-5 h-5" />
                    <span>Entegrasyon Hatası: {error}</span>
                </div>
            )}
        </div>
    );
}
