import React from "react";
import { Heart, Share2, Video, Instagram, MessageCircle, Bookmark, MoreHorizontal } from "lucide-react";
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
    const isVideo = post.postFormat === "video";
    const isAd = post.postFormat === "ad";

    return (
        <div className={cn("flex flex-col h-full", isDarkMode ? "bg-black text-white" : "bg-white text-black")}>
            {/* Header */}
            <div className={cn(
                "flex items-center justify-between p-3 shrink-0 relative z-20",
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
            <div className={cn(
                "relative flex-1 overflow-hidden",
                isVideo ? "h-full" : "aspect-square bg-slate-900"
            )}>
                {post.mediaUrl ? (
                    <img
                        src={post.mediaUrl}
                        alt="AI Preview"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Instagram className="w-12 h-12 opacity-20" />
                    </div>
                )}

                {/* Formats Icons */}
                <div className="absolute top-3 right-3 z-30">
                    {post.postFormat === "carousel" && (
                        <div className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-bold">1/5</div>
                    )}
                    {isVideo && <Video className="w-5 h-5 drop-shadow-lg" />}
                </div>

                {/* Video Overlays (Reels style) */}
                {isVideo && (
                    <div className="absolute inset-x-0 bottom-0 p-4 pt-20 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-20">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-sm">@klinic_fizyo</span>
                                <button className="text-xs font-bold border border-white/40 px-2 py-0.5 rounded-lg">Takip Et</button>
                            </div>
                            <div className="text-sm line-clamp-2" dangerouslySetInnerHTML={{ __html: post.content }} />
                            <div className="text-xs font-bold text-blue-400">{post.hashtags}</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Social Feed Interaction Area */}
            {!isVideo && (
                <div className="p-3 space-y-2 shrink-0">
                    <div className="flex items-center gap-4">
                        <Heart className="w-6 h-6 hover:text-rose-500 cursor-pointer transition-colors" />
                        <MessageCircle className="w-6 h-6 hover:opacity-70 cursor-pointer transition-colors" />
                        <Share2 className="w-6 h-6 hover:opacity-70 cursor-pointer transition-colors" />
                        <Bookmark className="w-6 h-6 ml-auto hover:opacity-70 cursor-pointer transition-colors" />
                    </div>
                    <div className="text-sm">
                        <p className="font-bold">4,812 beğenme</p>
                        <div className="mt-1 flex flex-col gap-1">
                            <p className="text-sm leading-snug">
                                <span className="font-bold mr-2">klinic_fizyo</span>
                                <span dangerouslySetInnerHTML={{ __html: post.content }} />
                            </p>
                            <p className="text-xs text-blue-500 font-medium break-words">{post.hashtags}</p>
                        </div>
                        <p className="text-[10px] uppercase text-slate-500 font-bold mt-2">1 SAAT ÖNCE</p>
                    </div>
                </div>
            )}

            {/* Call to Action for Ads */}
            {isAd && !isVideo && (
                <div className="bg-blue-600 px-4 py-2.5 flex items-center justify-between cursor-pointer hover:bg-blue-700 transition-colors">
                    <span className="text-sm font-bold text-white">Daha Fazla Bilgi Al</span>
                    <span className="text-lg">›</span>
                </div>
            )}
        </div>
    );
};
