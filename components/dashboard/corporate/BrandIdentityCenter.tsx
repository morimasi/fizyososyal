"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BrainCircuit, Sparkles, Wand2, Type, Music, Palette, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function BrandIdentityCenter() {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [brandVoice, setBrandVoice] = useState("Samimi ve hastaya güven veren akademik bir dil.");

    const handleAIAnalyze = () => {
        setIsAnalyzing(true);
        setTimeout(() => setIsAnalyzing(false), 2000);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
            {/* AI Brand Architect Header */}
            <div className="bg-gradient-to-r from-violet-600/20 via-indigo-600/10 to-transparent p-6 rounded-2xl border border-violet-500/20 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 blur-[100px] -z-10" />
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-600/40">
                        <BrainCircuit className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">AI Marka Mimarı</h3>
                        <p className="text-sm text-slate-400">Verilerinizden otomatik marka kişiliği oluşturun.</p>
                    </div>
                </div>
                <Button
                    onClick={handleAIAnalyze}
                    isLoading={isAnalyzing}
                    className="bg-violet-600 hover:bg-violet-700 border-0 shadow-lg shadow-violet-900/40"
                    size="lg"
                >
                    <Sparkles className="w-4 h-4 mr-2" /> Analiz Et ve Oluştur
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Brand Voice */}
                <Card className="lg:col-span-2 border-white/5 bg-slate-900/50">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Type className="w-5 h-5 text-amber-400" />
                            <CardTitle>Marka Sesi (Brand Voice)</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <textarea
                            value={brandVoice}
                            onChange={(e) => setBrandVoice(e.target.value)}
                            className="w-full h-32 bg-slate-900 border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-amber-500 outline-none resize-none text-sm leading-relaxed"
                            placeholder="Markanızın konuşma dilini buraya yazın..."
                        />
                        <div className="flex flex-wrap gap-2">
                            {["Akademik", "Empatik", "Motivasyonel", "Otoriter"].map(tag => (
                                <span key={tag} className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-500 uppercase tracking-wider">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Visual Guidelines */}
                <Card className="border-white/5 bg-slate-900/50">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Palette className="w-5 h-5 text-indigo-400" />
                            <CardTitle>Stil Rehberi</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Renk Paleti</label>
                            <div className="flex gap-2">
                                <div className="w-8 h-8 rounded-lg bg-violet-600 border border-white/10" />
                                <div className="w-8 h-8 rounded-lg bg-indigo-500 border border-white/10" />
                                <div className="w-8 h-8 rounded-lg bg-slate-200 border border-white/10" />
                                <button className="w-8 h-8 rounded-lg border border-dashed border-white/20 flex items-center justify-center hover:border-white/40 transition-colors">
                                    <span className="text-sm text-slate-500">+</span>
                                </button>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Yazı Tipleri</label>
                            <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                                <span className="text-sm font-medium text-white">Inter / Outfit</span>
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
