"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useVoiceCommand } from "@/hooks/useVoiceCommand";
import {
    Mic, MicOff, Wand2, AlertCircle, Zap, BrainCircuit,
    Instagram, LayoutTemplate, Images, Video, Megaphone,
    CheckCircle2, Linkedin, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SocialPreview } from "@/components/studio/preview/SocialPreview";
import { ModelSelector } from "@/components/studio/ModelSelector";
import { PlatformSelector } from "@/components/studio/PlatformSelector";
import { FormatSelector } from "@/components/studio/FormatSelector";
import { TopicInput } from "@/components/studio/TopicInput";
import { AIModel, Platform, PostFormat, FormatSettings, GeneratedPost, UserRole } from "@/types/studio";

export default function StudioPage() {
    const { isListening, transcript, result, error, startListening, stopListening } = useVoiceCommand();
    const [topic, setTopic] = useState("");
    const [platform, setPlatform] = useState<Platform>("instagram");
    const [postFormat, setPostFormat] = useState<PostFormat>("post");
    const [formatSettings, setFormatSettings] = useState<FormatSettings>({
        slideCount: 6,
        visualStyle: "clinical",
        targetAudience: "general",
        videoStyle: "informational"
    });
    const [evidenceBased, setEvidenceBased] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [generatedPost, setGeneratedPost] = useState<GeneratedPost | null>(null);
    const [selectedModel, setSelectedModel] = useState<AIModel>("gemini-flash");
    const [userRole, setUserRole] = useState<UserRole>("EDITOR");
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [mounted, setMounted] = useState(false);
    const [savedPostId, setSavedPostId] = useState<string | null>(null);
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

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
                if (data.formatSettings) setFormatSettings(data.formatSettings);
            } catch (e) { console.error(e); }
        }
    }, []);

    // Selection persistence
    useEffect(() => {
        const timeout = setTimeout(() => {
            const data = { topic, generatedPost, platform, postFormat, selectedModel, formatSettings };
            localStorage.setItem("physio_studio_draft", JSON.stringify(data));
            setLastSaved(new Date());
        }, 1000);
        return () => clearTimeout(timeout);
    }, [topic, generatedPost, platform, postFormat, selectedModel, formatSettings]);

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
                    model: selectedModel,
                    settings: formatSettings
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
                settings: formatSettings
            });
        } catch (err) {
            console.error("Üretim hatası:", err);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleOptimize = async () => {
        if (!topic.trim()) return;
        setIsOptimizing(true);
        console.log("[STUDIO] Optimizasyon başlatılıyor. Konu:", topic);
        try {
            const res = await fetch("/api/ai/optimize-prompt", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ topic }),
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`API hatası (${res.status}): ${errorText}`);
            }

            const data = await res.json();
            console.log("[STUDIO] Optimizasyon başarılı:", data);

            if (data.optimized) {
                if (data.optimized === topic) {
                    console.warn("[STUDIO] AI içerik genişletemedi (aynı metni döndü).");
                }
                setTopic(data.optimized);
            } else {
                console.warn("[STUDIO] API'den boş sonuç döndü.");
            }
        } catch (err: any) {
            console.error("[STUDIO] Optimize hatası:", err.message);
            // Optional: Set some error state here to show to user
        } finally {
            setIsOptimizing(false);
        }
    };

    const handleSave = async () => {
        if (!generatedPost || !generatedPost.content) {
            console.error("[STUDIO] Kayıt denemesi başarısız: İçerik boş.");
            setSaveStatus("error");
            return;
        }

        setSaveStatus("saving");
        console.log("[STUDIO] Kaydediliyor...", { title: generatedPost.title });

        try {
            const res = await fetch("/api/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: generatedPost.title,
                    content: generatedPost.content,
                    hashtags: generatedPost.hashtags,
                    mediaUrl: generatedPost.mediaUrl,
                    postFormat,
                    platform,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                console.error("[STUDIO] API Kaydetme Hatası:", data);
                throw new Error(data.error || "Kaydetme hatası");
            }

            setSavedPostId(data.post.id);
            setSaveStatus("saved");
            setLastSaved(new Date());
            console.log("[STUDIO] Kayıt başarılı:", data.post.id);
        } catch (err: any) {
            console.error("[STUDIO] Kaydetme hatası catch:", err);
            setSaveStatus("error");
            setTimeout(() => setSaveStatus("idle"), 3000);
        }
    };

    const handlePublishNow = async () => {
        if (!generatedPost) return;
        // Önce kaydetmemişse kaydet
        let postId = savedPostId;
        if (!postId) {
            setSaveStatus("saving");
            try {
                const res = await fetch("/api/posts", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title: generatedPost.title,
                        content: generatedPost.content,
                        hashtags: generatedPost.hashtags,
                        mediaUrl: generatedPost.mediaUrl,
                        postFormat,
                        platform,
                    }),
                });
                if (!res.ok) throw new Error("Kaydetme hatası");
                const data = await res.json();
                postId = data.post.id;
                setSavedPostId(postId);
                setSaveStatus("saved");
            } catch (err) {
                console.error("[STUDIO] Kaydetme hatası:", err);
                setSaveStatus("error");
                return;
            }
        }
        // Yayınla
        try {
            const res = await fetch(`/api/posts/${postId}/publish`, { method: "POST" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            alert(data.message);
        } catch (err: any) {
            console.error("[STUDIO] Yayınlama hatası:", err);
            alert(`Yayınlama hatası: ${err.message}`);
        }
    };

    const handleSchedulePost = async (scheduledDate: Date) => {
        if (!generatedPost) return;
        // Önce kaydetmemişse kaydet
        let postId = savedPostId;
        if (!postId) {
            setSaveStatus("saving");
            try {
                const res = await fetch("/api/posts", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title: generatedPost.title,
                        content: generatedPost.content,
                        hashtags: generatedPost.hashtags,
                        mediaUrl: generatedPost.mediaUrl,
                        postFormat,
                        platform,
                        scheduledDate: scheduledDate.toISOString(),
                    }),
                });
                if (!res.ok) throw new Error("Kaydetme hatası");
                const data = await res.json();
                postId = data.post.id;
                setSavedPostId(postId);
                setSaveStatus("saved");
            } catch (err) {
                console.error("[STUDIO] Kaydetme hatası:", err);
                setSaveStatus("error");
                return;
            }
        } else {
            // Mevcut postu zamanla
            try {
                const res = await fetch(`/api/posts/${postId}/schedule`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ scheduledDate: scheduledDate.toISOString() }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);
                alert(data.message);
            } catch (err: any) {
                console.error("[STUDIO] Zamanlama hatası:", err);
                alert(`Zamanlama hatası: ${err.message}`);
            }
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
                    <CardContent className="space-y-8">
                        {/* 0. Model Selection */}
                        <ModelSelector
                            selectedModel={selectedModel}
                            onSelect={setSelectedModel}
                        />

                        {/* 1. Platform Selection */}
                        <PlatformSelector
                            selectedPlatform={platform}
                            onSelect={setPlatform}
                        />

                        {/* 2. Format Selection & Customization */}
                        <FormatSelector
                            selectedFormat={postFormat}
                            settings={formatSettings}
                            onFormatChange={setPostFormat}
                            onSettingsChange={(newSettings) => setFormatSettings(prev => ({ ...prev, ...newSettings }))}
                        />

                        {/* 3. Topic & Voice */}
                        <TopicInput
                            topic={topic}
                            setTopic={setTopic}
                            isListening={isListening}
                            transcript={transcript}
                            error={error}
                            isOptimizing={isOptimizing}
                            startListening={startListening}
                            stopListening={stopListening}
                            onOptimize={handleOptimize}
                        />

                        <div className="space-y-4">
                            <div className="flex items-center justify-between bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
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
                                className="w-full h-14 text-base font-bold shadow-xl shadow-violet-500/10"
                            >
                                <Wand2 className="w-5 h-5 mr-3" />
                                {isGenerating ? "Yapay Zeka İçeriği Üretiyor..." : "Sihri Başlat"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <SocialPreview
                    generatedPost={generatedPost}
                    isGenerating={isGenerating}
                    userRole={userRole}
                    onSave={handleSave}
                    onPublishNow={handlePublishNow}
                    onSchedule={handleSchedulePost}
                    saveStatus={saveStatus}
                    isSaved={!!savedPostId}
                />
            </div>
        </div>
    );
}
