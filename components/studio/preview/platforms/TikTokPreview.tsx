import React, { useState, useEffect } from "react";
import { Heart, MessageCircle, Share2, Bookmark, Music2, Plus, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface TikTokPreviewProps {
    post: {
        content: string;
        hashtags: string;
        mediaUrl?: string;
    };
}

export const TikTokPreview: React.FC<TikTokPreviewProps> = ({ post }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(30);

    useEffect(() => {
        let interval: any;
        if (isPlaying) {
            interval = setInterval(() => {
                setProgress((prev) => (prev >= 100 ? 0 : prev + 0.5));
            }, 100);
        }
        return () => clearInterval(interval);
    }, [isPlaying]);

    return (
        <div
            className="relative h-full w-full bg-black text-white font-sans overflow-hidden select-none"
            onClick={() => setIsPlaying(!isPlaying)}
        >
            {/* Background Video/Image Sim */}
            <div className="absolute inset-0 flex items-center justify-center">
                {post.mediaUrl ? (
                    <img
                        src={post.mediaUrl}
                        alt="TikTok Background"
                        className={cn(
                            "w-full h-full object-cover transition-transform duration-[2000ms]",
                            isPlaying ? "scale-110" : "scale-100 blur-[2px]"
                        )}
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-900 to-black flex items-center justify-center">
                        <div className="w-24 h-24 rounded-full bg-white/5 animate-pulse" />
                    </div>
                )}
            </div>

            {/* Play Overlay */}
            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10 transition-opacity duration-300">
                    <div className="w-20 h-20 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 animate-in zoom-in-50">
                        <Play className="w-10 h-10 text-white fill-white ml-1.5" />
                    </div>
                </div>
            )}

            {/* Top Header */}
            <div className="absolute top-10 left-0 right-0 flex justify-center gap-6 py-2 z-20 text-[13px] font-bold opacity-90 drop-shadow-md">
                <span className="opacity-60">Takip Edilen</span>
                <span className="relative after:content-[''] after:absolute after:-bottom-1.5 after:left-1/2 after:-translate-x-1/2 after:w-5 after:h-0.5 after:bg-white after:rounded-full shadow-white">Sizin İçin</span>
            </div>

            {/* Right Sidebar Actions */}
            <div className="absolute right-3 bottom-28 flex flex-col items-center gap-5 z-20">
                <div className="relative mb-3">
                    <div className="w-12 h-12 rounded-full border border-white bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-bold text-xs ring-2 ring-black shadow-xl">
                        KF
                    </div>
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-[#fe2c55] rounded-full w-4.5 h-4.5 flex items-center justify-center text-[10px] border border-white shadow-lg">
                        <Plus className="w-3.5 h-3.5 fill-white" />
                    </div>
                </div>

                <div className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 flex items-center justify-center bg-transparent group-active:scale-90 transition-transform"><Heart className="w-8 h-8 fill-[#fe2c55] stroke-[#fe2c55] drop-shadow-lg" /></div>
                    <span className="text-xs font-bold drop-shadow-lg">84.2K</span>
                </div>

                <div className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 flex items-center justify-center"><MessageCircle className="w-8 h-8 fill-white stroke-black stroke-[0.2px] drop-shadow-lg" /></div>
                    <span className="text-xs font-bold drop-shadow-lg">1.2K</span>
                </div>

                <div className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 flex items-center justify-center"><Bookmark className="w-8 h-8 fill-[#face15] stroke-[#face15] drop-shadow-lg" /></div>
                    <span className="text-xs font-bold drop-shadow-lg">3.4K</span>
                </div>

                <div className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 flex items-center justify-center"><Share2 className="w-8 h-8 fill-white stroke-black stroke-[0.2px] drop-shadow-lg" /></div>
                    <span className="text-xs font-bold drop-shadow-lg whitespace-nowrap scale-90">Paylaş</span>
                </div>

                <div className={cn(
                    "w-11 h-11 rounded-full bg-slate-800 border-8 border-slate-700 mt-4 shadow-2xl overflow-hidden",
                    isPlaying ? "animate-spin-slow" : ""
                )}>
                    <div className="w-full h-full bg-gradient-to-tr from-slate-900 via-indigo-900 to-slate-900 flex items-center justify-center">
                        <Music2 className="w-3 h-3 text-white/50" />
                    </div>
                </div>
            </div>

            {/* Bottom Info Section */}
            <div className="absolute bottom-10 left-4 right-16 z-20 space-y-3">
                <h3 className="font-bold text-base drop-shadow-lg text-white">@klinic_fizyo</h3>
                <div className="text-[13px] drop-shadow-lg line-clamp-2 leading-relaxed opacity-95 text-white/90" dangerouslySetInnerHTML={{ __html: post.content }} />
                <div className="flex items-center gap-2.5 text-[11px] font-bold text-white/80 drop-shadow-lg">
                    <Music2 className="w-3 h-3 animate-pulse" />
                    <div className="overflow-hidden w-full whitespace-nowrap">
                        <span className={cn(
                            "inline-block",
                            isPlaying ? "animate-marquee" : ""
                        )}>
                            • Orijinal Ses - Klinic Fizyo • Orijinal Ses - Klinic Fizyo •
                        </span>
                    </div>
                </div>
            </div>

            {/* Bottom Progress Bar */}
            <div className="absolute bottom-2 inset-x-4 h-[1px] bg-white/10 rounded-full z-20">
                <div
                    className="h-full bg-white/80 rounded-full transition-all duration-100 ease-linear shadow-[0_0_4px_rgba(255,255,255,0.5)]"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Screen Polish / Gradients */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70 pointer-events-none" />
        </div>
    );
};
