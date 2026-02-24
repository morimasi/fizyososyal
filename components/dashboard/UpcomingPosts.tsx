"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Calendar, Clock, ArrowRight, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Post {
    id: string;
    title: string;
    scheduledDate: Date | string;
    status: string;
    platform: string;
}

export const UpcomingPosts: React.FC<{ posts: Post[] }> = ({ posts }) => {
    return (
        <Card glow className="lg:col-span-2 border-white/5">
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/20">
                        <Calendar className="w-5 h-5 text-violet-400" />
                    </div>
                    <CardTitle className="text-xl">Yaklaşan Paylaşımlar</CardTitle>
                </div>
                <button className="text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1 group">
                    Tümünü Gör <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </button>
            </CardHeader>
            <CardContent className="pt-6">
                {posts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-20 h-20 bg-slate-900/50 rounded-full flex items-center justify-center mb-4 border border-white/10 group hover:border-violet-500/50 transition-all">
                            <Calendar className="w-10 h-10 text-slate-500 group-hover:scale-110 transition-transform" />
                        </div>
                        <h4 className="text-lg font-medium text-white mb-2">Planlanmış gönderi yok</h4>
                        <p className="text-slate-400 max-w-sm mb-6 text-sm">
                            AI Stüdyo'da yeni içerik üretip onaylayarak takviminizi doldurmaya ne dersiniz?
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {posts.map((post) => (
                            <div
                                key={post.id}
                                className="group flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-violet-500/30 hover:bg-white/[0.07] transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center border border-white/10 font-bold text-violet-400">
                                        {new Date(post.scheduledDate).getDate()}
                                    </div>
                                    <div>
                                        <h5 className="font-semibold text-white group-hover:text-violet-300 transition-colors line-clamp-1">
                                            {post.title || "Adsız Gönderi"}
                                        </h5>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="flex items-center gap-1 text-xs text-slate-500">
                                                <Clock className="w-3 h-3" />
                                                {new Date(post.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 font-bold uppercase">
                                                {post.platform}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
