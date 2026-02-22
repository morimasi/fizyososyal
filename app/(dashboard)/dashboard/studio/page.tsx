"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useVoiceCommand } from "@/hooks/useVoiceCommand";
import { Mic, MicOff, Wand2, Image as ImageIcon, Send, Clock, AlertCircle, Heart, Share2, LayoutTemplate, Images, Clapperboard, Megaphone, Video, Instagram, Linkedin, MessageCircle, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

export type PostFormat = "post" | "carousel" | "video" | "ad";
export type Platform = "instagram" | "linkedin" | "tiktok";

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

    // Sesle gelen konuyu inputa aktar
    if (result?.topic && result.topic !== topic && !isGenerating) {
        setTopic(result.topic);
    }

    const handleGenerate = async () => {
        if (!topic.trim()) return;
        setIsGenerating(true);
        setGeneratedPost(null);

        try {
            // 1. Text Üretimi
            const textRes = await fetch("/api/ai/generate-text", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ topic, tone: "profesyonel", postFormat, evidenceBased }),
            });
            const textData = await textRes.json();

            // 2. Görsel Üretimi
            const mediaRes = await fetch("/api/ai/generate-media", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: textData.title || topic, aspectRatio: "1:1" }),
            });
            const mediaData = await mediaRes.json();

            setGeneratedPost({
                title: textData.title,
                content: textData.content,
                hashtags: textData.hashtags,
                mediaUrl: mediaData.mediaUrl,
                postFormat: postFormat, // Store the format used for generation
                platform: platform, // Store the platform intended
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
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent flex items-center gap-3">
                    <Wand2 className="w-8 h-8 text-violet-400" />
                    AI İçerik Stüdyosu
                </h1>
                <p className="text-slate-400 mt-2">Voice Chat veya metin ile saniyeler içinde post üretin.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Üretim Motoru */}
                <Card glow className="border-violet-500/20">
                    <CardHeader>
                        <CardTitle>Ne paylaşmak istersiniz?</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Platform Seçimi */}
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

                        {/* Format Seçimi */}
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

                        {/* Voice Input */}
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

                        {/* Manuel Input & Özellikler */}
                        <div className="space-y-4">
                            <textarea
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="Örn: Ofis çalışanları için boyun egzersizleri"
                                className="w-full bg-slate-900 border border-white/10 rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none h-24"
                            />

                            {/* Evidence Based Toggle */}
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

                {/* Önizleme Modülü (Mockup) */}
                <Card className="bg-slate-900 border-white/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <ImageIcon className="w-5 h-5 text-slate-400" />
                            <CardTitle>Canlı Önizleme ({platform === "instagram" ? "Instagram" : platform === "linkedin" ? "LinkedIn" : "TikTok"})</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {!generatedPost ? (
                            <div className="flex flex-col items-center justify-center h-[400px] text-center border-2 border-dashed border-white/10 rounded-2xl bg-white/5">
                                <ImageIcon className="w-12 h-12 text-slate-600 mb-4" />
                                <p className="text-slate-400 max-w-xs">
                                    Üretilen içerik burada Instagram mobil uygulamasında görüneceği gibi listelenecek.
                                </p>
                            </div>
                        ) : (
                            <div className="max-w-[320px] mx-auto bg-black rounded-[2.5rem] border-[8px] border-slate-800 overflow-hidden shadow-2xl relative">
                                {/* Instagram Mockup */}
                                {generatedPost.platform === "instagram" && (
                                    <div className={cn("relative bg-black", generatedPost.postFormat === "video" ? "h-[500px]" : "")}>

                                        {/* Video İçin Tam Ekran Görsel & Gradient */}
                                        {generatedPost.postFormat === "video" && (
                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10 pointer-events-none" />
                                        )}

                                        {/* IG Header */}
                                        <div className={cn(
                                            "flex items-center gap-3 p-3 relative z-20",
                                            generatedPost.postFormat === "video" ? "absolute top-0 w-full" : "border-b border-white/10"
                                        )}>
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center font-bold text-xs text-white">
                                                KL
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-sm text-white">klinic_fizyo</span>
                                                {generatedPost.postFormat === "ad" && (
                                                    <span className="text-[10px] text-slate-300">Sponsorlu</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* IG Image */}
                                        <div className={cn(
                                            "relative group overflow-hidden bg-slate-800",
                                            generatedPost.postFormat === "video" ? "aspect-[9/16] absolute inset-0" : "aspect-square"
                                        )}>
                                            {generatedPost.mediaUrl ? (
                                                <img
                                                    src={generatedPost.mediaUrl}
                                                    alt="Generated AI Media"
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <ImageIcon className="w-12 h-12 text-slate-600" />
                                                </div>
                                            )}

                                            {/* Carousel Indicator */}
                                            {generatedPost.postFormat === "carousel" && (
                                                <div className="absolute top-3 right-3 bg-black/60 rounded-full px-2 py-1 text-[10px] text-white backdrop-blur-sm">
                                                    1/5
                                                </div>
                                            )}
                                            {/* Video icon */}
                                            {generatedPost.postFormat === "video" && (
                                                <div className="absolute top-3 right-3">
                                                    <Video className="w-5 h-5 text-white/80" />
                                                </div>
                                            )}
                                        </div>

                                        {/* IG Caption */}
                                        <div className={cn(
                                            "p-4 flex flex-col relative z-20 custom-scrollbar",
                                            generatedPost.postFormat === "video" ? "absolute bottom-0 w-full h-[250px] overflow-y-auto" : "h-[200px] overflow-y-auto bg-black"
                                        )}>
                                            <div className="flex items-center gap-4 text-white mb-2">
                                                <Heart className="w-6 h-6 hover:text-rose-500 transition-colors cursor-pointer" />
                                                <svg className="w-6 h-6 hover:text-slate-300 cursor-pointer transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                                                </svg>
                                                <Share2 className="w-6 h-6 ml-auto hover:text-slate-300 cursor-pointer transition-colors" />
                                            </div>
                                            <p className="text-sm font-semibold text-white mt-1">1,245 beğenme</p>
                                            <p className="text-sm text-white whitespace-pre-wrap mt-1">
                                                <span className="font-semibold mr-2">{generatedPost.postFormat === "video" ? "@klinic_fizyo" : "klinic_fizyo"}</span>
                                                <span dangerouslySetInnerHTML={{ __html: generatedPost.content }} />
                                            </p>
                                            <p className="text-sm text-blue-400 mt-2 break-words">{generatedPost.hashtags}</p>
                                        </div>

                                        {/* Action Button for Ads */}
                                        {generatedPost.postFormat === "ad" && (
                                            <div className="bg-slate-900 border-t border-white/10 p-3">
                                                <button className="w-full bg-blue-600 text-white font-semibold py-2 rounded flex items-center justify-between px-4 text-sm hover:bg-blue-700 transition">
                                                    <span>Daha Fazla Bilgi Al</span>
                                                    <span className="text-lg">→</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* LinkedIn Mockup */}
                                {generatedPost.platform === "linkedin" && (
                                    <div className="bg-white rounded-lg overflow-hidden shadow-2xl relative border border-slate-200">
                                        {/* LinkedIn Header */}
                                        <div className="flex items-start gap-3 p-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-sm text-slate-600 shrink-0">KL</div>
                                            <div>
                                                <h4 className="font-semibold text-sm text-slate-900 leading-tight">Klinic Fizyo</h4>
                                                <p className="text-xs text-slate-500 line-clamp-1">Uzman Fizyoterapi Merkezi | Sağlıklı Yaşam</p>
                                                <p className="text-[10px] text-slate-400 mt-0.5">Şimdi • 🌐</p>
                                            </div>
                                            <div className="ml-auto text-blue-600 text-sm font-medium flex items-center gap-1 cursor-pointer">
                                                + Takip Et
                                            </div>
                                        </div>
                                        {/* LinkedIn Content */}
                                        <div className="px-3 pb-2 text-sm text-slate-800 whitespace-pre-wrap max-h-[150px] overflow-y-auto custom-scrollbar">
                                            <span dangerouslySetInnerHTML={{ __html: generatedPost.content }} />
                                            <p className="text-blue-600 mt-2">{generatedPost.hashtags}</p>
                                        </div>

                                        {/* LinkedIn Image */}
                                        <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                                            {generatedPost.mediaUrl ? (
                                                <img src={generatedPost.mediaUrl} alt="Generated" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <ImageIcon className="w-12 h-12 text-slate-300" />
                                                </div>
                                            )}
                                        </div>

                                        {/* LinkedIn Footer */}
                                        <div className="flex items-center justify-between px-4 py-2 border-t border-slate-100 text-slate-500">
                                            <div className="flex items-center gap-1 hover:bg-slate-100 p-2 rounded cursor-pointer transition">
                                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" /></svg>
                                                <span className="text-xs font-semibold">Beğen</span>
                                            </div>
                                            <div className="flex items-center gap-1 hover:bg-slate-100 p-2 rounded cursor-pointer transition">
                                                <MessageCircle className="w-5 h-5" />
                                                <span className="text-xs font-semibold">Yorum Yap</span>
                                            </div>
                                            <div className="flex items-center gap-1 hover:bg-slate-100 p-2 rounded cursor-pointer transition">
                                                <Share2 className="w-5 h-5" />
                                                <span className="text-xs font-semibold">Paylaş</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TikTok Mockup */}
                                {generatedPost.platform === "tiktok" && (
                                    <div className="bg-black border-[8px] border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl relative h-[600px] flex items-center justify-center">
                                        {/* TikTok BG/Video */}
                                        <div className="absolute inset-0 bg-slate-900 flex items-center justify-center overflow-hidden">
                                            {generatedPost.mediaUrl ? (
                                                <img src={generatedPost.mediaUrl} alt="Video" className="absolute inset-0 w-full h-full object-cover" />
                                            ) : (
                                                <Video className="w-16 h-16 text-slate-700" />
                                            )}
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80 pointer-events-none" />

                                        {/* Top UI */}
                                        <div className="absolute top-8 left-0 right-0 flex justify-center gap-4 text-white/80 text-sm font-semibold z-20">
                                            <span>Takip Edilenler</span>
                                            <span className="text-white relative after:content-[''] after:absolute after:-bottom-2 after:left-1/2 after:-translate-x-1/2 after:w-4 after:h-[2px] after:bg-white after:rounded-full">Sizin İçin</span>
                                        </div>

                                        {/* Right Actions */}
                                        <div className="absolute right-3 bottom-24 flex flex-col items-center gap-5 z-20">
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-800 overflow-hidden mb-1 relative">
                                                    <div className="w-full h-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center font-bold text-[10px] text-white">KL</div>
                                                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center text-white pb-0.5 font-bold text-[10px] border border-black">+</div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-center gap-1 text-white">
                                                <Heart className="w-8 h-8 drop-shadow-lg opacity-90" />
                                                <span className="text-xs font-medium">12K</span>
                                            </div>
                                            <div className="flex flex-col items-center gap-1 text-white">
                                                <MessageCircle className="w-8 h-8 drop-shadow-lg opacity-90" />
                                                <span className="text-xs font-medium">342</span>
                                            </div>
                                            <div className="flex flex-col items-center gap-1 text-white">
                                                <Bookmark className="w-8 h-8 drop-shadow-lg opacity-90" />
                                                <span className="text-xs font-medium">1.2K</span>
                                            </div>
                                            <div className="flex flex-col items-center gap-1 text-white">
                                                <Share2 className="w-8 h-8 drop-shadow-lg opacity-90" />
                                                <span className="text-xs font-medium">Paylaş</span>
                                            </div>
                                        </div>

                                        {/* Bottom Text */}
                                        <div className="absolute bottom-4 left-4 right-16 z-20">
                                            <h3 className="text-white font-bold text-sm mb-1">@klinic_fizyo</h3>
                                            <div className="text-white text-sm whitespace-pre-wrap line-clamp-3 mb-2">
                                                <span dangerouslySetInnerHTML={{ __html: generatedPost.content }} />
                                            </div>
                                            <p className="text-white font-semibold text-xs whitespace-nowrap overflow-hidden flex items-center gap-2">
                                                🎵 Orijinal Ses - Klinic Fizyo
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Actions */}
                        {generatedPost && (
                            <div className="flex gap-4 mt-6">
                                <Button variant="secondary" className="flex-1">
                                    <Clock className="w-4 h-4 mr-2" />
                                    Akıllı Zamanla (18:00)
                                </Button>
                                <Button variant="primary" className="flex-1">
                                    <Send className="w-4 h-4 mr-2" />
                                    Şimdi Yayınla
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
