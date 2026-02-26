"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Wand2,
    CalendarDays,
    BarChart3,
    Settings,
    LogOut,
    Activity,
    FileText,
} from "lucide-react";

const navItems = [
    { name: "Genel Bakış", href: "/dashboard", icon: LayoutDashboard },
    { name: "AI Stüdyo", href: "/dashboard/studio", icon: Wand2 },
    { name: "Postlarım", href: "/dashboard/posts", icon: FileText },
    { name: "İçerik Takvimi", href: "/dashboard/calendar", icon: CalendarDays },
    { name: "Analitik", href: "/dashboard/analytics", icon: BarChart3 },
    { name: "Ayarlar", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed inset-y-0 left-0 w-64 bg-slate-900/50 backdrop-blur-xl border-r border-white/10 flex flex-col z-50">
            <div className="h-16 flex items-center px-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                        <Activity className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                        PhysioSocial AI
                    </span>
                </div>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                                isActive
                                    ? "text-white bg-white/10 shadow-sm"
                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-violet-500 rounded-r-full shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
                            )}
                            <item.icon
                                className={cn(
                                    "w-5 h-5 transition-colors duration-200",
                                    isActive ? "text-violet-400" : "text-slate-500 group-hover:text-slate-300"
                                )}
                            />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-white/10">
                <form action="/api/auth/signout" method="POST">
                    <button
                        type="submit"
                        className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors duration-200 group"
                    >
                        <LogOut className="w-5 h-5 text-slate-500 group-hover:text-red-400 transition-colors duration-200" />
                        Çıkış Yap
                    </button>
                </form>
            </div>
        </aside>
    );
}
