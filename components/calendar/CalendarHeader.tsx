"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import {
    ChevronLeft,
    ChevronRight,
    Wand2,
    Plus,
    Calendar as CalendarIcon,
    Sparkles,
    Filter
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarHeaderProps {
    currentDate: Date;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    onAutoFill: () => void;
    isAutoFilling: boolean;
    onNewPost: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
    currentDate,
    onPrevMonth,
    onNextMonth,
    onAutoFill,
    isAutoFilling,
    onNewPost,
}) => {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 p-6 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/5 blur-[100px] -z-10" />

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/10 border border-violet-500/20 flex items-center justify-center shadow-inner">
                        <CalendarIcon className="w-7 h-7 text-violet-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black bg-gradient-to-r from-white via-slate-200 to-slate-500 bg-clip-text text-transparent tracking-tighter">
                            İçerik Takvimi
                        </h1>
                        <p className="text-sm text-slate-400 font-medium flex items-center gap-2">
                            <Sparkles className="w-3 h-3 text-fuchsia-400" />
                            AI Destekli Akıllı Planlama
                        </p>
                    </div>
                </div>

                <div className="h-10 w-px bg-white/10 hidden lg:block" />

                <div className="flex items-center gap-2 bg-black/20 p-1.5 rounded-2xl border border-white/5">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onPrevMonth}
                        className="h-9 w-9 p-0 rounded-xl hover:bg-white/10"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <div className="px-4 min-w-[140px] text-center">
                        <span className="text-sm font-bold text-white uppercase tracking-widest">
                            {mounted ? format(currentDate, "MMMM yyyy", { locale: tr }) : "..."}
                        </span>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onNextMonth}
                        className="h-9 w-9 p-0 rounded-xl hover:bg-white/10"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <Button variant="ghost" size="md" className="rounded-xl border border-white/5 hover:bg-white/5 text-slate-400">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtrele
                </Button>

                <Button
                    variant="secondary"
                    onClick={onAutoFill}
                    isLoading={isAutoFilling}
                    className="rounded-xl bg-fuchsia-600/20 text-fuchsia-300 hover:bg-fuchsia-600/30 border border-fuchsia-500/30 shadow-fuchsia-600/10 transition-all duration-300 group/ai"
                >
                    <Wand2 className="w-4 h-4 mr-2 group-hover/ai:rotate-12 transition-transform" />
                    AI Planlayıcı
                </Button>

                <Button
                    variant="primary"
                    onClick={onNewPost}
                    className="rounded-xl shadow-violet-600/20 hover:scale-105 active:scale-95 transition-all"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Yeni İçerik
                </Button>
            </div>
        </div>
    );
};
