"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CreditCard, ShieldCheck, History, TrendingUp, Zap, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function BillingCenter() {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Current Plan Overview */}
                <Card glow className="md:col-span-2 border-emerald-500/20 bg-gradient-to-br from-slate-900/50 via-slate-900/50 to-emerald-900/10">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                                <CardTitle>Profesyonel Plus</CardTitle>
                            </div>
                            <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded border border-emerald-500/20 uppercase tracking-widest">
                                Aktif Plan
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-slate-500 uppercase">Post Limiti</p>
                                <p className="text-2xl font-bold text-white">45 <span className="text-slate-500 text-sm">/ 200</span></p>
                                <div className="h-1.5 w-full bg-black/40 rounded-full mt-2 overflow-hidden border border-white/5">
                                    <div className="bg-emerald-500 h-full w-[22%]" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-slate-500 uppercase">AI Kredisi</p>
                                <p className="text-2xl font-bold text-white">824 <span className="text-slate-500 text-sm">/ 1000</span></p>
                                <div className="h-1.5 w-full bg-black/40 rounded-full mt-2 overflow-hidden border border-white/5">
                                    <div className="bg-blue-500 h-full w-[82%]" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-slate-500 uppercase">Gelecek Fatura</p>
                                <p className="text-2xl font-bold text-white">15 Mar</p>
                                <p className="text-[10px] text-slate-500 font-medium">Otomatik Ödeme Aktif</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Payment Method */}
                <Card className="border-white/5 bg-slate-900/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Ödeme Yöntemi</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-3 rounded-xl bg-black/20 border border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-6 bg-slate-800 rounded border border-white/5 flex items-center justify-center">
                                    <CreditCard className="w-4 h-4 text-slate-400" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-white">**** 4242</p>
                                    <p className="text-[10px] text-slate-500">Exp: 12/26</p>
                                </div>
                            </div>
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        </div>
                        <Button variant="ghost" size="sm" className="w-full text-xs text-slate-400 border border-white/5 hover:bg-white/5">
                            Yöntemi Yönet
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Invoices */}
            <Card className="border-white/5 overflow-hidden">
                <CardHeader className="bg-white/[0.02] border-b border-white/5 py-4">
                    <div className="flex items-center gap-2">
                        <History className="w-5 h-5 text-slate-400" />
                        <CardTitle>Son Faturalar</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-white/5">
                        {[
                            { id: "INV-9821", date: "15 Şubat 2026", amount: "$49.00", status: "ÖDENDİ" },
                            { id: "INV-9742", date: "15 Ocak 2026", amount: "$49.00", status: "ÖDENDİ" },
                            { id: "INV-9611", date: "15 Aralık 2025", amount: "$49.00", status: "ÖDENDİ" },
                        ].map((inv) => (
                            <div key={inv.id} className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors">
                                <div className="space-y-0.5">
                                    <p className="text-sm font-bold text-white">{inv.id}</p>
                                    <p className="text-xs text-slate-500">{inv.date}</p>
                                </div>
                                <div className="flex items-center gap-8">
                                    <span className="text-sm font-bold text-white">{inv.amount}</span>
                                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                                        {inv.status}
                                    </span>
                                    <button className="text-xs text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-4">İndir</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
