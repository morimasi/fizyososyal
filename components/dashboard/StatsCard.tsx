import { Card, CardContent } from "@/components/ui/Card";
import { cn, formatNumber } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
    title: string;
    value: number | string;
    icon: LucideIcon;
    trend?: number;
    color?: "violet" | "teal" | "rose" | "blue";
}

const colorMap = {
    violet: "from-violet-500 to-indigo-600 shadow-violet-500/25",
    teal: "from-teal-400 to-emerald-500 shadow-teal-500/25",
    rose: "from-rose-400 to-red-500 shadow-rose-500/25",
    blue: "from-blue-400 to-cyan-500 shadow-blue-500/25",
};

export function StatsCard({ title, value, icon: Icon, trend, color = "violet" }: StatsCardProps) {
    return (
        <Card className="relative overflow-hidden group">
            <div
                className={cn(
                    "absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:opacity-20 transition-opacity duration-500",
                    colorMap[color]
                )}
            />
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium text-slate-400">{title}</p>
                    <div
                        className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-lg",
                            colorMap[color]
                        )}
                    >
                        <Icon className="w-5 h-5 text-white" />
                    </div>
                </div>
                <div className="flex items-end justify-between">
                    <h4 className="text-3xl font-bold text-white tracking-tight">
                        {typeof value === "number" ? formatNumber(value) : value}
                    </h4>
                    {trend !== undefined && (
                        <div
                            className={cn(
                                "flex items-center text-sm font-medium px-2 py-1 rounded-md",
                                trend >= 0 ? "text-emerald-400 bg-emerald-500/10" : "text-rose-400 bg-rose-500/10"
                            )}
                        >
                            {trend >= 0 ? "+" : ""}
                            {trend}%
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
