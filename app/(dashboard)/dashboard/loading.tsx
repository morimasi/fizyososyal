import { Activity } from "lucide-react";

export default function DashboardLoading() {
    return (
        <div className="space-y-10 animate-fade-in-up">
            <div className="flex flex-col gap-2">
                <div className="w-48 h-10 bg-slate-800/50 rounded-xl animate-pulse" />
                <div className="w-64 h-6 bg-slate-800/50 rounded-lg animate-pulse" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-32 bg-slate-800/50 rounded-3xl border border-white/5 animate-pulse" />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 h-96 bg-slate-800/50 rounded-3xl border border-white/5 animate-pulse" />
                <div className="lg:col-span-2 h-96 bg-slate-800/50 rounded-3xl border border-white/5 animate-pulse" />
            </div>
        </div>
    );
}
