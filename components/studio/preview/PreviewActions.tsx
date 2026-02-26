import React, { useState } from "react";
import { Download, Send, Clock, ShieldCheck, CheckCircle2, Loader2, Sparkles, Rocket, Save, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface PreviewActionsProps {
    platform: string;
    userRole: "ADMIN" | "EDITOR" | "APPROVER";
    onPublish: () => Promise<void>;
    onDownload: () => Promise<void>;
    onSave?: () => Promise<void>;
    onSchedule?: (date: Date) => Promise<void>;
    isProcessing?: boolean;
    previewMode: "mockup" | "raw";
    saveStatus?: "idle" | "saving" | "saved" | "error";
    isSaved?: boolean;
}

export const PreviewActions: React.FC<PreviewActionsProps> = ({
    platform,
    userRole,
    onPublish,
    onDownload,
    onSave,
    onSchedule,
    isProcessing = false,
    previewMode,
    saveStatus = "idle",
    isSaved = false,
}) => {
    const [showScheduler, setShowScheduler] = useState(false);
    const [scheduledDate, setScheduledDate] = useState("");
    const [isScheduling, setIsScheduling] = useState(false);

    const getPrimaryAction = () => {
        if (userRole === "EDITOR") {
            return {
                label: "Onaya Gönder",
                icon: ShieldCheck,
                bg: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700",
                desc: "İçerik yöneticilere iletilecek."
            };
        }
        return {
            label: "Şimdi Yayınla",
            icon: Send,
            bg: "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25",
            desc: `İçerik şu an ${platform} üzerinde yayına girecek.`
        };
    };

    const action = getPrimaryAction();

    const handleScheduleConfirm = async () => {
        if (!scheduledDate || !onSchedule) return;
        setIsScheduling(true);
        try {
            await onSchedule(new Date(scheduledDate));
            setShowScheduler(false);
            setScheduledDate("");
        } finally {
            setIsScheduling(false);
        }
    };

    const getSaveLabel = () => {
        if (saveStatus === "saving") return "Kaydediliyor...";
        if (saveStatus === "saved") return "Kaydedildi ✓";
        if (saveStatus === "error") return "Kaydetme Hatası";
        if (isSaved) return "Tekrar Kaydet";
        return "Taslak Olarak Kaydet";
    };

    return (
        <div className="space-y-4">
            {/* Kaydet + İndir */}
            <div className="grid grid-cols-2 gap-3">
                {onSave && (
                    <Button
                        variant="secondary"
                        className={cn(
                            "h-12 border-white/5 transition-all group",
                            saveStatus === "saved" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                                saveStatus === "error" ? "bg-rose-500/10 border-rose-500/20 text-rose-400" :
                                    "bg-slate-800/50 hover:bg-slate-800"
                        )}
                        onClick={onSave}
                        disabled={isProcessing || saveStatus === "saving"}
                    >
                        <div className="flex items-center gap-2 font-bold text-sm">
                            {saveStatus === "saving" ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : saveStatus === "saved" ? (
                                <CheckCircle2 className="w-4 h-4" />
                            ) : (
                                <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            )}
                            {getSaveLabel()}
                        </div>
                    </Button>
                )}
                <Button
                    variant="secondary"
                    className={cn(
                        "h-12 border-white/5 bg-slate-800/50 hover:bg-slate-800 transition-all group",
                        !onSave && "col-span-2"
                    )}
                    onClick={onDownload}
                    disabled={isProcessing}
                >
                    <div className="flex items-center gap-2 font-bold text-sm">
                        <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                        {previewMode === "raw" ? "Ham Görseli İndir" : "PNG İndir"}
                    </div>
                </Button>
            </div>

            {/* Zamanlama Paneli */}
            {onSchedule && (
                <div>
                    {!showScheduler ? (
                        <Button
                            variant="secondary"
                            className="w-full h-12 border-white/5 bg-slate-800/50 hover:bg-slate-800 transition-all group"
                            onClick={() => setShowScheduler(true)}
                            disabled={isProcessing}
                        >
                            <div className="flex items-center justify-center gap-2 font-bold text-sm">
                                <Clock className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                <span>Zamanla</span>
                                <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">Önerilen: 18:00</span>
                            </div>
                        </Button>
                    ) : (
                        <div className="p-4 rounded-2xl border border-violet-500/20 bg-violet-500/5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-violet-300">Yayın Tarihi & Saati</span>
                                <button onClick={() => setShowScheduler(false)} className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <input
                                type="datetime-local"
                                value={scheduledDate}
                                onChange={(e) => setScheduledDate(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors"
                                min={new Date().toISOString().slice(0, 16)}
                            />
                            <Button
                                onClick={handleScheduleConfirm}
                                disabled={!scheduledDate || isScheduling}
                                className="w-full h-10 text-sm font-bold"
                            >
                                {isScheduling ? (
                                    <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Zamanlanıyor...</>
                                ) : (
                                    <><Clock className="w-4 h-4 mr-2" /> Zamanlamayı Onayla</>
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* Ana Yayınla Butonu */}
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

            {/* Auth Badge */}
            <div className="flex items-center justify-between px-2 pt-1">
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
