"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Zap, Activity, ArrowUpRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Trend {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    tag: string;
}

export const AITrendAnalysis: React.FC<{ trends: Trend[] }> = ({ trends }) => {
    return (
        <Card className="border-white/5 bg-slate-900/50 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/20">
                        <Zap className="w-5 h-5 text-teal-400" />
                    </div>
                    <CardTitle className="text-xl">AI Fikir Asistanı</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
                {trends.map((trend, i) => (
                    <div
                        key={trend.id}
                        className={cn(
                            "group p-5 rounded-2xl border transition-all duration-300",
                            i === 0
                                ? "bg-gradient-to-br from-violet-600/10 to-indigo-600/5 border-violet-500/20 hover:border-violet-500/40"
                                : "bg-white/5 border-white/5 hover:border-white/20"
                        )}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className={cn(
                                "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                                i === 0 ? "bg-violet-500/20 text-violet-400" : "bg-slate-800 text-slate-400"
                            )}>
                                {trend.tag}
                            </span>
                            <Link
                                href={`/dashboard/studio?topic=${encodeURIComponent(trend.title)}`}
                                className="p-1.5 rounded-lg bg-white/5 opacity-0 group-hover:opacity-100 transition-all hover:bg-violet-500 hover:text-white"
                            >
                                <Plus className="w-4 h-4" />
                            </Link>
                        </div>

                        <h4 className="font-bold text-white group-hover:text-violet-300 transition-colors flex items-center gap-2">
                            {trend.title}
                            <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0" />
                        </h4>
                        <p className="text-sm text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                            {trend.description}
                        </p>
                    </div>
                ))}

                <button className="w-full py-3 rounded-xl border border-dashed border-white/10 text-slate-500 text-xs font-bold hover:border-violet-500/50 hover:text-violet-400 transition-all mt-2">
                    Yeni Trendleri Analiz Et
                </button>
            </CardContent>
        </Card>
    );
};
