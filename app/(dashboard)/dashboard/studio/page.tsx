"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useVoiceCommand } from "@/hooks/useVoiceCommand";
import {
    Mic, MicOff, Wand2, AlertCircle, Zap, BrainCircuit,
    Instagram, LayoutTemplate, Images, Video, Megaphone,
    CheckCircle2, Linkedin
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SocialPreview } from "@/components/studio/preview/SocialPreview";

export type PostFormat = "post" | "carousel" | "video" | "ad";
export type Platform = "instagram" | "linkedin" | "tiktok";
type UserRole = "ADMIN" | "EDITOR" | "APPROVER";

export default function StudioPage() {
    const { isListening, transcript, result, error, startListening, stopListening } = useVoiceCommand();
    const [topic, setTopic] = useState("");
    const [platform, setPlatform] = useState<Platform>("instagram");
    const [postFormat, setPostFormat] = useState<PostFormat>("post");
    const [evidenceBased, setEvidenceBased] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedPost, setGeneratedPost] = useState<{
        title: string;
        content: string;
        hashtags: string;
        mediaUrl?: string;
        postFormat: PostFormat;
        platform: Platform;
    } | null>(null);
    const [selectedModel, setSelectedModel] = useState<"gemini-flash" | "gemini-pro">("gemini-flash");
    const [userRole, setUserRole] = useState<UserRole>("EDITOR");
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Hydration-safe persistence
    useEffect(() => {
        const saved = localStorage.getItem("physio_studio_draft");
        if (saved) {
            try {
                const data = JSON.parse(saved);
                if (data.topic) setTopic(data.topic);
                if (data.generatedPost) setGeneratedPost(data.generatedPost);
                if (data.platform) setPlatform(data.platform);
                if (data.postFormat) setPostFormat(data.postFormat);
                if (data.selectedModel) setSelectedModel(data.selectedModel);
            } catch (e) { console.error(e); }
        }
    }, []);

    // Selection persistence
    useEffect(() => {
        const timeout = setTimeout(() => {
            const data = { topic, generatedPost, platform, postFormat, selectedModel };
            localStorage.setItem("physio_studio_draft", JSON.stringify(data));
            setLastSaved(new Date());
        }, 1000);
        return () => clearTimeout(timeout);
    }, [topic, generatedPost, platform, postFormat, selectedModel]);

    // Voice integration
    useEffect(() => {
        if (result?.topic && result.topic !== topic && !isGenerating) {
            setTopic(result.topic);
        }
    }, [result, topic, isGenerating]);

    const handleGenerate = async () => {
        if (!topic.trim()) return;
        setIsGenerating(true);
        setGeneratedPost(null);

        try {
            const textRes = await fetch("/api/ai/generate-text", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    topic,
                    tone: "profesyonel",
                    postFormat,
                    evidenceBased,
                    model: selectedModel
                }),
            });
            const textData = await textRes.json();

            const mediaRes = await fetch("/api/ai/generate-media", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: textData.title || topic,
                    aspectRatio: postFormat === "video" ? "9:16" : "1:1",
                    quality: selectedModel === "gemini-pro" ? "high" : "standard"
                }),
            });
            const mediaData = await mediaRes.json();

            setGeneratedPost({
                title: textData.title,
                content: textData.content,
                hashtags: textData.hashtags,
                mediaUrl: mediaData.mediaUrl,
                postFormat: postFormat,
                platform: platform,
            });
        } catch (err) {
            console.error("Üretim hatası:", err);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                            AI İçerik Stüdyosu Pro
                        </h1>
                        <div className="flex items-center gap-2 mt-2">
                            <p className="text-slate-400">Omni-format içerik ve zeka merkezi.</p>
                            {mounted && lastSaved && (
                                <span className="text-[10px] text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1 animate-fade-in">
                                    <CheckCircle2 className="w-3 h-3" /> Otomatik Kaydedildi ({lastSaved.toLocaleTimeString()})
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 p-1.5 bg-slate-900/50 border border-white/5 rounded-xl self-start">
                        <span className="text-[10px] font-bold text-slate-500 uppercase px-2">Simülasyon Rolü:</span>
                        {(["EDITOR", "APPROVER", "ADMIN"] as UserRole[]).map((r) => (
                            <button
                                key={r}
                                onClick={() => setUserRole(r)}
                                className={cn(
                                    "px-3 py-1 rounded-lg text-[10px] font-bold transition-all border",
                                    userRole === r
                                        ? "bg-violet-600 text-white border-violet-500"
                                        : "text-slate-500 border-transparent hover:text-white"
                                )}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                </div>
                <p className="text-slate-400 mt-2">Voice Chat veya metin ile saniyeler içinde post üretin.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card glow className="border-violet-500/20">
                    <CardHeader>
                        <CardTitle>Ne paylaşmak istersiniz?</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3">Zekâ Seviyesi (AI Model)</label>
                            <div className="grid grid-cols-2 gap-3 p-1 bg-slate-900/50 border border-white/5 rounded-xl">
                                {[
                                    { id: "gemini-flash", label: "Express", icon: Zap, desc: "Hızlı Taslaklar" },
                                    { id: "gemini-pro", label: "Hâkim", icon: BrainCircuit, desc: "Derin Analiz" },
                                ].map((m) => (
                                    <button
                                        key={m.id}
                                        onClick={() => setSelectedModel(m.id as any)}
                                        className={cn(
                                            "flex flex-col items-center justify-center gap-1 p-3 rounded-lg transition-all border",
                                            selectedModel === m.id
                                                ? "bg-violet-600/10 border-violet-500/50 text-white shadow-inner"
                                                : "border-transparent text-slate-500 hover:text-slate-300"
                                        )}
                                    >
                                        <m.icon className={cn("w-5 h-5", selectedModel === m.id ? "text-violet-400" : "text-slate-600")} />
                                        <span className="text-[11px] font-bold">{m.label}</span>
                                        <span className="text-[9px] opacity-60">{m.desc}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-300 mb-3 block">1. Hedef Platformu Seçin</label>
                            <div className="flex gap-3">
                                {[
                                    { id: "instagram", label: "Instagram", icon: Instagram, color: "text-slate-500 hover:text-fuchsia-500", bgActive: "bg-fuchsia-500/20 border-fuchsia-500 text-white" },
                                    { id: "linkedin", label: "LinkedIn", icon: Linkedin, color: "text-slate-500 hover:text-blue-500", bgActive: "bg-blue-500/20 border-blue-500 text-white" },
                                    { id: "tiktok", label: "TikTok", icon: Instagram, customIcon: true, color: "text-slate-500 hover:text-slate-300", bgActive: "bg-slate-700/50 border-white text-white" },
                                ].map((p) => (
                                    <button
                                        key={p.id}
                                        onClick={() => setPlatform(p.id as Platform)}
                                        className={cn(
                                            "flex flex-1 items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-200",
                                            platform === p.id
                                                ? p.bgActive
                                                : "bg-slate-800/50 border-white/5 text-slate-400 hover:bg-slate-800 hover:border-white/10"
                                        )}
                                    >
                                        {p.customIcon ? (
                                            <svg className={cn("w-5 h-5", platform === p.id ? "text-white" : p.color)} viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" /></svg>
                                        ) : (
                                            <p.icon className={cn("w-5 h-5", platform === p.id ? "text-white" : p.color)} />
                                        )}
                                        <span className="text-sm font-medium">{p.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-300 mb-3 block">2. İçerik Formatını Seçin</label>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                {[
                                    { id: "post", label: "Statik Post", icon: LayoutTemplate },
                                    { id: "carousel", label: "Slayt (Carousel)", icon: Images },
                                    { id: "video", label: "Reels / Video", icon: Video },
                                    { id: "ad", label: "Reklam (Ad)", icon: Megaphone },
                                ].map((format) => (
                                    <button
                                        key={format.id}
                                        onClick={() => setPostFormat(format.id as PostFormat)}
                                        className={cn(
                                            "flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200",
                                            postFormat === format.id
                                                ? "bg-violet-600/20 border-violet-500 text-white"
                                                : "bg-slate-800/50 border-white/5 text-slate-400 hover:bg-slate-800 hover:border-white/10"
                                        )}
                                    >
                                        <format.icon className={cn("w-6 h-6 mb-2", postFormat === format.id ? "text-violet-400" : "text-slate-500")} />
                                        <span className="text-xs font-medium">{format.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="relative mt-4">
                            <label className="text-sm font-medium text-slate-300 mb-3 block">3. Konuyu Belirleyin</label>
                            <div
                                className={cn(
                                    "absolute -inset-1 rounded-2xl blur opacity-20 transition duration-1000",
                                    isListening ? "bg-gradient-to-r from-violet-600 to-rose-600 opacity-100 animate-pulse" : ""
                                )}
                            />
                            <div className="relative bg-slate-900 border border-white/10 rounded-xl p-4 flex flex-col items-center justify-center gap-4 min-h-[140px]">
                                {error && (
                                    <div className="flex items-center gap-2 text-rose-400 text-sm mb-2 bg-rose-500/10 px-3 py-1.5 rounded-lg w-full">
                                        <AlertCircle className="w-4 h-4" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <button
                                    onClick={isListening ? stopListening : startListening}
                                    className={cn(
                                        "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl",
                                        isListening
                                            ? "bg-rose-500 hover:bg-rose-600 shadow-rose-500/50 scale-110"
                                            : "bg-slate-800 hover:bg-slate-700 hover:scale-105 border border-white/10"
                                    )}
                                >
                                    {isListening ? (
                                        <MicOff className="w-6 h-6 text-white" />
                                    ) : (
                                        <Mic className="w-6 h-6 text-slate-300" />
                                    )}
                                </button>
                                <div className="text-center">
                                    <p className="font-medium text-white mb-1">
                                        {isListening ? "Dinleniyor..." : "Sesli Komut İle Başla"}
                                    </p>
                                    <p className="text-sm text-slate-500 max-w-xs mx-auto italic">
                                        {transcript || '"Bana bel ağrısı için eğitici bir içerik hazırla"'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 py-2">
                            <span className="flex-1 h-px bg-white/10" />
                            <span className="text-xs font-semibold text-slate-500 uppercase">VEYA MANUEL YAZIN</span>
                            <span className="flex-1 h-px bg-white/10" />
                        </div>

                        <div className="space-y-4">
                            <textarea
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="Örn: Ofis çalışanları için boyun egzersizleri"
                                className="w-full bg-slate-900 border border-white/10 rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none h-24"
                            />

                            <div className="flex items-center justify-between bg-slate-800/50 border border-slate-700/50 rounded-xl p-3">
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-slate-200">🔬 Kanıta Dayalı İçerik (RAG)</span>
                                    <span className="text-xs text-slate-400">Tıbbi makalelerden ve literatürden referans ekle</span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={evidenceBased}
                                        onChange={(e) => setEvidenceBased(e.target.checked)}
                                    />
                                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-500"></div>
                                </label>
                            </div>

                            <Button
                                onClick={handleGenerate}
                                isLoading={isGenerating}
                                disabled={!topic.trim() || isGenerating}
                                className="w-full h-12 text-base"
                            >
                                <Wand2 className="w-5 h-5 mr-2" />
                                {isGenerating ? "Yapay Zeka İçeriği Üretiyor..." : "Sihri Başlat"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <SocialPreview
                    generatedPost={generatedPost}
                    isGenerating={isGenerating}
                    userRole={userRole}
                />
            </div>
        </div>
    );
}
