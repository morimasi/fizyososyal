"use client";

import React from "react";
import { useDraggable } from "@dnd-kit/core";
import {
    LayoutTemplate,
    Images,
    Video,
    Megaphone,
    Clock,
    Sparkles,
    CheckCircle2,
    Clock3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PostStatus } from "@prisma/client";

interface CalendarPostCardProps {
    post: {
        id: string;
        title: string;
        scheduledDate: Date;
        status: PostStatus;
        format: "post" | "carousel" | "video" | "ad";
        mediaUrl?: string;
        isAutoFill?: boolean;
    };
}

export const CalendarPostCard: React.FC<CalendarPostCardProps> = ({ post }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: post.id,
        data: post
    });

    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50,
    } : undefined;

    const Icon = post.format === "video" ? Video : post.format === "carousel" ? Images : post.format === "ad" ? Megaphone : LayoutTemplate;

    const statusColors = {
        TASLAK: "border-slate-700 bg-slate-800/50 text-slate-400",
        BEKLEYEN_ONAY: "border-amber-500/30 bg-amber-500/10 text-amber-400",
        ONAYLANDI: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
        YAYINLANDI: "border-violet-500/30 bg-violet-500/10 text-violet-400",
        HATA: "border-rose-500/30 bg-rose-500/10 text-rose-400",
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={cn(
                "group relative mt-2 p-3 rounded-2xl border transition-all duration-300 cursor-grab active:cursor-grabbing hover:scale-[1.02] active:scale-95",
                statusColors[post.status],
                isDragging ? "opacity-30 scale-95 shadow-none" : "shadow-lg shadow-black/20",
                post.isAutoFill && "ring-1 ring-fuchsia-500/50"
            )}
        >
            {/* Glossy Overlay */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

            <div className="flex flex-col gap-2 relative z-10">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className={cn(
                            "p-1.5 rounded-lg bg-black/20 border border-white/5",
                            isDragging && "opacity-50"
                        )}>
                            <Icon className="w-3.5 h-3.5" />
                        </div>
                        <h4 className="text-[11px] font-bold truncate leading-tight tracking-tight">
                            {post.title || "Adsız İçerik"}
                        </h4>
                    </div>
                    {post.isAutoFill && (
                        <div className="flex-shrink-0">
                            <Sparkles className="w-3 h-3 text-fuchsia-400 animate-pulse" />
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between mt-1 pt-2 border-t border-white/5">
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold opacity-70">
                        <Clock className="w-3 h-3" />
                        {mounted
                            ? new Date(post.scheduledDate).toLocaleTimeString("tr-TR", { hour: '2-digit', minute: '2-digit' })
                            : "--:--"
                        }
                    </div>

                    <div className="flex items-center gap-1">
                        {post.status === "ONAYLANDI" ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        ) : post.status === "TASLAK" ? (
                            <Clock3 className="w-3 h-3 text-slate-500" />
                        ) : null}
                    </div>
                </div>
            </div>

            {/* Selection/Action hint on hover */}
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-violet-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity scale-0 group-hover:scale-100 duration-300 shadow-lg shadow-violet-600/40">
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
            </div>
        </div>
    );
};
