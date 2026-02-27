import React from "react";
import { MessageCircle, Share2, Globe, ThumbsUp, Repeat, Send, MoreHorizontal, UserPlus, ShieldCheck, Heart, Sparkles } from "lucide-react";
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
        <div className={cn(
            "flex flex-col h-full rounded-2xl overflow-hidden border transition-all duration-500",
            isDarkMode
                ? "bg-[#1d2226] text-white/90 border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
                : "bg-white text-slate-900 border-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.05)]"
        )}>
            {/* Glassmorphism Header */}
            <div className="p-4 flex items-start gap-3 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-blue-600/20">
                        KF
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-4 h-4 rounded-full border-2 border-white dark:border-[#1d2226] z-10 shadow-sm" />
                </div>

                <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-extrabold text-[15px] tracking-tight hover:text-blue-600 transition-colors cursor-pointer">
                            Klinik Fizyo Strateji
                        </span>
                        <div className="flex items-center gap-1 bg-blue-500/10 px-1.5 py-0.5 rounded text-[10px] text-blue-500 font-bold uppercase tracking-widest">
                            <ShieldCheck className="w-3 h-3" />
                            Doğrulanmış
                        </div>
                    </div>
                    <p className="text-[12px] opacity-70 font-medium leading-none mt-1">
                        Klinik & Rehabilitasyon Teknolojileri • Global Sağlık
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5 opacity-50">
                        <span className="text-[11px] font-bold tracking-tighter">Şimdi •</span>
                        <Globe className="w-3 h-3" />
                        <span className="text-[11px] font-bold tracking-tighter">• Düzenlendi</span>
                    </div>
                </div>

                <button className="p-1 px-3 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-blue-600 font-bold text-sm flex items-center gap-1">
                    <UserPlus className="w-4 h-4" />
                    Takip Et
                </button>
            </div>

            {/* Dynamic Content Layer */}
            <div className="px-4 py-2 space-y-3">
                <div
                    className="text-[14px] leading-[1.6] font-medium tracking-tight whitespace-pre-wrap selection:bg-blue-600/30 line-clamp-6"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />
                <div className="flex flex-wrap gap-2 pt-1">
                    {post.hashtags.split(' ').map((tag, idx) => (
                        <span key={idx} className="text-[13px] text-blue-600 font-bold hover:underline cursor-pointer">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

            {/* Premium Media Canvas */}
            <div className="relative aspect-[16/9] bg-slate-100 dark:bg-slate-800/50 mt-2 overflow-hidden group">
                <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                {post.mediaUrl ? (
                    <img
                        src={post.mediaUrl}
                        alt="LinkedIn Post"
                        className="w-full h-full object-cover transition-transform duration-[3000ms] group-hover:scale-105"
                    />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-blue-600/5 flex items-center justify-center border border-blue-600/10">
                            <Share2 className="w-8 h-8 text-blue-600 opacity-20" />
                        </div>
                        <span className="text-xs font-bold text-blue-600/20 uppercase tracking-widest">Görsel Bekleniyor</span>
                    </div>
                )}
            </div>

            {/* Social Signal Bar */}
            <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center -space-x-1.5 group cursor-pointer">
                    <div className="w-5 h-5 rounded-full bg-blue-600 border-2 border-white dark:border-[#1d2226] flex items-center justify-center z-30 shadow-sm">
                        <ThumbsUp className="w-2.5 h-2.5 text-white fill-white" />
                    </div>
                    <div className="w-5 h-5 rounded-full bg-red-500 border-2 border-white dark:border-[#1d2226] flex items-center justify-center z-20 shadow-sm">
                        <Heart className="w-2.5 h-2.5 text-white fill-white" />
                    </div>
                    <div className="w-5 h-5 rounded-full bg-amber-500 border-2 border-white dark:border-[#1d2226] flex items-center justify-center z-10 shadow-sm">
                        <Sparkles className="w-2.5 h-2.5 text-white fill-white" />
                    </div>
                    <span className="text-[12px] ml-8 font-bold text-slate-500 group-hover:text-blue-600 transition-colors">
                        Siz ve 248 kişi daha
                    </span>
                </div>
                <div className="text-[12px] font-bold text-slate-500 hover:text-blue-600 transition-colors cursor-pointer">
                    48 yorum • 12 paylaşım
                </div>
            </div>

            {/* Interactive Professional Actions */}
            <div className="px-1 py-1 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                {[
                    { icon: ThumbsUp, label: "Beğen", color: "hover:text-blue-600" },
                    { icon: MessageCircle, label: "Yorum Yap", color: "hover:text-blue-600" },
                    { icon: Repeat, label: "Yeniden Paylaş", color: "hover:text-emerald-600" },
                    { icon: Send, label: "Gönder", color: "hover:text-indigo-600" },
                ].map((action, i) => (
                    <button
                        key={i}
                        className={cn(
                            "flex items-center justify-center flex-1 gap-2 p-3 rounded-lg transition-all duration-300 group",
                            "hover:bg-slate-100 dark:hover:bg-white/5",
                            action.color
                        )}
                    >
                        <action.icon className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-all group-hover:scale-110" />
                        <span className="text-[13px] font-bold opacity-70 group-hover:opacity-100 hidden sm:inline">{action.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};
