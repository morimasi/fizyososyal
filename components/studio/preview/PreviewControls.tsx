import React from "react";
import { Moon, Sun, ZoomIn, ZoomOut, Maximize2, Monitor, Layout, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface PreviewControlsProps {
    isDarkMode: boolean;
    setIsDarkMode: (val: boolean) => void;
    zoom: number;
    setZoom: (val: number) => void;
    showUI: boolean;
    setShowUI: (val: boolean) => void;
}

export const PreviewControls: React.FC<PreviewControlsProps> = ({
    isDarkMode,
    setIsDarkMode,
    zoom,
    setZoom,
    showUI,
    setShowUI
}) => {
    return (
        <div className="flex flex-wrap items-center gap-4 p-2 bg-slate-900/40 border border-white/5 rounded-2xl backdrop-blur-md">
            {/* Theme Toggle */}
            <div className="flex items-center gap-1 p-1 bg-black/40 rounded-xl border border-white/5">
                <button
                    onClick={() => setIsDarkMode(false)}
                    className={cn(
                        "p-2 rounded-lg transition-all",
                        !isDarkMode ? "bg-white text-black shadow-lg" : "text-slate-500 hover:text-white"
                    )}
                    title="Light Mode Preview"
                >
                    <Sun className="w-4 h-4" />
                </button>
                <button
                    onClick={() => setIsDarkMode(true)}
                    className={cn(
                        "p-2 rounded-lg transition-all",
                        isDarkMode ? "bg-violet-600 text-white shadow-lg" : "text-slate-500 hover:text-white"
                    )}
                    title="Dark Mode Preview"
                >
                    <Moon className="w-4 h-4" />
                </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-3 px-3 py-1.5 bg-black/40 rounded-xl border border-white/5">
                <button
                    onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                    className="text-slate-400 hover:text-white transition-colors"
                >
                    <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-[10px] font-bold text-slate-500 w-8 text-center">{Math.round(zoom * 100)}%</span>
                <button
                    onClick={() => setZoom(Math.min(1.5, zoom + 0.1))}
                    className="text-slate-400 hover:text-white transition-colors"
                >
                    <ZoomIn className="w-4 h-4" />
                </button>
            </div>

            {/* Visual Toggles */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setShowUI(!showUI)}
                    className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all text-xs font-bold",
                        showUI ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" : "bg-black/40 border-white/5 text-slate-500"
                    )}
                >
                    {showUI ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    <span>{showUI ? "UI Aktif" : "Sadece Görsel"}</span>
                </button>

                <button className="p-2 bg-black/40 border border-white/5 rounded-xl text-slate-500 hover:text-white transition-colors">
                    <Maximize2 className="w-4 h-4" />
                </button>
            </div>

            <div className="ml-auto hidden md:flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                <Monitor className="w-3 h-3" />
                Live Simulator 2.0
            </div>
        </div>
    );
};
