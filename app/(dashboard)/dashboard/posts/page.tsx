"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    LayoutTemplate, Images, Video, Megaphone,
    Send, Trash2, Clock, Search, Filter,
    Loader2, CheckCircle2, AlertCircle, Calendar,
    RefreshCw, Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PostStatus } from "@prisma/client";
import Link from "next/link";

const STATUS_LABELS: Record<PostStatus, string> = {
    TASLAK: "Taslak",
    BEKLEYEN_ONAY: "Bekleyen Onay",
    ONAYLANDI: "Onaylandı",
    YAYINLANDI: "Yayınlandı",
    HATA: "Hata",
};

const STATUS_COLORS: Record<PostStatus, string> = {
    TASLAK: "bg-slate-500/10 text-slate-400 border border-slate-500/20",
    BEKLEYEN_ONAY: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    ONAYLANDI: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    YAYINLANDI: "bg-violet-500/10 text-violet-400 border border-violet-500/20",
    HATA: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
};

const FORMAT_ICON: Record<string, React.ElementType> = {
    post: LayoutTemplate,
    carousel: Images,
    video: Video,
    ad: Megaphone,
};

export default function PostsPage() {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<PostStatus | "ALL">("ALL");
    const [search, setSearch] = useState("");
    const [mounted, setMounted] = useState(false);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => { setMounted(true); }, []);

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        try {
            const url = filter !== "ALL" ? `/api/posts?status=${filter}` : "/api/posts";
            const res = await fetch(url);
            const data = await res.json();
            setPosts(data.posts || []);
        } catch {
            setPosts([]);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => { fetchPosts(); }, [fetchPosts]);

    const handlePublish = async (postId: string) => {
        setProcessingId(postId);
        try {
            const res = await fetch(`/api/posts/${postId}/publish`, { method: "POST" });
            const data = await res.json();
            alert(data.message);
            if (res.ok) {
                setPosts(prev => prev.map(p => p.id === postId ? { ...p, status: "YAYINLANDI" } : p));
            }
        } catch (err: any) {
            alert(`Hata: ${err.message}`);
        } finally {
            setProcessingId(null);
        }
    };

    const handleDelete = async (postId: string) => {
        if (!confirm("Bu postu silmek istediğinize emin misiniz?")) return;
        setProcessingId(postId);
        try {
            const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
            if (res.ok) {
                setPosts(prev => prev.filter(p => p.id !== postId));
            }
        } catch (err: any) {
            alert(`Silme hatası: ${err.message}`);
        } finally {
            setProcessingId(null);
        }
    };

    const filtered = posts.filter(p =>
        (filter === "ALL" || p.status === filter) &&
        (search === "" || (p.title || "").toLowerCase().includes(search.toLowerCase()))
    );

    const statuses: (PostStatus | "ALL")[] = ["ALL", "TASLAK", "BEKLEYEN_ONAY", "ONAYLANDI", "YAYINLANDI", "HATA"];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-8 bg-violet-600 rounded-full" />
                        <h1 className="text-3xl font-black bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent tracking-tighter">
                            Postlarım
                        </h1>
                    </div>
                    <p className="text-slate-400 mt-1 ml-4">Tüm içeriklerinizi yönetin ve yayınlayın.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchPosts}
                        className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-slate-400"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <Link
                        href="/dashboard/studio"
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm transition-colors shadow-lg shadow-violet-600/25"
                    >
                        <Plus className="w-4 h-4" /> Yeni İçerik
                    </Link>
                </div>
            </div>

            {/* Filtreler + Arama */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="İçerik ara..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/50 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {statuses.map(s => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={cn(
                                "px-3 py-2 rounded-xl text-[11px] font-bold transition-all border",
                                filter === s
                                    ? "bg-violet-600 text-white border-violet-500"
                                    : "bg-white/5 text-slate-400 border-white/10 hover:border-white/20 hover:text-white"
                            )}
                        >
                            {s === "ALL" ? "Tümü" : STATUS_LABELS[s as PostStatus]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Post Listesi */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <LayoutTemplate className="w-8 h-8 text-slate-600" />
                    </div>
                    <p className="text-slate-400 font-medium">Henüz içerik yok</p>
                    <Link href="/dashboard/studio" className="text-violet-400 text-sm hover:text-violet-300 transition-colors font-bold">
                        AI Stüdyo'da Yeni İçerik Üret →
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(post => {
                        const FormatIcon = FORMAT_ICON[post.trendTopic] || LayoutTemplate;
                        const isProcessing = processingId === post.id;
                        return (
                            <div
                                key={post.id}
                                className="group flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/15 hover:bg-white/[0.06] transition-all"
                            >
                                {/* Format İkonu */}
                                <div className="w-12 h-12 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                                    <FormatIcon className="w-5 h-5 text-violet-400" />
                                </div>

                                {/* İçerik */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-white text-sm truncate group-hover:text-violet-300 transition-colors">
                                        {post.title || "Adsız İçerik"}
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                                        {(post.content || "").replace(/<[^>]*>/g, "").slice(0, 80)}...
                                    </p>
                                </div>

                                {/* Tarih */}
                                <div className="flex items-center gap-1.5 text-xs text-slate-500 flex-shrink-0 hidden sm:flex">
                                    <Calendar className="w-3 h-3" />
                                    {mounted && post.scheduledDate
                                        ? new Date(post.scheduledDate).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
                                        : mounted
                                            ? new Date(post.createdAt).toLocaleDateString("tr-TR")
                                            : "--"
                                    }
                                </div>

                                {/* Durum */}
                                <div className={cn("px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex-shrink-0", STATUS_COLORS[post.status as PostStatus])}>
                                    {STATUS_LABELS[post.status as PostStatus]}
                                </div>

                                {/* Aksiyonlar */}
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                    {post.status !== "YAYINLANDI" && (
                                        <button
                                            onClick={() => handlePublish(post.id)}
                                            disabled={isProcessing}
                                            className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors border border-emerald-500/20"
                                            title="Şimdi Yayınla"
                                        >
                                            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(post.id)}
                                        disabled={isProcessing}
                                        className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors border border-rose-500/20"
                                        title="Sil"
                                    >
                                        {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Footer İstatistik */}
            {!loading && filtered.length > 0 && (
                <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white/[0.02] border border-white/5 text-[11px] text-slate-500 font-bold">
                    <span>{filtered.length} içerik gösteriliyor</span>
                    <span>{posts.filter(p => p.status === "YAYINLANDI").length} yayınlandı</span>
                </div>
            )}
        </div>
    );
}
