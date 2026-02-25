"use client";

import React from "react";
import { Users, Heart, Activity, Share2, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";

interface StatProps {
    title: string;
    value: number | string;
    trend: number;
    icon: any;
    color: "violet" | "teal" | "blue" | "rose";
}

const statCardVariants = cva(
    "relative group p-6 rounded-2xl border bg-gradient-to-br transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1",
    {
        variants: {
            color: {
                violet: "from-violet-500/20 to-purple-500/5 text-violet-400 border-violet-500/20 shadow-violet-500/10",
                teal: "from-teal-500/20 to-emerald-500/5 text-teal-400 border-teal-500/20 shadow-teal-500/10",
                blue: "from-blue-500/20 to-indigo-500/5 text-blue-400 border-blue-500/20 shadow-blue-500/10",
                rose: "from-rose-500/20 to-pink-500/5 text-rose-400 border-rose-500/20 shadow-rose-500/10",
            },
        },
        defaultVariants: {
            color: "violet",
        },
    }
);

export const DashboardStats: React.FC<{ stats: StatProps[] }> = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
                <div
                    key={stat.title}
                    className={statCardVariants({ color: stat.color })}
                    style={{ animationDelay: `${i * 100}ms` }}
                >
                    <div className="flex items-start justify-between">
                        <div className="p-3 rounded-xl bg-black/20 border border-white/5">
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div className={cn(
                            "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-black/20",
                            stat.trend > 0 ? "text-emerald-400" : "text-rose-400"
                        )}>
                            {stat.trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {Math.abs(stat.trend)}%
                        </div>
                    </div>

                    <div className="mt-4">
                        <h4 className="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors">
                            {stat.title}
                        </h4>
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-3xl font-bold tracking-tight text-white group-hover:scale-105 transition-transform origin-left">
                                {typeof stat.value === 'number' ? stat.value.toLocaleString("tr-TR") : stat.value}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
