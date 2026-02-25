"use client";

import React from "react";
import { DndContext, DragEndEvent, DragOverlay, useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import { CalendarDay } from "./CalendarDay";
import { isSameDay } from "date-fns";

interface CalendarGridProps {
    dateInterval: Date[];
    posts: any[];
    currentDate: Date;
    onDragEnd: (event: DragEndEvent) => void;
    onDayClick?: (date: Date) => void;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
    dateInterval,
    posts,
    currentDate,
    onDragEnd,
    onDayClick
}) => {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const weekDays = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

    return (
        <DndContext onDragEnd={onDragEnd} sensors={sensors}>
            <div className="rounded-[2.5rem] border border-white/10 bg-slate-900/40 backdrop-blur-3xl overflow-hidden shadow-2xl relative">
                {/* Grid Background Glow */}
                <div className="absolute -top-[500px] -left-[500px] w-[1000px] h-[1000px] bg-violet-600/5 blur-[120px] pointer-events-none" />

                {/* Header */}
                <div className="grid grid-cols-7 border-b border-white/10 bg-white/[0.02]">
                    {weekDays.map((day) => (
                        <div key={day} className="py-4 text-center">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                                {day}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Days */}
                <div className="grid grid-cols-7 bg-transparent relative">
                    {dateInterval.map((date) => {
                        const dayPosts = posts.filter(p => isSameDay(new Date(p.scheduledDate), date));
                        return (
                            <CalendarDay
                                key={date.toISOString()}
                                date={date}
                                posts={dayPosts}
                                isCurrentMonth={date.getMonth() === currentDate.getMonth()}
                                onDayClick={onDayClick}
                            />
                        );
                    })}
                </div>
            </div>

            {/* Drag Overlay for smoother experience could be added here */}
        </DndContext>
    );
};
