import React from "react";
import { Heart, MessageCircle, Share2, Bookmark, Music2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface TikTokPreviewProps {
    post: {
        content: string;
        hashtags: string;
        mediaUrl?: string;
    };
}

export const TikTokPreview: React.FC<TikTokPreviewProps> = ({ post }) => {
    return (
        <div className="relative h-full w-full bg-black text-white font-sans overflow-hidden">
            {/* Background Video/Image Sim */}
            <div className="absolute inset-0 flex items-center justify-center">
                {post.mediaUrl ? (
                    <img src={post.mediaUrl} alt="TikTok Background" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-900 to-black flex items-center justify-center">
                        <div className="w-24 h-24 rounded-full bg-white/5 animate-pulse" />
                    </div>
                )}
            </div>

            {/* Top Header */}
            <div className="absolute top-8 left-0 right-0 flex justify-center gap-4 py-2 z-20 text-sm font-bold opacity-80 backdrop-blur-sm">
                <span className="opacity-60">Takip Edilen</span>
                <span className="relative after:content-[''] after:absolute after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-4 after:h-0.5 after:bg-white after:rounded-full">Sizin İçin</span>
            </div>

            {/* Right Sidebar Actions */}
            <div className="absolute right-3 bottom-24 flex flex-col items-center gap-4 z-20">
                <div className="relative mb-2">
                    <div className="w-12 h-12 rounded-full border-2 border-white bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center font-bold text-xs ring-2 ring-black">
                        KF
                    </div>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-[#fe2c55] rounded-full w-4 h-4 flex items-center justify-center text-[10px] border border-white">
                        <Plus className="w-3 h-3" />
                    </div>
                </div>

                <div className="flex flex-col items-center">
                    <div className="w-10 h-10 flex items-center justify-center"><Heart className="w-8 h-8 fill-[#fe2c55] stroke-[#fe2c55]" /></div>
                    <span className="text-xs font-bold drop-shadow-md">84.2K</span>
                </div>

                <div className="flex flex-col items-center">
                    <div className="w-10 h-10 flex items-center justify-center"><MessageCircle className="w-8 h-8 fill-white stroke-black stroke-[0.5px]" /></div>
                    <span className="text-xs font-bold drop-shadow-md">1.2K</span>
                </div>

                <div className="flex flex-col items-center">
                    <div className="w-10 h-10 flex items-center justify-center"><Bookmark className="w-8 h-8 fill-[#face15] stroke-[#face15]" /></div>
                    <span className="text-xs font-bold drop-shadow-md">3.4K</span>
                </div>

                <div className="flex flex-col items-center">
                    <div className="w-10 h-10 flex items-center justify-center"><Share2 className="w-8 h-8 fill-white stroke-black stroke-[0.5px]" /></div>
                    <span className="text-xs font-bold drop-shadow-md">Paylaş</span>
                </div>

                <div className="w-10 h-10 rounded-full bg-slate-800 border-4 border-slate-700 mt-2 animate-spin-slow">
                    <div className="w-full h-full rounded-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30" />
                </div>
            </div>

            {/* Bottom Info Section */}
            <div className="absolute bottom-6 left-4 right-16 z-20 space-y-2">
                <h3 className="font-bold text-base drop-shadow-lg">@klinic_fizyo</h3>
                <div className="text-sm drop-shadow-lg line-clamp-3 leading-snug" dangerouslySetInnerHTML={{ __html: post.content }} />
                <div className="flex items-center gap-1.5 text-xs font-bold text-white drop-shadow-lg">
                    <Music2 className="w-3 h-3 animate-pulse" />
                    <div className="overflow-hidden w-full whitespace-nowrap">
                        <span className="inline-block animate-marquee">• Orijinal Ses - Klinic Fizyo • Orijinal Ses - Klinic Fizyo</span>
                    </div>
                </div>
            </div>

            {/* Bottom Progress Bar */}
            <div className="absolute bottom-1.5 inset-x-4 h-0.5 bg-white/20 rounded-full z-20">
                <div className="h-full w-1/3 bg-white rounded-full" />
            </div>

            {/* Screen Polish */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />
        </div>
    );
};
