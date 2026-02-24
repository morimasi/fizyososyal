import React from "react";
import { MessageCircle, Share2, Globe, ThumbsUp, Repeat, Send, MoreHorizontal, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

interface LinkedInPreviewProps {
    post: {
        title: string;
        content: string;
        hashtags: string;
        mediaUrl?: string;
    };
    isDarkMode?: boolean;
}

export const LinkedInPreview: React.FC<LinkedInPreviewProps> = ({ post, isDarkMode = false }) => {
    return (
        <div className={cn("flex flex-col h-full", isDarkMode ? "bg-[#1d2226] text-white/90" : "bg-white text-slate-900")}>
            {/* Header */}
            <div className="p-4 flex items-start gap-2">
                <div className="w-12 h-12 rounded bg-slate-200 flex items-center justify-center font-bold text-slate-500 text-lg shrink-0">
                    KF
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                        <span className="font-bold text-sm truncate">Klinic Fizyo</span>
                        <span className="text-xs text-slate-400 font-normal opacity-70">• 1.</span>
                    </div>
                    <p className="text-[11px] opacity-70 line-clamp-1">Klinik & Rehabilitasyon Hizmetleri • Modern Fizyoterapi</p>
                    <div className="flex items-center gap-1 opacity-60">
                        <span className="text-[10px]">Şimdi •</span>
                        <Globe className="w-2.5 h-2.5" />
                    </div>
                </div>
                <UserPlus className="w-5 h-5 text-blue-600 cursor-pointer" />
            </div>

            {/* Content */}
            <div className="px-4 pb-2">
                <div
                    className="text-sm leading-relaxed whitespace-pre-wrap line-clamp-5"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />
                <p className="text-sm text-blue-600 font-bold mt-2 cursor-pointer hover:underline">{post.hashtags}</p>
            </div>

            {/* Media */}
            <div className="relative aspect-[16/9] bg-slate-100 dark:bg-slate-800 shrink-0">
                {post.mediaUrl ? (
                    <img src={post.mediaUrl} alt="LinkedIn Post" className="w-full h-full object-cover" />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Share2 className="w-10 h-10 opacity-10" />
                    </div>
                )}
            </div>

            {/* Social Stats */}
            <div className="px-4 py-2 border-b border-slate-100 dark:border-white/5 flex items-center justify-between opacity-70">
                <div className="flex items-center -space-x-1">
                    <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center"><ThumbsUp className="w-2 h-2 text-white" /></div>
                    <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center"><ThumbsUp className="w-2 h-2 text-white scale-x-[-1]" /></div>
                    <span className="text-[10px] ml-6 font-medium">124</span>
                </div>
                <span className="text-[10px] font-medium">12 yorum • 4 paylaşım</span>
            </div>

            {/* Actions */}
            <div className="px-2 py-1 flex items-center justify-around">
                {[
                    { icon: ThumbsUp, label: "Beğen" },
                    { icon: MessageCircle, label: "Yorum" },
                    { icon: Repeat, label: "Paylaş" },
                    { icon: Send, label: "Gönder" },
                ].map((action, i) => (
                    <button key={i} className="flex flex-col items-center gap-1 p-2 rounded hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                        <action.icon className="w-5 h-5 opacity-70" />
                        <span className="text-[10px] font-bold opacity-70">{action.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};
