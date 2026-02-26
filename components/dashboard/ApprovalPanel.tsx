"use client";

import React, { useState, useEffect } from "react";
import {
    ShieldCheck, CheckCircle2, XCircle, Loader2,
    Clock, LayoutTemplate, Images, Video, Megaphone,
    Send, Check, X, AlertTriangle, Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const FORMAT_ICON: Record<string, React.ElementType> = {
    post: LayoutTemplate,
    carousel: Images,
    video: Video,
    ad: Megaphone,
};

interface ApprovalPanelProps {
    className?: string;
}

export function ApprovalPanel({ className }: ApprovalPanelProps) {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        const fetchPending = async () => {
            setLoading(true);
            try {
                const res = await fetch("/api/posts/pending");
                const data = await res.json();
                setPosts(data.posts || []);
            } catch {
                setPosts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchPending();
        // Her 60 saniyede bir yenile
        const interval = setInterval(fetchPending, 60_000);
        return () => clearInterval(interval);
    }, []);

    const handleApprove = async (postId: string) => {
        setProcessingId(postId);
        try {
            const res = await fetch(`/api/posts/${postId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "ONAYLANDI" }),
            });
            if (!res.ok) throw new Error("Onaylama başarısız");
            setPosts(prev => prev.filter(p => p.id !== postId));
        } catch (err: any) {
            alert(`Hata: ${err.message}`);
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (postId: string) => {
        setProcessingId(postId);
        try {
            const res = await fetch(`/api/posts/${postId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "TASLAK" }),
            });
            if (!res.ok) throw new Error("Ret işlemi başarısız");
            setPosts(prev => prev.filter(p => p.id !== postId));
        } catch (err: any) {
            alert(`Hata: ${err.message}`);
        } finally {
            setProcessingId(null);
        }
    };

    const handlePublishApproved = async (postId: string) => {
        setProcessingId(postId);
        try {
            // Önce onayla
            await fetch(`/api/posts/${postId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "ONAYLANDI" }),
            });
            // Sonra yayınla
            const res = await fetch(`/api/posts/${postId}/publish`, { method: "POST" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            alert(data.message);
            setPosts(prev => prev.filter(p => p.id !== postId));
        } catch (err: any) {
            alert(`Hata: ${err.message}`);
        } finally {
            setProcessingId(null);
        }
    };

    if (!loading && posts.length === 0) return null;

    return (
        <div className={cn("rounded-[2rem] border overflow-hidden", posts.length > 0 ? "border-amber-500/20 bg-amber-500/5" : "border-white/5 bg-white/[0.02]", className)}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5 text-amber-400" />
                        </div>
                        {posts.length > 0 && (
                            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center text-[10px] font-black text-white animate-bounce">
                                {posts.length}
                            </div>
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-sm">Onay Bekleyen İçerikler</h3>
                        <p className="text-[10px] text-slate-500 font-medium">
                            {loading ? "Yükleniyor..." : posts.length > 0 ? `${posts.length} içerik incelemenizi bekliyor` : "Bekleyen içerik yok"}
                        </p>
                    </div>
                </div>
                <Link href="/dashboard/posts?status=BEKLEYEN_ONAY" className="text-[10px] font-bold text-amber-400 hover:text-amber-300 transition-colors uppercase tracking-wider">
                    Tümünü Gör →
                </Link>
            </div>

            {/* İçerik */}
            <div className="divide-y divide-white/5">
                {loading ? (
                    <div className="px-6 py-8 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
                    </div>
                ) : (
                    posts.slice(0, 3).map(post => {
                        const FormatIcon = FORMAT_ICON[post.trendTopic] || LayoutTemplate;
                        const isProcessing = processingId === post.id;

                        return (
                            <div key={post.id} className="px-6 py-4 group hover:bg-white/[0.02] transition-colors">
                                <div className="flex items-center gap-4">
                                    {/* Format İkonu */}
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                                        <FormatIcon className="w-5 h-5 text-amber-400" />
                                    </div>

                                    {/* İçerik Bilgisi */}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-white truncate">{post.title || "Adsız İçerik"}</h4>
                                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                                            {(post.content || "").replace(/<[^>]*>/g, "").slice(0, 60)}...
                                        </p>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <span className="flex items-center gap-1 text-[10px] text-slate-600 font-medium">
                                                <Clock className="w-3 h-3" />
                                                {mounted ? new Date(post.createdAt).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "--"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Aksiyonlar */}
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {/* Reddet */}
                                        <button
                                            onClick={() => handleReject(post.id)}
                                            disabled={isProcessing}
                                            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all hover:scale-105"
                                            title="Reddet (Taslağa Geri Al)"
                                        >
                                            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                                        </button>
                                        {/* Onayla */}
                                        <button
                                            onClick={() => handleApprove(post.id)}
                                            disabled={isProcessing}
                                            className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-all hover:scale-105"
                                            title="Onayla (Zamanlana Hazır)"
                                        >
                                            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                        </button>
                                        {/* Onaylay & Yayınla */}
                                        <button
                                            onClick={() => handlePublishApproved(post.id)}
                                            disabled={isProcessing}
                                            className="p-2 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 border border-violet-500/20 transition-all hover:scale-105"
                                            title="Onayla & Şimdi Yayınla"
                                        >
                                            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
