"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    addMonths,
    subMonths,
    getDay,
    isSameDay,
    addDays
} from "date-fns";
import { DragEndEvent } from "@dnd-kit/core";
import { CalendarHeader } from "@/components/calendar/CalendarHeader";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { PostStatus } from "@prisma/client";

// Mock data generator for professional look - Real integration would use an effect or server action
const generateInitialPosts = (date: Date) => {
    const month = date.getMonth();
    const year = date.getFullYear();

    return [
        {
            id: "1",
            title: "Diz Kireçlenmesi İçin 5 Egzersiz",
            scheduledDate: new Date(year, month, 12, 18, 30),
            status: "ONAYLANDI" as PostStatus,
            format: "video" as const,
        },
        {
            id: "2",
            title: "Bel Gevşetme Hareketleri",
            scheduledDate: new Date(year, month, 15, 0, 0),
            status: "TASLAK" as PostStatus,
            format: "carousel" as const,
        },
        {
            id: "3",
            title: "Haftalık Motivasyon",
            scheduledDate: new Date(year, month, 18, 9, 15),
            status: "YAYINLANDI" as PostStatus,
            format: "post" as const,
        }
    ];
};

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isAutoFilling, setIsAutoFilling] = useState(false);

    // Initial data load - In a real app this would be a server component or an API call
    useEffect(() => {
        setPosts(generateInitialPosts(currentDate));
    }, []);

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);

    // Adjust to start from Monday
    const startOffset = (getDay(monthStart) + 6) % 7;
    const startDate = new Date(monthStart);
    startDate.setDate(startDate.getDate() - startOffset);

    const endOffset = (7 - getDay(monthEnd)) % 7;
    const endDate = new Date(monthEnd);
    endDate.setDate(endDate.getDate() + endOffset);

    const dateInterval = eachDayOfInterval({ start: startDate, end: endDate });

    const handlePrevMonth = useCallback(() => setCurrentDate(subMonths(currentDate, 1)), []);
    const handleNextMonth = useCallback(() => setCurrentDate(addMonths(currentDate, 1)), []);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const postId = active.id as string;
        const newDateStr = over.id as string;
        const newDate = new Date(newDateStr);

        setPosts(prev => prev.map(post => {
            if (post.id === postId) {
                // Keep the time but change the date
                const updatedDate = new Date(newDate);
                const originalDate = new Date(post.scheduledDate);
                updatedDate.setHours(originalDate.getHours());
                updatedDate.setMinutes(originalDate.getMinutes());
                return { ...post, scheduledDate: updatedDate };
            }
            return post;
        }));
    };

    const handleAutoFill = async () => {
        setIsAutoFilling(true);
        // Simulate AI analysis and generation
        await new Promise(resolve => setTimeout(resolve, 2000));

        const aiPosts: any[] = [];
        const daysToFill = [1, 3, 5]; // Mon, Wed, Fri

        dateInterval.forEach(date => {
            if (date.getMonth() !== currentDate.getMonth()) return;

            const dayOfWeek = getDay(date); // 1 = Mon, 3 = Wed, 5 = Fri (considering JS Sun-Sat)
            // Fix day of week index for date-fns tr locale if needed, but standard getDay is fine
            if (daysToFill.includes(dayOfWeek === 0 ? 7 : dayOfWeek)) {
                const hasPost = posts.some(p => isSameDay(new Date(p.scheduledDate), date));
                if (!hasPost) {
                    aiPosts.push({
                        id: `ai-${date.getTime()}`,
                        title: dayOfWeek === 1 ? "Haftalık Isınma (AI)" : dayOfWeek === 3 ? "Kamburluk Gideren Hareketler (AI)" : "Egzersiz Rutini (AI)",
                        scheduledDate: new Date(date.setHours(18, 0)),
                        status: "TASLAK" as PostStatus,
                        format: dayOfWeek === 3 ? "carousel" : "video",
                        isAutoFill: true
                    });
                }
            }
        });

        setPosts(prev => [...prev, ...aiPosts]);
        setIsAutoFilling(false);
    };

    const handleNewPost = () => {
        console.log("New post modal triggered");
    };

    return (
        <div className="min-h-screen pb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <CalendarHeader
                currentDate={currentDate}
                onPrevMonth={handlePrevMonth}
                onNextMonth={handleNextMonth}
                onAutoFill={handleAutoFill}
                isAutoFilling={isAutoFilling}
                onNewPost={handleNewPost}
            />

            <CalendarGrid
                dateInterval={dateInterval}
                posts={posts}
                currentDate={currentDate}
                onDragEnd={handleDragEnd}
            />

            {/* AI Insight Footer */}
            <div className="mt-8 flex items-center justify-center">
                <div className="px-6 py-3 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-violet-500 animate-ping" />
                    <p className="text-xs font-bold text-violet-300 uppercase tracking-widest">
                        AI Sistem Aktif: En uygun paylaşım saatleri hesaplanıyor...
                    </p>
                </div>
            </div>
        </div>
    );
}
