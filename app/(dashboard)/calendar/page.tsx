"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useState } from "react";

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());

    // Basit takvim mantığı (mock)
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const monthName = currentDate.toLocaleString("tr-TR", { month: "long" });

    const prevMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
    const nextMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent flex items-center gap-3">
                        İçerik Takvimi
                    </h1>
                    <p className="text-slate-400 mt-2">Planlanmış gönderilerinizi yönetin (Drag & Drop)</p>
                </div>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Yeni Post Planla
                </Button>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-4">
                    <CardTitle className="text-xl">
                        {monthName} {currentDate.getFullYear()}
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
                    <div className="grid grid-cols-7 border-b border-white/5 bg-white/5">
                        {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map((day) => (
                            <div key={day} className="p-4 text-center text-sm font-medium text-slate-400">
                                {day}
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 bg-slate-900/50 min-h-[600px]">
                        {/* Boş günler */}
                        {Array.from({ length: firstDay === 0 ? 6 : firstDay - 1 }).map((_, i) => (
                            <div key={`empty-${i}`} className="border-r border-b border-white/5 p-2 bg-slate-900/30" />
                        ))}
                        {/* Gerçek günler */}
                        {Array.from({ length: daysInMonth }).map((_, i) => (
                            <div
                                key={i + 1}
                                className="border-r border-b border-white/5 p-2 min-h-[120px] hover:bg-white/5 transition-colors group relative"
                            >
                                <span className="text-sm font-medium text-slate-500 group-hover:text-white transition-colors">
                                    {i + 1}
                                </span>

                                {/* Mock Post */}
                                {i === 14 && (
                                    <div className="mt-2 text-xs p-2 rounded bg-violet-500/20 text-violet-200 border border-violet-500/30 cursor-grab active:cursor-grabbing">
                                        <div className="font-semibold mb-1 truncate">Ofis Egzersizleri</div>
                                        <div className="text-violet-400/80">18:00 (Oto)</div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
