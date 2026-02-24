"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Instagram, Link as LinkIcon, Share2, Database, ShieldCheck, AlertCircle, CheckCircle2, Zap } from "lucide-react";
import { useInstagramAuth } from "@/hooks/useInstagramAuth";
import { cn } from "@/lib/utils";

export function IntegrationHub() {
    const { isConnected, isLoading, error, connect, disconnect } = useInstagramAuth(null);

    const integrations = [
        { id: "instagram", name: "Instagram Business", desc: "Otomatik yayınlama ve DM yönetimi.", icon: Instagram, color: "text-pink-500", active: isConnected },
        { id: "leads", name: "CRM / Leads", desc: "Potansiyel hasta verilerini otomatik aktar.", icon: Database, color: "text-blue-400", active: false },
        { id: "webhooks", name: "Webhooks (API)", desc: "Dış sistemler için veri çıkışları.", icon: Zap, color: "text-amber-400", active: true },
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {integrations.map((item) => (
                    <Card key={item.id} className={cn("border-white/5 group transition-all duration-300 hover:border-white/10", item.active ? "bg-white/[0.02]" : "bg-slate-900/50")}>
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border border-white/5", item.active ? "bg-white/5" : "bg-black/20")}>
                                    <item.icon className={cn("w-5 h-5", item.color)} />
                                </div>
                                {item.active ? (
                                    <div className="flex items-center text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase">
                                        Bağlı
                                    </div>
                                ) : (
                                    <div className="text-[10px] font-bold text-slate-500 uppercase">Bağlı Değil</div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-white group-hover:text-emerald-400 transition-colors">{item.name}</h4>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                            </div>

                            {item.id === "instagram" ? (
                                <Button
                                    variant={isConnected ? "danger" : "primary"}
                                    size="sm"
                                    className="w-full"
                                    onClick={isConnected ? disconnect : connect}
                                    isLoading={isLoading}
                                >
                                    {isConnected ? "Bağlantıyı Kes" : "Şimdi Bağla"}
                                </Button>
                            ) : (
                                <Button variant="secondary" size="sm" className="w-full border-white/5 hover:border-white/20">
                                    Konfigüre Et
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {error && (
                <div className="flex items-center gap-3 text-rose-400 text-sm bg-rose-500/10 p-4 rounded-xl border border-rose-500/20 animate-shake">
                    <AlertCircle className="w-5 h-5" />
                    <span>Entegrasyon Hatası: {error}</span>
                </div>
            )}
        </div>
    );
}
