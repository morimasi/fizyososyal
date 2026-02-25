"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { format, isSameMonth, isToday, getDay } from "date-fns";
import { tr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { CalendarPostCard } from "./CalendarPostCard";
import { Sparkles, Plus } from "lucide-react";

interface CalendarDayProps {
    date: Date;
    posts: any[];
    isCurrentMonth: boolean;
    onDayClick?: (date: Date) => void;
}

export const CalendarDay: React.FC<CalendarDayProps> = ({
    date,
    posts,
    isCurrentMonth,
    onDayClick
}) => {
    const { isOver, setNodeRef } = useDroppable({
        id: date.toISOString(),
        data: { date }
    });

    const dayOfWeek = getDay(date);
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isBestTime = dayOfWeek === 2 || dayOfWeek === 4; // Tuesdays & Thursdays logic

    return (
        <div
            ref={setNodeRef}
            onClick={() => onDayClick?.(date)}
            className={cn(
                "group relative border-r border-b border-white/5 min-h-[160px] p-3 transition-all duration-500",
                !isCurrentMonth ? "bg-black/20 opacity-30" : "bg-transparent",
                isOver ? "bg-violet-600/10" : "hover:bg-white/[0.02]",
                isToday(date) && "bg-violet-600/5"
            )}
        >
            <div className="flex justify-between items-start mb-3">
                <div className="flex flex-col items-center">
                    <span className={cn(
                        "text-lg font-black transition-all duration-300",
                        isToday(date) ? "text-violet-400 scale-125" : isCurrentMonth ? "text-slate-400 group-hover:text-white" : "text-slate-700"
                    )}>
                        {format(date, "d")}
                    </span>
                    {isToday(date) && (
                        <div className="w-1 h-1 rounded-full bg-violet-500 mt-1 shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
                    )}
                </div>

                <div className="flex items-center gap-1">
                    {isCurrentMonth && isBestTime && (
                        <div
                            title="Yüksek Erişim Potansiyeli"
                            className="p-1 rounded-md bg-rose-500/10 border border-rose-500/20 animate-pulse"
                        >
                            <Sparkles className="w-3 h-3 text-rose-400" />
                        </div>
                    )}
                    <button className="opacity-0 group-hover:opacity-100 p-1 rounded-md bg-white/5 text-slate-500 hover:text-white transition-all">
                        <Plus className="w-3 h-3" />
                    </button>
                </div>
            </div>

            <div className="space-y-2 relative z-10">
                {posts.map(post => (
                    <CalendarPostCard key={post.id} post={post} />
                ))}
            </div>

            {/* Empty State Hint */}
            {isCurrentMonth && posts.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <span className="text-[10px] uppercase tracking-tighter font-bold text-slate-600">
                        İçerik Planla
                    </span>
                </div>
            )}
        </div>
    );
};
