import React from "react";
import { Instagram, Linkedin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Platform } from "@/types/studio";

interface PlatformSelectorProps {
    selectedPlatform: Platform;
    onSelect: (platform: Platform) => void;
}

export const PlatformSelector: React.FC<PlatformSelectorProps> = ({ selectedPlatform, onSelect }) => {
    const platforms = [
        { id: "instagram" as const, label: "Instagram", icon: Instagram, color: "text-slate-500 hover:text-fuchsia-500", bgActive: "bg-fuchsia-500/20 border-fuchsia-500 text-white" },
        { id: "linkedin" as const, label: "LinkedIn", icon: Linkedin, color: "text-slate-500 hover:text-blue-500", bgActive: "bg-blue-500/20 border-blue-500 text-white" },
        { id: "tiktok" as const, label: "TikTok", icon: null, customIcon: true, color: "text-slate-500 hover:text-slate-300", bgActive: "bg-slate-700/50 border-white text-white" },
    ];

    return (
        <div>
            <label className="text-sm font-medium text-slate-300 mb-3 block">1. Hedef Platformu Seçin</label>
            <div className="flex gap-3">
                {platforms.map((p) => (
                    <button
                        key={p.id}
                        onClick={() => onSelect(p.id)}
                        className={cn(
                            "flex flex-1 items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-200",
                            selectedPlatform === p.id
                                ? p.bgActive
                                : "bg-slate-800/50 border-white/5 text-slate-400 hover:bg-slate-800 hover:border-white/10"
                        )}
                    >
                        {p.customIcon ? (
                            <svg className={cn("w-5 h-5", selectedPlatform === p.id ? "text-white" : p.color)} viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.89 2.89 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                            </svg>
                        ) : p.icon && (
                            <p.icon className={cn("w-5 h-5", selectedPlatform === p.id ? "text-white" : p.color)} />
                        )}
                        <span className="text-sm font-medium">{p.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};
