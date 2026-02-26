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
} from "date-fns";
import { DragEndEvent } from "@dnd-kit/core";
import { CalendarHeader } from "@/components/calendar/CalendarHeader";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { PostStatus } from "@prisma/client";
import { Loader2 } from "lucide-react";

interface CalendarPost {
    id: string;
    title: string;
    scheduledDate: Date;
    status: PostStatus;
    format: "post" | "carousel" | "video" | "ad";
    isAutoFill?: boolean;
}

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [posts, setPosts] = useState<CalendarPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAutoFilling, setIsAutoFilling] = useState(false);

    // Gerçek API'den ay'a göre postları çek
    const fetchPosts = useCallback(async (date: Date) => {
        setLoading(true);
        try {
            const month = date.getMonth() + 1;
            const year = date.getFullYear();
            const res = await fetch(`/api/posts?month=${month}&year=${year}`);
            if (!res.ok) throw new Error("Post yüklenemedi");
            const data = await res.json();
            const mapped = data.posts.map((p: any) => ({
                id: p.id,
                title: p.title || "Adsız İçerik",
                scheduledDate: new Date(p.scheduledDate || p.createdAt),
                status: p.status,
                format: (p.trendTopic === "video" ? "video" : p.trendTopic === "carousel" ? "carousel" : p.trendTopic === "ad" ? "ad" : "post") as CalendarPost["format"],
            }));
            setPosts(mapped);
        } catch (err) {
            console.error("[CALENDAR] Post yükleme hatası:", err);
            setPosts([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPosts(currentDate);
    }, [currentDate, fetchPosts]);

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startOffset = (getDay(monthStart) + 6) % 7;
    const startDate = new Date(monthStart);
    startDate.setDate(startDate.getDate() - startOffset);
    const endOffset = (7 - getDay(monthEnd)) % 7;
    const endDate = new Date(monthEnd);
    endDate.setDate(endDate.getDate() + endOffset);
    const dateInterval = eachDayOfInterval({ start: startDate, end: endDate });

    const handlePrevMonth = useCallback(() => setCurrentDate(prev => subMonths(prev, 1)), []);
    const handleNextMonth = useCallback(() => setCurrentDate(prev => addMonths(prev, 1)), []);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;
        const postId = active.id as string;
        const newDate = new Date(over.id as string);
        setPosts(prev => prev.map(post => {
            if (post.id === postId) {
                const updated = new Date(newDate);
                updated.setHours(post.scheduledDate.getHours());
                updated.setMinutes(post.scheduledDate.getMinutes());
                // Optimistic update + gerçek API çağrısı
                fetch(`/api/posts/${postId}/schedule`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ scheduledDate: updated.toISOString() }),
                }).catch(console.error);
                return { ...post, scheduledDate: updated };
            }
            return post;
        }));
    };

    const handleAutoFill = async () => {
        setIsAutoFilling(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        const aiPosts: CalendarPost[] = [];
        const daysToFill = [1, 3, 5];
        const topicsByDay: Record<number, string> = {
            1: "Haftalık Isınma (AI)",
            3: "Kamburluk Gideren Hareketler (AI)",
            5: "Egzersiz Rutini (AI)",
        };

        dateInterval.forEach(date => {
            if (date.getMonth() !== currentDate.getMonth()) return;
            const dayOfWeek = getDay(date);
            const corrected = dayOfWeek === 0 ? 7 : dayOfWeek;
            if (daysToFill.includes(corrected)) {
                const hasPost = posts.some(p => isSameDay(new Date(p.scheduledDate), date));
                if (!hasPost) {
                    aiPosts.push({
                        id: `ai-${date.getTime()}`,
                        title: topicsByDay[corrected] || "AI İçerik",
                        scheduledDate: new Date(new Date(date).setHours(18, 0)),
                        status: "TASLAK" as PostStatus,
                        format: corrected === 3 ? "carousel" : "video",
                        isAutoFill: true,
                    });
                }
            }
        });

        setPosts(prev => [...prev, ...aiPosts]);
        setIsAutoFilling(false);
    };

    const handlePublishPost = async (postId: string) => {
        try {
            const res = await fetch(`/api/posts/${postId}/publish`, { method: "POST" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            alert(data.message);
            setPosts(prev => prev.map(p => p.id === postId ? { ...p, status: "YAYINLANDI" as PostStatus } : p));
        } catch (err: any) {
            alert(`Yayınlama hatası: ${err.message}`);
        }
    };

    const handleDeletePost = async (postId: string) => {
        if (!confirm("Bu postu silmek istediğinize emin misiniz?")) return;
        try {
            const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Silme hatası");
            setPosts(prev => prev.filter(p => p.id !== postId));
        } catch (err: any) {
            alert(`Silme hatası: ${err.message}`);
        }
    };

    return (
        <div className="min-h-screen pb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <CalendarHeader
                currentDate={currentDate}
                onPrevMonth={handlePrevMonth}
                onNextMonth={handleNextMonth}
                onAutoFill={handleAutoFill}
                isAutoFilling={isAutoFilling}
                onNewPost={() => window.location.href = "/dashboard/studio"}
            />

            {loading ? (
                <div className="flex items-center justify-center h-[600px]">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-10 h-10 text-violet-400 animate-spin" />
                        <p className="text-slate-400 text-sm font-medium">Takvim yükleniyor...</p>
                    </div>
                </div>
            ) : (
                <CalendarGrid
                    dateInterval={dateInterval}
                    posts={posts}
                    currentDate={currentDate}
                    onDragEnd={handleDragEnd}
                    onPublishPost={handlePublishPost}
                    onDeletePost={handleDeletePost}
                />
            )}

            {/* AI Insight Footer */}
            <div className="mt-8 flex items-center justify-center">
                <div className="px-6 py-3 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-violet-500 animate-ping" />
                    <p className="text-xs font-bold text-violet-300 uppercase tracking-widest">
                        {posts.length > 0
                            ? `Bu ay ${posts.length} içerik planlandı`
                            : "AI Sistem Aktif: En uygun paylaşım saatleri hesaplanıyor..."}
                    </p>
                </div>
            </div>
        </div>
    );
}
