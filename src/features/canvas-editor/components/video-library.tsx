import React, { useState, useEffect } from "react";
import { Search, Loader2, PlayCircle, Film } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface VideoData {
    id: number;
    image: string;
    duration: number;
    video_files: {
        id: number;
        quality: string;
        file_type: string;
        link: string;
        width: number;
        height: number;
    }[];
}

interface VideoLibraryProps {
    onVideoSelect: (url: string) => void;
    defaultQuery?: string;
}

export function VideoLibrary({ onVideoSelect, defaultQuery = "physiotherapy clinic" }: VideoLibraryProps) {
    const [query, setQuery] = useState(defaultQuery);
    const [videos, setVideos] = useState<VideoData[]>([]);
    const [loading, setLoading] = useState(false);
    const [hoveredVideo, setHoveredVideo] = useState<number | null>(null);

    const fetchVideos = async (searchQuery: string) => {
        if (!searchQuery) return;
        setLoading(true);
        try {
            const response = await fetch(
                `https://api.pexels.com/videos/search?query=${encodeURIComponent(searchQuery)}&per_page=15&orientation=portrait`,
                {
                    headers: {
                        Authorization: process.env.NEXT_PUBLIC_PEXELS_API_KEY || "",
                    },
                }
            );
            if (!response.ok) throw new Error("Pexels API Error");
            const data = await response.json();
            setVideos(data.videos || []);
        } catch (error) {
            console.error("Video çekme hatası:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVideos(defaultQuery);
    }, [defaultQuery]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchVideos(query);
    };

    const selectVideo = (videoInfo: VideoData) => {
        // Canvas için genelde HD veya SD mp4 tercih edilir
        const bestQualityFile = videoInfo.video_files.find((f) => f.quality === "hd") || videoInfo.video_files[0];
        if (bestQualityFile) {
            onVideoSelect(bestQualityFile.link);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white/50 backdrop-blur-xl border border-white rounded-3xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-100 bg-white/80">
                <h3 className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-2 mb-3">
                    <Film className="w-4 h-4 text-purple-600" /> Stok Videolar
                </h3>
                <form onSubmit={handleSearch} className="relative">
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Video ara..."
                        className="pl-9 bg-slate-50 border-slate-200 h-10 rounded-xl text-xs font-medium"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </form>
            </div>

            <ScrollArea className="flex-1 p-2">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-8 gap-3 text-slate-400">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span className="text-xs font-bold uppercase tracking-wider">Aranıyor...</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-2 p-2">
                        {videos.map((video) => (
                            <div
                                key={video.id}
                                className="relative aspect-[9/16] bg-slate-100 rounded-xl overflow-hidden cursor-pointer group border-2 border-transparent hover:border-purple-500 transition-all shadow-sm hover:shadow-md"
                                onMouseEnter={() => setHoveredVideo(video.id)}
                                onMouseLeave={() => setHoveredVideo(null)}
                                onClick={() => selectVideo(video)}
                            >
                                {hoveredVideo === video.id ? (
                                    <video
                                        src={video.video_files[0]?.link}
                                        autoPlay
                                        muted
                                        loop
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <img
                                        src={video.image}
                                        alt="stok video"
                                        className="w-full h-full object-cover"
                                    />
                                )}

                                {/* Oynatma ikonu ve Süre */}
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors pointer-events-none" />
                                <div className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-md text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md pointer-events-none flex items-center gap-1">
                                    <PlayCircle className="w-2 h-2" /> {video.duration}sn
                                </div>
                            </div>
                        ))}
                        {videos.length === 0 && !loading && (
                            <div className="col-span-2 text-center p-8 text-slate-400 text-xs font-medium">
                                Sonuç bulunamadı
                            </div>
                        )}
                    </div>
                )}
            </ScrollArea>
            <div className="p-2 border-t border-slate-100 bg-white/80 text-center">
                <a href="https://pexels.com" target="_blank" rel="noreferrer" className="text-[9px] text-slate-400 hover:text-slate-600 font-bold tracking-widest uppercase">
                    Pexels API Tarafından Sağlanır
                </a>
            </div>
        </div>
    );
}
