import React, { useState, useEffect } from "react";
import { Heart, Share2, Video, Instagram, MessageCircle, Bookmark, MoreHorizontal, ChevronLeft, ChevronRight, Play, Pause, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface InstagramPreviewProps {
    post: {
        title: string;
        content: string;
        hashtags: string;
        mediaUrl?: string;
        postFormat: "post" | "carousel" | "video" | "ad";
    };
    isDarkMode?: boolean;
}

export const InstagramPreview: React.FC<InstagramPreviewProps> = ({ post, isDarkMode = true }) => {
    const [currentSlide, setCurrentSlide] = useState(1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);

    const isVideo = post.postFormat === "video";
    const isAd = post.postFormat === "ad";
    const isCarousel = post.postFormat === "carousel";
    const totalSlides = 5; // Simulating 5 slides for carousel

    // Video progress sim
    useEffect(() => {
        let interval: any;
        if (isVideo && isPlaying) {
            interval = setInterval(() => {
                setProgress((prev) => (prev >= 100 ? 0 : prev + 1));
            }, 50) as any;
        }
        return () => clearInterval(interval);
    }, [isVideo, isPlaying]);

    return (
        <div className={cn("flex flex-col h-full w-full select-none", isDarkMode ? "bg-black text-white" : "bg-white text-black")}>
            {/* Header */}
            <div className={cn(
                "flex items-center justify-between p-3 shrink-0 relative z-30",
                isVideo ? "absolute top-0 w-full bg-gradient-to-b from-black/60 to-transparent" : "border-b border-white/5"
            )}>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-[1.5px]">
                        <div className="w-full h-full rounded-full bg-black border border-black flex items-center justify-center font-bold text-[10px] text-white">
                            KF
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold leading-none">klinic_fizyo</span>
                        {(isAd || isVideo) && (
                            <span className="text-[10px] font-medium opacity-70">
                                {isAd ? "Sponsorlu" : "Özgün Ses"}
                            </span>
                        )}
                    </div>
                </div>
                <MoreHorizontal className="w-4 h-4 opacity-70" />
            </div>

            {/* Main Content Area */}
            <div
                className={cn(
                    "relative flex-1 overflow-hidden group/media",
                    isVideo ? "h-full" : "aspect-square bg-slate-900"
                )}
                onClick={() => isVideo && setIsPlaying(!isPlaying)}
            >
                {/* Media Content */}
                <div className="w-full h-full relative">
                    {post.mediaUrl ? (
                        <div className="w-full h-full relative transition-all duration-500 ease-in-out">
                            <img
                                src={post.mediaUrl}
                                alt="AI Preview"
                                className={cn(
                                    "w-full h-full object-cover transition-transform duration-700",
                                    isVideo && !isPlaying ? "scale-105 blur-[2px]" : "scale-100"
                                )}
                            />
                            {/* Carousel Overlay */}
                            {isCarousel && (
                                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-2 flex justify-between opacity-0 group-hover/media:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setCurrentSlide(prev => Math.max(1, prev - 1)) }}
                                        className="p-1.5 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-colors"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setCurrentSlide(prev => Math.min(totalSlides, prev + 1)) }}
                                        className="p-1.5 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-colors"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Instagram className="w-12 h-12 opacity-20" />
                        </div>
                    )}

                    {/* Video Play Trigger */}
                    {isVideo && !isPlaying && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10 transition-all duration-300">
                            <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 animate-in zoom-in-50 duration-300">
                                <Play className="w-8 h-8 text-white fill-white ml-1" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Formats Badges */}
                <div className="absolute top-3 right-3 z-30 flex gap-2">
                    {isCarousel && (
                        <div className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-bold shadow-lg">
                            {currentSlide}/{totalSlides}
                        </div>
                    )}
                    {isVideo && (
                        <div className="bg-black/60 backdrop-blur-md p-1.5 rounded-full shadow-lg">
                            <Video className="w-4 h-4 text-white" />
                        </div>
                    )}
                </div>

                {/* Video Progress Bar */}
                {isVideo && (
                    <div className="absolute bottom-0 inset-x-0 h-0.5 bg-white/20 z-40">
                        <div
                            className="h-full bg-white transition-all duration-100 ease-linear shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}

                {/* Realistic Reels Content (Bottom Overlay) */}
                {isVideo && (
                    <div className="absolute inset-x-0 bottom-0 p-4 pb-8 pt-20 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-20">
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center bg-slate-800 text-[8px] font-bold">KF</div>
                                <span className="font-bold text-sm shadow-sm">@klinic_fizyo</span>
                                <button className="text-[10px] font-bold border border-white/60 px-2 py-1 rounded-lg backdrop-blur-sm hover:bg-white/10 transition-colors">Takip Et</button>
                            </div>
                            <div className="text-sm line-clamp-2 drop-shadow-md font-medium" dangerouslySetInnerHTML={{ __html: post.content }} />
                            <div className="flex items-center gap-2 text-xs font-bold text-white opacity-90">
                                <span className="bg-white/10 px-2 py-1 rounded-md flex items-center gap-1">
                                    <Sparkles className="w-3 h-3 text-yellow-400" /> AI ile Üretildi
                                </span>
                                <span className="drop-shadow-sm font-medium">{post.hashtags.split(' ')[0]}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Interaction Footer for Standards */}
            {!isVideo && (
                <div className="p-3 space-y-2 shrink-0 border-t border-white/5">
                    <div className="flex items-center gap-4">
                        <Heart className="w-6 h-6 hover:text-rose-500 cursor-pointer transition-all active:scale-125" />
                        <MessageCircle className="w-6 h-6 hover:opacity-70 cursor-pointer transition-colors" />
                        <Share2 className="w-6 h-6 hover:opacity-70 cursor-pointer transition-colors" />

                        {/* Dot navigation for carousel */}
                        {isCarousel && (
                            <div className="mx-auto flex gap-1">
                                {[...Array(totalSlides)].map((_, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "w-1.5 h-1.5 rounded-full transition-all duration-300",
                                            currentSlide === i + 1 ? "bg-blue-500 scale-125" : "bg-slate-300 opacity-30"
                                        )}
                                    />
                                ))}
                            </div>
                        )}

                        <Bookmark className={cn("w-6 h-6 hover:opacity-70 cursor-pointer transition-colors", !isCarousel && "ml-auto")} />
                    </div>

                    <div className="text-sm">
                        <p className="font-bold">4,812 beğenme</p>
                        <div className="mt-1 flex flex-col gap-1.5">
                            <p className="text-sm leading-relaxed">
                                <span className="font-bold mr-2 text-blue-400">klinic_fizyo</span>
                                <span className="opacity-90 leading-relaxed" dangerouslySetInnerHTML={{ __html: post.content }} />
                            </p>
                            <p className="text-xs text-blue-500 font-bold tracking-tight">{post.hashtags}</p>
                        </div>
                        <p className="text-[10px] uppercase text-slate-500 font-bold mt-3 tracking-widest">1 SAAT ÖNCE</p>
                    </div>
                </div>
            )}

            {/* Call to Action for Ads */}
            {isAd && !isVideo && (
                <div className="bg-blue-600 px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-blue-700 transition-all active:scale-[0.98] mt-auto">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Daha Fazla Bilgi Al</span>
                    <span className="text-xl leading-none">›</span>
                </div>
            )}
        </div>
    );
};
