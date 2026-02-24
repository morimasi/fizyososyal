import React, { useState } from "react";
import { Download, Send, Clock, ShieldCheck, CheckCircle2, Loader2, Sparkles, Instagram, Facebook, Rocket } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface PreviewActionsProps {
    platform: string;
    userRole: "ADMIN" | "EDITOR" | "APPROVER";
    onPublish: () => void;
    onDownload: () => void;
    isProcessing?: boolean;
}

export const PreviewActions: React.FC<PreviewActionsProps> = ({
    platform,
    userRole,
    onPublish,
    onDownload,
    isProcessing = false
}) => {
    const [showConfetti, setShowConfetti] = useState(false);

    const getPrimaryAction = () => {
        if (userRole === "EDITOR") {
            return {
                label: "Onaya Gönder",
                icon: ShieldCheck,
                variant: "primary" as const,
                bg: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700",
                desc: "İçerik yöneticilere iletilecek."
            };
        }
        return {
            label: "Şimdi Yayınla",
            icon: Send,
            variant: "primary" as const,
            bg: "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25",
            desc: `İçerik şu an ${platform} üzerinde yayına girecek.`
        };
    };

    const action = getPrimaryAction();

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Secondary Action - Download */}
                <Button
                    variant="secondary"
                    className="h-14 border-white/5 bg-slate-800/50 hover:bg-slate-800 transition-all group"
                    onClick={onDownload}
                    disabled={isProcessing}
                >
                    <div className="flex flex-col items-center justify-center">
                        <div className="flex items-center gap-2 font-bold text-sm">
                            <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                            Kartı İndir (PNG)
                        </div>
                        <span className="text-[10px] opacity-50 font-medium">Sosyal medya formatında</span>
                    </div>
                </Button>

                {/* Schedule Action */}
                <Button
                    variant="secondary"
                    className="h-14 border-white/5 bg-slate-800/50 hover:bg-slate-800 transition-all group"
                >
                    <div className="flex flex-col items-center justify-center">
                        <div className="flex items-center gap-2 font-bold text-sm">
                            <Clock className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            Zamanla
                        </div>
                        <span className="text-[10px] opacity-100 text-emerald-500 font-bold">Bugün 19:00 (Önerilen)</span>
                    </div>
                </Button>
            </div>

            {/* Main Action Button */}
            <div className="relative group">
                <div className={cn(
                    "absolute -inset-1 rounded-2xl blur opacity-25 group-hover:opacity-60 transition duration-1000",
                    userRole === "EDITOR" ? "bg-blue-500" : "bg-violet-500"
                )} />
                <Button
                    onClick={onPublish}
                    disabled={isProcessing}
                    className={cn(
                        "relative w-full h-16 text-base font-bold transition-all border-0",
                        action.bg
                    )}
                >
                    {isProcessing ? (
                        <div className="flex items-center gap-3">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            İşlem Yapılıyor...
                        </div>
                    ) : (
                        <div className="flex items-center justify-between w-full px-4">
                            <div className="flex items-center gap-3">
                                <action.icon className="w-6 h-6" />
                                <div className="flex flex-col items-start">
                                    <span>{action.label}</span>
                                    <span className="text-[10px] opacity-80 font-medium">{action.desc}</span>
                                </div>
                            </div>
                            <Rocket className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </div>
                    )}
                </Button>
            </div>

            {/* Role Badge & Auth Info */}
            <div className="flex items-center justify-between px-2 pt-2">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    API Bağlantısı Aktif
                </div>
                <div className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5",
                    userRole === "ADMIN" ? "bg-violet-500/10 text-violet-400 border border-violet-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                )}>
                    {userRole === "ADMIN" ? <Sparkles className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                    {userRole} MODE
                </div>
            </div>
        </div>
    );
};
