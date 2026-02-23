"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ChevronLeft, ChevronRight, Plus, Wand2, Sparkles, LayoutTemplate, Images, Video, Megaphone } from "lucide-react";
import { DndContext, useDraggable, useDroppable, DragEndEvent } from "@dnd-kit/core";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, getDay } from "date-fns";
import { tr } from "date-fns/locale";
import { cn } from "@/lib/utils";

type Post = {
    id: string;
    title: string;
    date: Date;
    time: string;
    isAutoFill?: boolean;
    format: "post" | "carousel" | "video" | "ad";
};

function DraggablePost({ post }: { post: Post }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: post.id,
        data: post
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50,
    } : undefined;

    const Icon = post.format === "video" ? Video : post.format === "carousel" ? Images : post.format === "ad" ? Megaphone : LayoutTemplate;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={cn(
                "mt-2 text-xs p-2 rounded border cursor-grab active:cursor-grabbing shadow-sm",
                post.isAutoFill
                    ? "bg-fuchsia-500/20 text-fuchsia-200 border-fuchsia-500/30 shadow-fuchsia-900/20"
                    : "bg-violet-500/20 text-violet-200 border-violet-500/30"
            )}
        >
            <div className="flex items-center gap-1.5 mb-1">
                <Icon className="w-3 h-3" />
                <div className="font-semibold truncate">{post.title}</div>
            </div>
            <div className="flex items-center justify-between text-opacity-80">
                <span>{post.time}</span>
                {post.isAutoFill && <Sparkles className="w-3 h-3 text-fuchsia-400" />}
            </div>
        </div>
    );
}

function DroppableDay({ date, posts, isCurrentMonth }: { date: Date; posts: Post[], isCurrentMonth: boolean }) {
    const { isOver, setNodeRef } = useDroppable({
        id: date.toISOString(),
        data: { date }
    });

    // Best time to post mock logic: Tuesdays and Thursdays have fire icon
    const dayOfWeek = getDay(date);
    const isBestTime = dayOfWeek === 2 || dayOfWeek === 4;

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "border-r border-b border-white/5 p-2 min-h-[120px] transition-colors relative",
                !isCurrentMonth && "bg-slate-900/30 opacity-50",
                isOver && "bg-violet-500/10",
                isCurrentMonth && !isOver && "hover:bg-white/5"
            )}
        >
            <div className="flex justify-between items-start mb-1">
                <span className={cn(
                    "text-sm font-medium transition-colors",
                    isCurrentMonth ? "text-slate-400 hover:text-white" : "text-slate-600"
                )}>
                    {format(date, "d")}
                </span>
                {isCurrentMonth && isBestTime && (
                    <span title="En iyi paylaşım saati: 18:30" className="text-rose-400">
                        🔥
                    </span>
                )}
            </div>
            <div className="flex flex-col gap-1">
                {posts.map(post => (
                    <DraggablePost key={post.id} post={post} />
                ))}
            </div>
        </div>
    );
}

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [posts, setPosts] = useState<Post[]>([]);
    const [isAutoFilling, setIsAutoFilling] = useState(false);

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

    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) return;

        const postId = active.id as string;
        const newDateStr = over.id as string;
        const newDate = new Date(newDateStr);

        setPosts(currentPosts =>
            currentPosts.map(post =>
                post.id === postId
                    ? { ...post, date: newDate }
                    : post
            )
        );
    };

    const handleAutoFill = () => {
        setIsAutoFilling(true);
        setTimeout(() => {
            const newPosts: Post[] = [];
            // Pazartesi, Çarşamba, Cuma (1, 3, 5) boşsa doldur
            dateInterval.forEach(date => {
                if (!isSameMonth(date, currentDate)) return;
                const d = getDay(date);
                if (d === 1 || d === 3 || d === 5) {
                    const hasPost = posts.some(p => isSameDay(p.date, date));
                    if (!hasPost) {
                        newPosts.push({
                            id: `auto-${date.getTime()}`,
                            title: d === 1 ? "Motivasyon (AI)" : d === 3 ? "Bilgi Slaytı (AI)" : "Egzersiz (AI)",
                            date: date,
                            time: "18:00",
                            isAutoFill: true,
                            format: d === 3 ? "carousel" : "post"
                        });
                    }
                }
            });
            setPosts(prev => [...prev, ...newPosts]);
            setIsAutoFilling(false);
        }, 1500);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent flex items-center gap-3">
                        Akıllı İçerik Takvimi
                    </h1>
                    <p className="text-slate-400 mt-2">Sürükle bırak ile yönetin, AI ile takvimdeki boşlukları tek tuşla doldurun.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="secondary" onClick={handleAutoFill} isLoading={isAutoFilling} className="bg-fuchsia-600/20 text-fuchsia-300 hover:bg-fuchsia-600/30 border border-fuchsia-500/30">
                        <Wand2 className="w-4 h-4 mr-2" />
                        AI ile Boşlukları Doldur
                    </Button>
                    <Button variant="primary">
                        <Plus className="w-4 h-4 mr-2" />
                        Yeni Planla
                    </Button>
                </div>
            </div>

            <Card className="border-white/5 bg-slate-900/50 backdrop-blur">
                <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-4">
                    <CardTitle className="text-xl capitalize">
                        {format(currentDate, "MMMM yyyy", { locale: tr })}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={prevMonth}>
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={nextMonth}>
                            <ChevronRight className="w-5 h-5" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="grid grid-cols-7 border-b border-white/5 bg-slate-800/50">
                        {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map((day) => (
                            <div key={day} className="p-3 text-center text-xs font-semibold text-slate-400">
                                {day}
                            </div>
                        ))}
                    </div>

                    <DndContext onDragEnd={handleDragEnd}>
                        <div className="grid grid-cols-7 min-h-[600px] bg-slate-950/50">
                            {dateInterval.map((date) => {
                                const dayPosts = posts.filter(p => isSameDay(p.date, date));
                                return (
                                    <DroppableDay
                                        key={date.toISOString()}
                                        date={date}
                                        posts={dayPosts}
                                        isCurrentMonth={isSameMonth(date, currentDate)}
                                    />
                                );
                            })}
                        </div>
                    </DndContext>
                </CardContent>
            </Card>
        </div>
    );
}
