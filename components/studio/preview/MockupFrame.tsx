import React from "react";
import { cn } from "@/lib/utils";

interface MockupFrameProps {
    children: React.ReactNode;
    className?: string;
    platform?: "instagram" | "linkedin" | "tiktok";
    isDarkMode?: boolean;
}

export const MockupFrame: React.FC<MockupFrameProps> = ({
    children,
    className,
    platform = "instagram",
    isDarkMode = true
}) => {
    return (
        <div className={cn("relative mx-auto transition-all duration-500", className)}>
            {/* Premium Phone Shell */}
            <div className={cn(
                "relative mx-auto border-[8px] rounded-[2.5rem] overflow-hidden shadow-2xl",
                "border-slate-800 bg-black",
                platform === "tiktok" ? "h-[600px] w-[300px]" : "w-[320px]"
            )}>
                {/* Notch / Dynamic Island Simulation */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-b-2xl z-50 flex items-center justify-center">
                    <div className="w-8 h-1 bg-white/10 rounded-full" />
                </div>

                {/* Content Area */}
                <div className={cn(
                    "h-full w-full overflow-hidden relative pt-6",
                    isDarkMode ? "bg-black text-white" : "bg-white text-slate-900"
                )}>
                    {children}
                </div>

                {/* Home Indicator */}
                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-24 h-1 bg-white/20 rounded-full z-50" />
            </div>

            {/* Glossy Overlay */}
            <div className="absolute inset-0 rounded-[2.5rem] pointer-events-none border border-white/5 opacity-50" />
        </div>
    );
};
