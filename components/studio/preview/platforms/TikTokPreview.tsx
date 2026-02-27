import React, { useState, useEffect } from "react";
import { Heart, MessageCircle, Share2, Bookmark, Music2, Plus, Play, Sparkles, Volume2, ShieldCheck } from "lucide-react";
import { cn, cleanClinicContent } from "@/lib/utils";

interface TikTokPreviewProps {
    post: {
        content: string;
        hashtags: string;
        mediaUrl?: string;
    };
}

export const TikTokPreview: React.FC<TikTokPreviewProps> = ({ post }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [hearts, setHearts] = useState<{ id: number, x: number, y: number }[]>([]);

    useEffect(() => {
        let interval: any;
        if (isPlaying) {
            interval = setInterval(() => {
                setProgress((prev) => (prev >= 100 ? 0 : prev + 0.2));
            }, 50);
        }
        return () => clearInterval(interval);
    }, [isPlaying]);

    const handleDoubleTap = (e: React.MouseEvent) => {
        const newHeart = {
            id: Date.now(),
            x: e.clientX,
            y: e.clientY
        };
        setHearts(prev => [...prev, newHeart]);
        setTimeout(() => {
            setHearts(prev => prev.filter(h => h.id !== newHeart.id));
        }, 1000);
    };

    return (
        <div
            className="relative h-full w-full bg-black text-white font-sans overflow-hidden select-none group"
            onClick={() => setIsPlaying(!isPlaying)}
            onDoubleClick={handleDoubleTap}
        >
            {/* Ultra-Fluid Background Canvas */}
            <div className="absolute inset-0 z-0">
                {post.mediaUrl ? (
                    <img
                        src={post.mediaUrl}
                        alt="TikTok Background"
                        className={cn(
                            "w-full h-full object-cover transition-all duration-[5000ms] ease-out",
                            isPlaying ? "scale-110 brightness-110" : "scale-100 brightness-50 blur-[4px]"
                        )}
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-[#121212] via-[#212121] to-black flex items-center justify-center">
                        <div className="flex flex-col items-center gap-4 opacity-20">
                            <div className="w-24 h-24 rounded-full bg-white/10 animate-pulse border border-white/20" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Visual Input Required</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Dynamic Love Particles (ozel) */}
            {hearts.map(h => (
                <div
                    key={h.id}
                    className="absolute z-50 pointer-events-none animate-ping"
                    style={{ left: h.x - 20, top: h.y - 140 }}
                >
                    <Heart className="w-12 h-12 fill-[#fe2c55] stroke-none drop-shadow-[0_0_15px_rgba(254,44,85,0.5)]" />
                </div>
            ))}

            {/* Play/Pause Glass Overlay */}
            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[2px] z-10 animate-in fade-in duration-300">
                    <div className="w-24 h-24 rounded-full bg-white/5 backdrop-blur-xl flex items-center justify-center border border-white/10 shadow-2xl scale-110 transition-transform active:scale-95">
                        <Play className="w-10 h-10 text-white fill-white ml-2 drop-shadow-lg" />
                    </div>
                </div>
            )}

            {/* Top Navigation Sim */}
            <div className="absolute top-8 left-0 right-0 flex justify-center gap-8 py-4 z-40 text-[14px] font-black tracking-tighter opacity-80 drop-shadow-xl select-none">
                <span className="opacity-40 hover:opacity-100 transition-opacity">Takip Edilen</span>
                <div className="relative">
                    <span>Sizin İçin</span>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-white rounded-full shadow-[0_0_10px_white]" />
                </div>
            </div>

            {/* Premium Interactive Sidebar (ozel) */}
            <div className="absolute right-3 bottom-32 flex flex-col items-center gap-6 z-40">
                <div className="relative mb-4 group/avatar">
                    <div className="w-12 h-12 rounded-full border-2 border-white bg-gradient-to-br from-[#fe2c55] via-[#25f4ee] to-[#fe2c55] p-[1.5px] shadow-2xl transition-transform group-hover/avatar:scale-110">
                        <div className="w-full h-full rounded-full bg-black flex items-center justify-center font-black text-[10px] text-white">
                            KF
                        </div>
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#fe2c55] rounded-full w-5 h-5 flex items-center justify-center border-2 border-black group-hover/avatar:scale-125 transition-transform">
                        <Plus className="w-3.5 h-3.5 text-white" />
                    </div>
                </div>

                {[
                    { icon: Heart, count: "124K", active: true, color: "text-[#fe2c55] fill-[#fe2c55]" },
                    { icon: MessageCircle, count: "1.2K", color: "text-white" },
                    { icon: Bookmark, count: "48.2K", color: "text-white hover:text-amber-400" },
                    { icon: Share2, count: "Paylaş", color: "text-white" }
                ].map((act, i) => (
                    <div key={i} className="flex flex-col items-center gap-1 group/btn cursor-pointer">
                        <div className={cn(
                            "w-10 h-10 flex items-center justify-center transition-all group-active/btn:scale-90",
                            act.color
                        )}>
                            <act.icon className={cn("w-8 h-8 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]", act.active ? "animate-pulse" : "")} />
                        </div>
                        <span className="text-[11px] font-black drop-shadow-md tracking-tighter">{act.count}</span>
                    </div>
                ))}

                <div className={cn(
                    "w-12 h-12 rounded-full border-[10px] border-slate-900 shadow-2xl mt-4 overflow-hidden relative",
                    isPlaying ? "animate-spin-slow" : ""
                )}>
                    <div className="w-full h-full bg-gradient-to-tr from-slate-800 to-black flex items-center justify-center">
                        <Music2 className="w-4 h-4 text-white/30" />
                    </div>
                </div>
            </div>

            {/* Content & Metadata Hub */}
            <div className="absolute bottom-12 left-4 right-20 z-40 space-y-4">
                <div className="flex items-center gap-2">
                    <h3 className="font-black text-[17px] tracking-tighter text-white drop-shadow-xl">@klinic_fizyo</h3>
                    <div className="bg-blue-400 rounded-full p-0.5"><ShieldCheck className="w-3 h-3 text-white fill-white" /></div>
                </div>

                <div className="relative">
                    <div
                        className="text-[14px] leading-snug drop-shadow-lg font-medium opacity-95 text-white/90 line-clamp-3"
                        dangerouslySetInnerHTML={{ __html: cleanClinicContent(post.content) }}
                    />
                    <div className="flex flex-wrap gap-2 mt-2">
                        {post.hashtags.split(' ').map((tag, idx) => (
                            <span key={idx} className="text-[14px] font-black text-white hover:text-[#25f4ee] transition-colors cursor-pointer mr-1">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full w-fit border border-white/5">
                    <Music2 className="w-3 h-3 animate-pulse text-[#25f4ee]" />
                    <div className="overflow-hidden max-w-[140px] whitespace-nowrap">
                        <span className={cn(
                            "inline-block text-[11px] font-bold tracking-tight",
                            isPlaying ? "animate-marquee" : ""
                        )}>
                            Klinik Fizyo • Orijinal Ses • Klinik Fizyo • Orijinal Ses
                        </span>
                    </div>
                </div>
            </div>

            {/* Smart Progress Indicator */}
            <div className="absolute bottom-4 inset-x-4 h-0.5 bg-white/10 rounded-full z-40 group-hover:h-1 transition-all">
                <div
                    className="h-full bg-gradient-to-r from-white/40 to-white rounded-full transition-all duration-100 ease-linear shadow-[0_0_10px_white]"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Atmospheric Polish (ozel) */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none z-30" />
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-30" />

            {/* HUD Status Elements */}
            <div className="absolute top-10 right-4 z-50 flex items-center gap-3 opacity-60">
                <Volume2 className="w-4 h-4" />
                <Sparkles className="w-4 h-4 text-[#25f4ee]" />
            </div>
        </div>
    );
};
