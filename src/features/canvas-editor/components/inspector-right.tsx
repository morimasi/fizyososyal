import React from "react";
import * as fabric from "fabric";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    Palette,
    Sparkles,
    Layers,
    Droplet,
    Type as TypeIcon,
    Bold,
    Italic,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Eye,
    EyeOff,
    ImageIcon
} from "lucide-react";
import { useCanvasStore } from "../store/canvas.store";
import { useStudioStore } from "@/features/studio/store/studio.store";
import { applySmartTemplate, TemplateStyle } from "../services/smart-templates.service";

export function InspectorRight() {
    const { canvas, activeObject, layers, saveHistory, updateLayers, setActiveObject } = useCanvasStore();
    const { aiContent } = useStudioStore();

    const updateProp = (key: string, value: any) => {
        if (!activeObject || !canvas) return;
        activeObject.set(key, value);
        if (['shadow', 'stroke', 'blur'].includes(key)) {
            activeObject.set({ objectCaching: false } as any);
        }
        canvas.renderAll();
        saveHistory();
        // Refresh UI
        setActiveObject(null);
        setTimeout(() => setActiveObject(activeObject), 0);
    };

    const handleApplyTemplate = async (style: TemplateStyle) => {
        if (!canvas || !aiContent) return;
        await applySmartTemplate({
            canvas,
            aiContent,
            canvasWidth: 800,
            canvasHeight: 800,
            onComplete: () => {
                saveHistory();
                updateLayers();
            }
        }, style);
    };

    return (
        <Card className="w-full xl:w-96 flex flex-col h-full bg-white/80 backdrop-blur-2xl border-slate-200 shadow-2xl rounded-3xl shrink-0">
            <Tabs defaultValue="design" className="w-full h-full flex flex-col">
                <TabsList className="bg-slate-100/50 p-1 mx-4 mt-4 rounded-xl h-12">
                    <TabsTrigger value="design" className="flex-1 rounded-lg text-xs font-bold gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <Palette className="w-4 h-4" /> Düzenle
                    </TabsTrigger>
                    <TabsTrigger value="ai" className="flex-1 rounded-lg text-xs font-bold gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm text-purple-600">
                        <Sparkles className="w-4 h-4" /> AI Mizanpaj
                    </TabsTrigger>
                    <TabsTrigger value="layers" className="flex-1 rounded-lg text-xs font-bold gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <Layers className="w-4 h-4" /> Katman
                    </TabsTrigger>
                </TabsList>

                {/* AI TEMPLATES */}
                <TabsContent value="ai" className="flex-1 overflow-hidden m-0 mt-2">
                    <ScrollArea className="h-full px-4 pb-4">
                        <div className="flex flex-col gap-6">
                            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-5 rounded-2xl border border-purple-100">
                                <h4 className="text-xs font-black text-purple-900 mb-3 uppercase tracking-wider">Profesyonel Klinik Şablonları</h4>
                                <div className="grid grid-cols-1 gap-2">
                                    <Button variant="outline" className="justify-start bg-white text-left h-14 border-purple-100 hover:border-purple-300" onClick={() => handleApplyTemplate("scientific")}>
                                        <div className="flex flex-col"><span className="font-bold text-slate-800 text-sm">Bilimsel / Akademik</span><span className="text-[10px] text-slate-500">Temiz yazı, profesyonel dizilim.</span></div>
                                    </Button>
                                    <Button variant="outline" className="justify-start bg-white text-left h-14 border-purple-100 hover:border-purple-300" onClick={() => handleApplyTemplate("aggressive")}>
                                        <div className="flex flex-col"><span className="font-bold text-slate-800 text-sm">Agresif Pazarlama</span><span className="text-[10px] text-slate-500">Yüksek kontrast, büyük başlıklar.</span></div>
                                    </Button>
                                    <Button variant="outline" className="justify-start bg-white text-left h-14 border-purple-100 hover:border-purple-300" onClick={() => handleApplyTemplate("empathetic")}>
                                        <div className="flex flex-col"><span className="font-bold text-slate-800 text-sm">Empatik İletişim</span><span className="text-[10px] text-slate-500">Yumuşak renkler, zarif tipografi.</span></div>
                                    </Button>
                                </div>
                            </div>

                            <div className="p-5 rounded-2xl border border-slate-100 bg-white shadow-sm">
                                <h4 className="text-xs font-black text-slate-800 mb-3 uppercase tracking-wider">AI Metin Deposu</h4>
                                {aiContent ? (
                                    <div className="flex flex-col gap-2">
                                        {[aiContent.title, aiContent.mainHeadline, aiContent.hook, aiContent.callToAction].filter(Boolean).map((t, idx) => (
                                            <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-700 font-medium hover:bg-slate-100 cursor-pointer italic" onClick={() => {
                                                if (!canvas) return;
                                                const nt = new fabric.IText(t!, { left: 400, top: 400, fontFamily: "Inter", fontSize: 24, fill: "#0f172a", originX: "center" });
                                                canvas.add(nt); canvas.setActiveObject(nt); canvas.renderAll();
                                                saveHistory(); updateLayers();
                                            }}>
                                                "{t}"
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <span className="text-xs text-slate-400">Üretilmiş AI içeriği yok.</span>
                                )}
                            </div>
                        </div>
                    </ScrollArea>
                </TabsContent>

                {/* DESIGN CONTROLS */}
                <TabsContent value="design" className="flex-1 overflow-hidden m-0 mt-2">
                    <ScrollArea className="h-full px-4 pb-4">
                        {!activeObject ? (
                            <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-4">
                                <Palette className="w-12 h-12 opacity-20" />
                                <p className="text-xs font-medium">Düzenlemek için bir nesne seçin</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-6 w-full">
                                {/* Basic Fill & Opacity */}
                                <div className="space-y-4 p-5 rounded-2xl border border-slate-100 bg-white shadow-sm">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                        <Droplet className="w-3 h-3" /> Dolgu & Opaklık
                                    </label>
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center gap-3">
                                            <input type="color" className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0"
                                                value={(activeObject.get?.('fill') as string) || "#000000"}
                                                onChange={(e) => updateProp("fill", e.target.value)} />
                                            <Input className="font-mono text-xs uppercase h-10" value={(activeObject.get?.('fill') as string) || "Görsel / Gradyan"} readOnly />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-[10px] font-bold text-slate-500"><span>Opaklık</span><span>{Math.round(((activeObject.get?.('opacity') as number) || 1) * 100)}%</span></div>
                                            <Slider max={100} value={[((activeObject.get?.('opacity') as number) || 1) * 100]} onValueChange={(v) => updateProp("opacity", v[0] / 100)} />
                                        </div>
                                    </div>
                                </div>

                                {/* Typography (If IText) */}
                                {activeObject.type === 'i-text' && (
                                    <div className="space-y-4 p-5 rounded-2xl border border-purple-100 bg-purple-50/20 shadow-sm">
                                        <label className="text-[10px] font-black uppercase tracking-wider text-purple-700 flex items-center gap-2">
                                            <TypeIcon className="w-3 h-3" /> Tipografi
                                        </label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <span className="text-[9px] font-bold text-slate-500 uppercase">Yazı Tipi</span>
                                                <Select value={activeObject.get?.('fontFamily') as string} onValueChange={(v) => updateProp('fontFamily', v)}>
                                                    <SelectTrigger className="h-9 text-xs bg-white"><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        {["Inter", "Outfit", "Playfair Display", "Montserrat"].map(f => (<SelectItem key={f} value={f}>{f}</SelectItem>))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[9px] font-bold text-slate-500 uppercase">Boyut (px)</span>
                                                <Input type="number" className="h-9 text-xs font-mono bg-white" value={(activeObject as fabric.IText).fontSize} onChange={(e) => updateProp('fontSize', parseInt(e.target.value))} />
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant={(activeObject as fabric.IText).fontWeight === 'bold' || (activeObject as fabric.IText).fontWeight === '900' ? 'secondary' : 'outline'} size="sm" className="flex-1 h-8" onClick={() => updateProp('fontWeight', (activeObject as fabric.IText).fontWeight === '900' || (activeObject as fabric.IText).fontWeight === 'bold' ? 'normal' : '900')}><Bold className="w-3.5 h-3.5" /></Button>
                                            <Button variant={(activeObject as fabric.IText).fontStyle === 'italic' ? 'secondary' : 'outline'} size="sm" className="flex-1 h-8" onClick={() => updateProp('fontStyle', (activeObject as fabric.IText).fontStyle === 'italic' ? 'normal' : 'italic')}><Italic className="w-3.5 h-3.5" /></Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </ScrollArea>
                </TabsContent>

                {/* LAYERS */}
                <TabsContent value="layers" className="flex-1 overflow-hidden m-0 mt-2">
                    <ScrollArea className="h-full px-4 pb-4">
                        <div className="flex flex-col gap-2">
                            {layers.length === 0 && <p className="text-xs text-slate-400 text-center py-10">Kanvas boş.</p>}
                            {layers.map((obj, i) => (
                                <div key={i} className={`flex items-center p-3 rounded-xl border transition-all cursor-pointer ${activeObject === obj ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white hover:bg-slate-50 border-slate-100'}`} onClick={() => { canvas?.setActiveObject(obj); canvas?.renderAll(); }}>
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center mr-3 text-slate-500">
                                        {obj.type === 'i-text' ? <TypeIcon className="w-4 h-4" /> : obj.type === 'image' ? <Eye className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
                                    </div>
                                    <span className="text-xs font-bold text-slate-700 flex-1 truncate">
                                        {obj.type === 'i-text' ? ((obj as fabric.IText).text?.substring(0, 20) || 'Metin') : obj.type.toUpperCase()}
                                    </span>
                                    <Button variant="ghost" size="icon" className="w-7 h-7 hover:bg-slate-200" onClick={(e) => { e.stopPropagation(); obj.set('visible', !obj.visible); canvas?.renderAll(); }}>
                                        {obj.visible ? <Eye className="w-3.5 h-3.5 text-slate-600" /> : <EyeOff className="w-3.5 h-3.5 text-slate-300" />}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </TabsContent>
            </Tabs>
        </Card>
    );
}
