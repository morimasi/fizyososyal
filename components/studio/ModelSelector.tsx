import React from "react";
import { Zap, BrainCircuit, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { AIModel } from "@/types/studio";

interface ModelSelectorProps {
    selectedModel: AIModel;
    onSelect: (model: AIModel) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, onSelect }) => {
    const models = [
        { id: "gemini-3.1-pro-preview" as const, label: "3.1 Pro (Frontier)", icon: Sparkles, desc: "Multimodal Zeka & En Güçlü" },
        { id: "gemini-2.0-flash" as const, label: "2.0 Flash (Hızlı)", icon: Zap, desc: "Hız & Verimlilik" },
        { id: "gemini-1.5-pro-latest" as const, label: "1.5 Pro (Derin)", icon: BrainCircuit, desc: "Klinik Analiz" },
    ];

    return (
        <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3">Zekâ Seviyesi (AI Model)</label>
            <div className="grid grid-cols-2 gap-3 p-1 bg-slate-900/50 border border-white/5 rounded-xl">
                {models.map((m) => (
                    <button
                        key={m.id}
                        onClick={() => onSelect(m.id)}
                        className={cn(
                            "flex flex-col items-center justify-center gap-1 p-3 rounded-lg transition-all border",
                            selectedModel === m.id
                                ? "bg-violet-600/10 border-violet-500/50 text-white shadow-inner"
                                : "border-transparent text-slate-500 hover:text-slate-300"
                        )}
                    >
                        <m.icon className={cn("w-5 h-5", selectedModel === m.id ? "text-violet-400" : "text-slate-600")} />
                        <span className="text-[11px] font-bold">{m.label}</span>
                        <span className="text-[9px] opacity-60">{m.desc}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};
