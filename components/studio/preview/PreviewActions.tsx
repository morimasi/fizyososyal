import React, { useState } from "react";
import { Download, Send, Clock, ShieldCheck, CheckCircle2, Loader2, Sparkles, Rocket, Save, X, FileType, Video, FileText, Image as ImageIcon, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface PreviewActionsProps {
    platform: string;
    userRole: "ADMIN" | "EDITOR" | "APPROVER";
    onPublish: () => Promise<void>;
    onDownload: (format?: string) => Promise<void>;
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
    const [showExportMenu, setShowExportMenu] = useState(false);

    const exportFormats = [
        { id: "png", label: "Görsel (PNG)", icon: ImageIcon, desc: "Yüksek çözünürlüklü statik çıktı" },
        { id: "mp4", label: "Video (MP4)", icon: Video, desc: "Animasyonlu/Reels formatında çıktı" },
        { id: "pptx", label: "Sunum (PPTX)", icon: FileText, desc: "Carousel slayt sunumu" },
        { id: "gif", label: "Animasyon (GIF)", icon: Sparkles, desc: "Kısa döngülü animasyon" },
        { id: "svg", label: "Vektör (SVG)", icon: FileType, desc: "Logolu profesyonel tasarım" },
    ];

    const getPrimaryAction = () => {
        if (userRole === "EDITOR") {
            return {
                label: "Onaya Gönder",
                icon: ShieldCheck,
                bg: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700",
                desc: "İçerik yöneticilere iletilecek."
            };
        }
        if (userRole === "APPROVER") {
            return {
                label: "Onayla & Kuyruğa Al",
                icon: CheckCircle2,
                bg: "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-xl shadow-emerald-500/20",
                desc: "Klinik doğruluğu onayla ve sıraya ekle."
            };
        }
        return {
            label: "Nihai Yayınla",
            icon: Rocket,
            bg: "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-xl shadow-violet-500/20",
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

    const handleExport = (format: string) => {
        setShowExportMenu(false);
        onDownload(format);
    };

    const getSaveLabel = () => {
        if (saveStatus === "saving") return "Kaydediliyor...";
        if (saveStatus === "saved") return "Kaydedildi ✓";
        if (saveStatus === "error") return "Hata!";
        if (isSaved) return "Tekrar Kaydet";
        return "Taslak Kaydet";
    };

    return (
        <div className="space-y-4">
            {/* Top Row: Save + Export Dropdown */}
            <div className="grid grid-cols-2 gap-3 relative">
                {onSave && (
                    <Button
                        variant="secondary"
                        className={cn(
                            "h-12 border-white/5 transition-all group overflow-hidden relative",
                            saveStatus === "saved" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                                saveStatus === "error" ? "bg-rose-500/10 border-rose-500/20 text-rose-400" :
                                    "bg-slate-800/40 hover:bg-slate-800"
                        )}
                        onClick={onSave}
                        disabled={isProcessing || saveStatus === "saving"}
                    >
                        <div className="flex items-center gap-2 font-bold text-xs z-10">
                            {saveStatus === "saving" ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : saveStatus === "saved" ? (
                                <CheckCircle2 className="w-4 h-4" />
                            ) : (
                                <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            )}
                            {getSaveLabel()}
                        </div>
                        {saveStatus === "saving" && <div className="absolute inset-x-0 bottom-0 h-0.5 bg-violet-500 animate-[shimmer_2s_infinite]" />}
                    </Button>
                )}

                <div className="relative">
                    <Button
                        variant="secondary"
                        className={cn(
                            "w-full h-12 border-white/5 bg-slate-800/40 hover:bg-slate-800 transition-all group flex items-center justify-between px-4",
                            showExportMenu && "ring-1 ring-violet-500/50 bg-slate-800"
                        )}
                        onClick={() => setShowExportMenu(!showExportMenu)}
                        disabled={isProcessing}
                    >
                        <div className="flex items-center gap-2 font-bold text-xs">
                            <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                            <span>İndir / Dışa Aktar</span>
                        </div>
                        <ChevronDown className={cn("w-4 h-4 transition-transform duration-300", showExportMenu && "rotate-180")} />
                    </Button>

                    {/* Export Format Menu (Flyout) */}
                    {showExportMenu && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)} />
                            <div className="absolute bottom-full mb-3 right-0 w-64 bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                                <div className="px-3 py-2 mb-1 border-b border-white/5">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Çıktı Formatı Seçin</span>
                                </div>
                                <div className="space-y-1">
                                    {exportFormats.map((f) => (
                                        <button
                                            key={f.id}
                                            onClick={() => handleExport(f.id)}
                                            className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-all group/item text-left"
                                        >
                                            <div className="p-2 rounded-lg bg-white/5 group-hover/item:bg-violet-500/20 transition-colors">
                                                <f.icon className="w-4 h-4 text-slate-400 group-hover/item:text-violet-400" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-white group-hover/item:text-violet-300">{f.label}</span>
                                                <span className="text-[9px] text-slate-500 leading-none mt-1">{f.desc}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Zamanlama Paneli */}
            {onSchedule && (
                <div>
                    {!showScheduler ? (
                        <Button
                            variant="secondary"
                            className="w-full h-12 border-white/10 bg-gradient-to-br from-slate-800/40 to-slate-900/40 hover:from-slate-800 hover:to-slate-800 transition-all group"
                            onClick={() => setShowScheduler(true)}
                            disabled={isProcessing}
                        >
                            <div className="flex items-center justify-center gap-2 font-bold text-sm">
                                <Clock className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                <span>Zamanla</span>
                                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Önerilen: 18:00</span>
                            </div>
                        </Button>
                    ) : (
                        <div className="p-5 rounded-[2rem] border border-violet-500/20 bg-slate-900/80 backdrop-blur-xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-violet-400" />
                                    <span className="text-xs font-bold text-white uppercase tracking-wider">Yayın Takvimi</span>
                                </div>
                                <button onClick={() => setShowScheduler(false)} className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <input
                                type="datetime-local"
                                value={scheduledDate}
                                onChange={(e) => setScheduledDate(e.target.value)}
                                className="w-full px-4 py-3 rounded-2xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-all"
                                min={new Date().toISOString().slice(0, 16)}
                            />
                            <Button
                                onClick={handleScheduleConfirm}
                                disabled={!scheduledDate || isScheduling}
                                className="w-full h-12 text-sm font-bold bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-500/20"
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
            <div className="relative group/main">
                <div className={cn(
                    "absolute -inset-1 rounded-[2rem] blur-lg opacity-10 group-hover/main:opacity-40 transition duration-500",
                    userRole === "EDITOR" ? "bg-blue-500" : "bg-violet-500"
                )} />
                <Button
                    onClick={onPublish}
                    disabled={isProcessing}
                    className={cn(
                        "relative w-full h-[72px] text-base font-bold transition-all border-0 rounded-2xl group-active:scale-[0.98]",
                        action.bg
                    )}
                >
                    {isProcessing ? (
                        <div className="flex items-center gap-3">
                            <Loader2 className="w-6 h-6 animate-spin" />
                            <span className="animate-pulse">Sistem İşliyor...</span>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between w-full px-6">
                            <div className="flex items-center gap-4 text-left">
                                <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm group-hover/main:scale-110 transition-transform">
                                    <action.icon className="w-6 h-6" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-lg tracking-tight leading-none mb-1">{action.label}</span>
                                    <span className="text-[10px] opacity-70 font-medium uppercase tracking-[0.05em]">{action.desc}</span>
                                </div>
                            </div>
                            <Rocket className="w-7 h-7 group-hover/main:translate-x-1 group-hover/main:-translate-y-1 transition-transform ease-out duration-300" />
                        </div>
                    )}
                </Button>
            </div>

            {/* Auth Badge */}
            <div className="flex items-center justify-between px-3 pt-2">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <span>Live Connection</span>
                </div>
                <div className={cn(
                    "px-4 py-1 rounded-full text-[10px] font-black tracking-widest flex items-center gap-2",
                    userRole === "ADMIN" ? "bg-violet-500/10 text-violet-400 border border-violet-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                )}>
                    {userRole === "ADMIN" ? <Sparkles className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                    {userRole} MODE
                </div>
            </div>
        </div>
    );
};
