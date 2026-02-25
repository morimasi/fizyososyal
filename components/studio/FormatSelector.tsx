import React from "react";
import { LayoutTemplate, Images, Video, Megaphone, ChevronDown, Sparkles, Target, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { PostFormat, FormatSettings } from "@/types/studio";

const formatButtonVariants = cva(
    "flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200",
    {
        variants: {
            selected: {
                true: "bg-violet-600/20 border-violet-500 text-white",
                false: "bg-slate-800/50 border-white/5 text-slate-400 hover:bg-slate-800 hover:border-white/10",
            },
        },
        defaultVariants: {
            selected: false,
        },
    }
);

const styleButtonVariants = cva(
    "px-3 py-2 rounded-lg border text-[10px] font-bold uppercase transition-all",
    {
        variants: {
            selected: {
                true: "bg-violet-600 border-violet-500 text-white",
                false: "bg-slate-800 border-white/5 text-slate-500 hover:text-white",
            },
        },
        defaultVariants: {
            selected: false,
        },
    }
);

interface FormatSelectorProps {
    selectedFormat: PostFormat;
    settings: FormatSettings;
    onFormatChange: (format: PostFormat) => void;
    onSettingsChange: (settings: Partial<FormatSettings>) => void;
}

export const FormatSelector: React.FC<FormatSelectorProps> = ({
    selectedFormat,
    settings,
    onFormatChange,
    onSettingsChange,
}) => {
    const formats = [
        { id: "post" as const, label: "Statik Post", icon: LayoutTemplate },
        { id: "carousel" as const, label: "Slayt (Carousel)", icon: Images },
        { id: "video" as const, label: "Reels / Video", icon: Video },
        { id: "ad" as const, label: "Reklam (Ad)", icon: Megaphone },
    ];

    const visualStyles = [
        { id: "minimal", label: "Minimal" },
        { id: "clinical", label: "Klinik" },
        { id: "energetic", label: "Enerjik" },
        { id: "premium", label: "Premium" },
    ];

    const audiences = [
        { id: "general", label: "Genel" },
        { id: "athletes", label: "Sporcular" },
        { id: "elderly", label: "Yaşlılar" },
        { id: "office-workers", label: "Ofis Çalışanları" },
        { id: "recovery", label: "Rehabilitasyon" },
    ];

    return (
        <div className="space-y-6">
            <div>
                <label className="text-sm font-medium text-slate-300 mb-3 block flex items-center gap-2">
                    <LayoutTemplate className="w-4 h-4 text-violet-400" />
                    2. İçerik Formatını Seçin
                </label>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {formats.map((format) => (
                        <button
                            key={format.id}
                            onClick={() => onFormatChange(format.id)}
                            className={formatButtonVariants({ selected: selectedFormat === format.id })}
                        >
                            <format.icon className={cn("w-6 h-6 mb-2", selectedFormat === format.id ? "text-violet-400" : "text-slate-500")} />
                            <span className="text-xs font-medium">{format.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Dynamic Customization Options */}
            <div className="p-4 bg-slate-900/50 border border-white/5 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-2 text-[10px] font-bold text-violet-400 uppercase tracking-widest mb-2">
                    <Sparkles className="w-3 h-3" />
                    AI Format Özelleştirme
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Visual Style */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs font-medium text-slate-400">
                            <Palette className="w-3 h-3" /> Görsel Stil
                        </label>
                        <select
                            value={settings.visualStyle || "clinical"}
                            onChange={(e) => onSettingsChange({ visualStyle: e.target.value as any })}
                            className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
                        >
                            {visualStyles.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                        </select>
                    </div>

                    {/* Target Audience */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs font-medium text-slate-400">
                            <Target className="w-3 h-3" /> Hedef Kitle
                        </label>
                        <select
                            value={settings.targetAudience || "general"}
                            onChange={(e) => onSettingsChange({ targetAudience: e.target.value as any })}
                            className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
                        >
                            {audiences.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
                        </select>
                    </div>
                </div>

                {/* Format Specific Extras */}
                {selectedFormat === "carousel" && (
                    <div className="pt-2 border-t border-white/5">
                        <label className="text-xs font-medium text-slate-400 block mb-2">Slayt Sayısı: <span className="text-white">{settings.slideCount || 6}</span></label>
                        <input
                            type="range"
                            min="3"
                            max="10"
                            step="1"
                            value={settings.slideCount || 6}
                            onChange={(e) => onSettingsChange({ slideCount: parseInt(e.target.value) })}
                            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
                        />
                    </div>
                )}

                {selectedFormat === "video" && (
                    <div className="pt-2 border-t border-white/5 space-y-2">
                        <label className="text-xs font-medium text-slate-400">Anlatım Tarzı</label>
                        <div className="grid grid-cols-2 gap-2">
                            {["informational", "pov", "tutorial", "storytelling"].map((style) => (
                                <button
                                    key={style}
                                    onClick={() => onSettingsChange({ videoStyle: style as any })}
                                    className={styleButtonVariants({ selected: settings.videoStyle === style })}
                                >
                                    {style}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
