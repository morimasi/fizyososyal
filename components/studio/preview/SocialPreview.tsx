import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Image as ImageIcon, Sparkles, Monitor, Layout, MonitorSmartphone } from "lucide-react";
import { MockupFrame } from "./MockupFrame";
import { InstagramPreview } from "./platforms/InstagramPreview";
import { LinkedInPreview } from "./platforms/LinkedInPreview";
import { TikTokPreview } from "./platforms/TikTokPreview";
import { PreviewControls } from "./PreviewControls";
import { PreviewActions } from "./PreviewActions";
import { cn } from "@/lib/utils";
import * as htmlToImage from "html-to-image";

interface SocialPreviewProps {
    generatedPost: {
        title: string;
        content: string;
        hashtags: string;
        mediaUrl?: string;
        postFormat: "post" | "carousel" | "video" | "ad";
        platform: "instagram" | "linkedin" | "tiktok";
    } | null;
    isGenerating: boolean;
    userRole: "ADMIN" | "EDITOR" | "APPROVER";
    onSave?: () => Promise<void>;
    onPublishNow?: () => Promise<void>;
    onSchedule?: (date: Date) => Promise<void>;
    saveStatus?: "idle" | "saving" | "saved" | "error";
    isSaved?: boolean;
}

export const SocialPreview: React.FC<SocialPreviewProps> = ({
    generatedPost,
    isGenerating,
    userRole,
    onSave,
    onPublishNow,
    onSchedule,
    saveStatus = "idle",
    isSaved = false,
}) => {
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [zoom, setZoom] = useState(1);
    const [showUI, setShowUI] = useState(true);
    const [previewMode, setPreviewMode] = useState<"mockup" | "raw">("mockup");
    const [isProcessing, setIsProcessing] = useState(false);
    const previewRef = useRef<HTMLDivElement>(null);

    const handleDownload = async (format?: string) => {
        if (!previewRef.current || !generatedPost) return;
        setIsProcessing(true);
        const exportFormat = format || (previewMode === "raw" ? "png" : "mockup");

        try {
            // Processing Simulation for complex formats
            if (["mp4", "gif", "pptx"].includes(exportFormat)) {
                await new Promise(resolve => setTimeout(resolve, 2500)); // Simulate render time
            }

            if (exportFormat === "png" && generatedPost.mediaUrl) {
                const response = await fetch(generatedPost.mediaUrl);
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `physio-${generatedPost.platform}-${Date.now()}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            } else if (exportFormat === "pptx") {
                // Mocking PPTX download - In real app, this would call a PDF/PPTX generation service
                alert("PPTX Sunumu hazırlanıyor... Carousel verileri paketlendi.");
            } else if (exportFormat === "mp4" || exportFormat === "gif") {
                // Mocking Video export
                alert(`${exportFormat.toUpperCase()} Video render işlemi tamamlandı. Preview kalitesi normalize edildi.`);
            } else {
                // Screenshot of the mockup (SVG or PNG)
                const dataUrl = await htmlToImage.toPng(previewRef.current, {
                    quality: 1,
                    pixelRatio: 2,
                });
                const link = document.createElement("a");
                link.download = `physio-export-${Date.now()}.png`;
                link.href = dataUrl;
                link.click();
            }
        } catch (err) {
            console.error("Export hatası:", err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePublish = async () => {
        setIsProcessing(true);
        // Simulating API call
        setTimeout(() => {
            setIsProcessing(false);
            alert(userRole === "EDITOR" ? "Onaya gönderildi!" : "Başarıyla yayınlandı!");
        }, 1500);
    };

    return (
        <Card className="bg-slate-900 border-white/5 relative overflow-hidden flex flex-col h-full group">
            {/* Decorative BG */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/5 blur-[100px] rounded-full -mr-32 -mt-32" />

            <CardHeader className="relative z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-800 rounded-lg">
                            <MonitorSmartphone className="w-5 h-5 text-violet-400" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Canlı Önizleme Simülatörü</CardTitle>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Real-time Platform Rendering</p>
                        </div>
                    </div>
                    {generatedPost && (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-emerald-400 uppercase">Live</span>
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col gap-8 relative z-10">
                {/* Controls Section */}
                <PreviewControls
                    isDarkMode={isDarkMode}
                    setIsDarkMode={setIsDarkMode}
                    zoom={zoom}
                    setZoom={setZoom}
                    showUI={showUI}
                    setShowUI={setShowUI}
                    previewMode={previewMode}
                    setPreviewMode={setPreviewMode}
                />

                {/* Visualizer Area */}
                <div className="flex-1 min-h-[500px] flex items-center justify-center relative bg-slate-950/50 rounded-[2rem] border border-white/5 shadow-inner overflow-hidden">
                    {/* Grid Background */}
                    <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

                    {isGenerating ? (
                        <div className="w-[300px] space-y-6 animate-pulse p-4 bg-black/20 rounded-2xl">
                            <div className="flex items-center gap-3">
                                <Skeleton className="w-10 h-10 rounded-full" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="w-full h-3" />
                                    <Skeleton className="w-1/2 h-2" />
                                </div>
                            </div>
                            <Skeleton className="w-full aspect-square rounded-xl" />
                            <div className="space-y-3">
                                <Skeleton className="w-full h-3" />
                                <Skeleton className="w-full h-3" />
                                <Skeleton className="w-2/3 h-3" />
                            </div>
                        </div>
                    ) : !generatedPost ? (
                        <div className="flex flex-col items-center justify-center text-center p-8">
                            <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mb-6 border border-white/10 group-hover:scale-110 transition-transform duration-500">
                                <Sparkles className="w-10 h-10 text-slate-700" />
                            </div>
                            <h3 className="text-slate-300 font-bold mb-2">Simülasyon Hazır</h3>
                            <p className="text-sm text-slate-500 max-w-xs px-4">
                                Sol panelden içerik ürettiğinizde burada gerçekçi bir önizleme oluşacaktır.
                            </p>
                        </div>
                    ) : (
                        <div
                            style={{ transform: `scale(${zoom})` }}
                            className="transition-transform duration-300 ease-out"
                            ref={previewRef}
                        >
                            {previewMode === "mockup" ? (
                                <MockupFrame platform={generatedPost.platform} isDarkMode={isDarkMode}>
                                    {generatedPost.platform === "instagram" && (
                                        <InstagramPreview post={generatedPost} isDarkMode={isDarkMode} />
                                    )}
                                    {generatedPost.platform === "linkedin" && (
                                        <LinkedInPreview post={generatedPost} isDarkMode={isDarkMode} />
                                    )}
                                    {generatedPost.platform === "tiktok" && (
                                        <TikTokPreview post={generatedPost} />
                                    )}
                                </MockupFrame>
                            ) : (
                                <div className="relative group/raw overflow-hidden rounded-2xl border border-white/10 shadow-2xl bg-black">
                                    {generatedPost.mediaUrl ? (
                                        <img
                                            src={generatedPost.mediaUrl}
                                            alt="Generated Content"
                                            className="max-w-full max-h-[70vh] object-contain"
                                        />
                                    ) : (
                                        <div className="w-[400px] aspect-square flex flex-col items-center justify-center gap-4 bg-slate-900 text-slate-500">
                                            <ImageIcon className="w-12 h-12 opacity-20" />
                                            <p className="text-sm font-medium">Medya Üretilmedi</p>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/raw:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                        <span className="text-[10px] font-bold text-white uppercase tracking-widest bg-violet-600 px-3 py-1 rounded-full shadow-lg">
                                            Raw Output
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Actions Section */}
                {generatedPost && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <PreviewActions
                            platform={generatedPost.platform}
                            userRole={userRole}
                            onPublish={onPublishNow || handlePublish}
                            onDownload={handleDownload}
                            onSave={onSave}
                            onSchedule={onSchedule}
                            isProcessing={isProcessing}
                            previewMode={previewMode}
                            saveStatus={saveStatus}
                            isSaved={isSaved}
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
