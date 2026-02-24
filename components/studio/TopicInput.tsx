import React from "react";
import { Mic, MicOff, AlertCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopicInputProps {
    topic: string;
    setTopic: (val: string) => void;
    isListening: boolean;
    transcript: string;
    error: string | null;
    isOptimizing: boolean;
    startListening: () => void;
    stopListening: () => void;
    onOptimize: () => void;
}

export const TopicInput: React.FC<TopicInputProps> = ({
    topic,
    setTopic,
    isListening,
    transcript,
    error,
    isOptimizing,
    startListening,
    stopListening,
    onOptimize,
}) => {
    return (
        <div className="space-y-6">
            <div className="relative">
                <label className="text-sm font-medium text-slate-300 mb-3 block">3. Konuyu Belirleyin</label>
                <div
                    className={cn(
                        "absolute -inset-1 rounded-2xl blur opacity-20 transition duration-1000",
                        isListening ? "bg-gradient-to-r from-violet-600 to-rose-600 opacity-100 animate-pulse" : ""
                    )}
                />
                <div className="relative bg-slate-900 border border-white/10 rounded-xl p-4 flex flex-col items-center justify-center gap-4 min-h-[140px]">
                    {error && (
                        <div className="flex items-center gap-2 text-rose-400 text-sm mb-2 bg-rose-500/10 px-3 py-1.5 rounded-lg w-full">
                            <AlertCircle className="w-4 h-4" />
                            <span>{error}</span>
                        </div>
                    )}

                    <button
                        onClick={isListening ? stopListening : startListening}
                        className={cn(
                            "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl",
                            isListening
                                ? "bg-rose-500 hover:bg-rose-600 shadow-rose-500/50 scale-110"
                                : "bg-slate-800 hover:bg-slate-700 hover:scale-105 border border-white/10"
                        )}
                    >
                        {isListening ? (
                            <MicOff className="w-6 h-6 text-white" />
                        ) : (
                            <Mic className="w-6 h-6 text-slate-300" />
                        )}
                    </button>
                    <div className="text-center">
                        <p className="font-medium text-white mb-1">
                            {isListening ? "Dinleniyor..." : "Sesli Komut İle Başla"}
                        </p>
                        <p className="text-sm text-slate-500 max-w-xs mx-auto italic">
                            {transcript || '"Bana bel ağrısı için eğitici bir içerik hazırla"'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4 py-2">
                <span className="flex-1 h-px bg-white/10" />
                <span className="text-xs font-semibold text-slate-500 uppercase">VEYA MANUEL YAZIN</span>
                <span className="flex-1 h-px bg-white/10" />
            </div>

            <div className="relative group">
                <textarea
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Örn: Ofis çalışanları için boyun egzersizleri"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none h-24 transition-all"
                />
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        onOptimize();
                    }}
                    disabled={!topic.trim() || isOptimizing}
                    className={cn(
                        "absolute bottom-3 right-3 p-2 rounded-lg transition-all",
                        "bg-violet-600/20 text-violet-400 hover:bg-violet-600 hover:text-white border border-violet-500/30",
                        isOptimizing && "animate-pulse opacity-50"
                    )}
                    title="AI ile Geliştir (Fizyoterapi Odaklı)"
                >
                    <Sparkles className={cn("w-4 h-4", isOptimizing && "animate-spin")} />
                </button>
            </div>
        </div>
    );
};
