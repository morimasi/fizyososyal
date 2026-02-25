"use client";

import { useEffect } from "react";
import { Activity } from "lucide-react";

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("[DASHBOARD_ERROR]", error);
    }, [error]);

    return (
        <div className="p-12 mt-10 text-center bg-slate-900/40 rounded-[32px] border border-white/5 backdrop-blur-xl">
            <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-rose-500/20">
                <Activity className="text-rose-400 w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Bir Sorun Oluştu</h2>
            <p className="text-slate-400 max-w-sm mx-auto mb-8">
                Dashboard verileri yüklenirken beklenmeyen bir hata yaşandı. Lütfen bağlantınızı kontrol edip tekrar deneyin.
            </p>
            {error.digest && (
                <div className="mb-8 p-4 bg-black/30 rounded-xl border border-white/5 font-mono text-[10px] text-slate-500">
                    Hata Kimliği: {error.digest}
                </div>
            )}
            <button
                onClick={() => reset()}
                className="px-8 py-3 rounded-xl bg-white text-black hover:bg-slate-200 font-bold transition-colors"
            >
                Tekrar Dene
            </button>
        </div>
    );
}
