"use client";

import React, { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import WebFont from "webfontloader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Type,
  Square,
  Circle as CircleIcon,
  Trash2,
  Download,
  Image as ImageIcon,
  Layers,
  Sparkles,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Settings,
  Palette,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Droplet
} from "lucide-react";
import { useStudioStore } from "@/features/studio/store/studio.store";

// ==========================================
// Intentional Minimalism & Performance Core
// ==========================================

export function CanvasEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [activeObject, setActiveObject] = useState<fabric.Object | null>(null);
  const [layers, setLayers] = useState<fabric.Object[]>([]);

  // History Stack (Undo/Redo)
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isHistoryUpdate = useRef(false);

  const { aiContent, contentType, setAIContent } = useStudioStore();

  const canvasWidth = 800;
  const canvasHeight = 800; // 1:1 Instagram Square Formatı

  // --- INITIALIZATION ---
  useEffect(() => {
    if (canvasRef.current) {
      const fabricCanvas = new fabric.Canvas(canvasRef.current, {
        width: canvasWidth,
        height: canvasHeight,
        backgroundColor: "#0a0a0a", // Avant-garde dark background
        preserveObjectStacking: true, // Z-index stabilitesi için
      });

      // Kritik fontların pre-fetch edilmesi
      WebFont.load({
        google: { families: ["Inter:400,700,900", "Playfair Display:400,700", "Montserrat:400,800", "Outfit:400,700"] },
        active: () => fabricCanvas.renderAll(),
      });

      // Global Event Bindings (Sadece Inspector'ı re-render etmek için)
      fabricCanvas.on("selection:created", (e) => setActiveObject(e.selected[0]));
      fabricCanvas.on("selection:updated", (e) => setActiveObject(e.selected[0]));
      fabricCanvas.on("selection:cleared", () => setActiveObject(null));

      const updateLayers = () => setLayers([...fabricCanvas.getObjects()].reverse());
      fabricCanvas.on("object:added", updateLayers);
      fabricCanvas.on("object:removed", updateLayers);
      fabricCanvas.on("object:modified", updateLayers);

      // History Takibi
      fabricCanvas.on("object:added", () => saveHistory(fabricCanvas));
      fabricCanvas.on("object:modified", () => saveHistory(fabricCanvas));
      fabricCanvas.on("object:removed", () => saveHistory(fabricCanvas));

      setCanvas(fabricCanvas);
      // İlk state save
      setTimeout(() => saveHistory(fabricCanvas, true), 100);

      return () => {
        fabricCanvas.dispose();
      };
    }
  }, []);

  // --- HISTORY (UNDO/REDO) ENGINE ---
  const saveHistory = (c: fabric.Canvas, force: boolean = false) => {
    if (isHistoryUpdate.current && !force) return;
    // @ts-expect-error Fabric v6+ tip tanımlarında toJSON argümanı opsiyonel dizi olarak belirtilmemiş olabilir
    const json = c.toJSON(['id', 'layerName', 'selectable', 'evented', 'hoverCursor']);
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(JSON.stringify(json));
      if (newHistory.length > 30) newHistory.shift(); // 30 hamle sınırı (memory optimizasyonu)
      setHistoryIndex(newHistory.length - 1);
      return newHistory;
    });
  };

  const undo = () => {
    if (historyIndex > 0 && canvas) {
      isHistoryUpdate.current = true;
      const prevIndex = historyIndex - 1;
      canvas.loadFromJSON(JSON.parse(history[prevIndex]), () => {
        canvas.renderAll();
        setHistoryIndex(prevIndex);
        setLayers([...canvas.getObjects()].reverse());
        isHistoryUpdate.current = false;
      });
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1 && canvas) {
      isHistoryUpdate.current = true;
      const nextIndex = historyIndex + 1;
      canvas.loadFromJSON(JSON.parse(history[nextIndex]), () => {
        canvas.renderAll();
        setHistoryIndex(nextIndex);
        setLayers([...canvas.getObjects()].reverse());
        isHistoryUpdate.current = false;
      });
    }
  };

  // --- SMART TEMPLATES (AVANT-GARDE ARCHITECTURE) ---
  const applySmartTemplate = async (style: "scientific" | "aggressive" | "empathetic") => {
    if (!canvas || !aiContent) return;

    // Clear canvas without triggering history loop
    isHistoryUpdate.current = true;
    canvas.clear();

    // Tema Paletleri
    const palettes = {
      scientific: { bg: "#f8fafc", text: "#0f172a", accent: "#3b82f6", font: "Inter" },
      aggressive: { bg: "#09090b", text: "#ffffff", accent: "#e11d48", font: "Outfit" },
      empathetic: { bg: "#fdf4ff", text: "#4a044e", accent: "#c026d3", font: "Playfair Display" }
    };

    const theme = palettes[style];
    canvas.backgroundColor = theme.bg;

    // 1. Görsel Yönetimi (Eğer Varsa)
    if (aiContent.generatedImageUrl) {
      try {
        const img = await fabric.FabricImage.fromURL(aiContent.generatedImageUrl, { crossOrigin: 'anonymous' });

        if (style === "scientific") {
          // Bilimsel: Sağ üstte yuvarlak kesim portre/görsel
          img.scaleToWidth(canvasWidth * 0.45);
          img.set({
            left: canvasWidth * 0.5, top: 40, rx: 200, ry: 200,
            shadow: new fabric.Shadow({ color: 'rgba(59,130,246,0.2)', blur: 40, offsetX: 0, offsetY: 20 })
          } as any);
        } else if (style === "aggressive") {
          // Pazarlama: Tam ekran, gradient overlay için filtreli, keskin
          img.scaleToWidth(canvasWidth);
          img.set({ left: 0, top: 0, opacity: 0.4 });
          // @ts-expect-error Fabric v6+ filter api tanımlamasında hata veriyor
          const f = new fabric.Image.filters.Grayscale();
          img.filters = [f];
          img.applyFilters();
        } else {
          // Empatik: Yumuşak köşeli kart
          img.scaleToWidth(canvasWidth * 0.8);
          img.set({ left: canvasWidth * 0.1, top: 200, rx: 30, ry: 30, opacity: 0.9 } as any);
        }

        canvas.add(img);
        canvas.sendObjectToBack(img);
      } catch (e) { console.error("Resim yükleme hatası", e); }
    }

    // 2. Ultra Profesyonel Tipografi Motoru
    const headlineText = aiContent.mainHeadline || aiContent.title || "Yeni İçerik";

    const headline = new fabric.IText(headlineText, {
      left: style === "scientific" ? 50 : (style === "aggressive" ? canvasWidth / 2 : 60),
      top: style === "scientific" ? 80 : (style === "aggressive" ? 200 : 80),
      fontFamily: theme.font,
      fontSize: style === "aggressive" ? 72 : 54,
      fontWeight: "900", // Mükemmel over-bold etkisi
      fill: theme.text,
      width: style === "scientific" ? canvasWidth * 0.4 : canvasWidth - 100,
      textAlign: style === "aggressive" ? "center" : "left",
      originX: style === "aggressive" ? "center" : "left",
      lineHeight: 1.1, // Sıkışık medikal/pazarlama satır arası (Intentional Typography)
      charSpacing: style === "aggressive" ? -40 : -20, // Modern sıkı harfler
      shadow: style === "aggressive" ? new fabric.Shadow({ color: 'rgba(0,0,0,0.8)', blur: 30 }) : undefined
    });
    canvas.add(headline);


    // 3. Bilimsel Vurgu veya Dekoratif Kutu (Shadow & Stroke)
    if (style === "scientific" && aiContent.subHeadline) {
      const box = new fabric.Rect({
        left: 50, top: headline.top! + headline.height! + 40,
        width: canvasWidth * 0.4, height: 120,
        fill: "rgba(255,255,255,0.8)", stroke: theme.accent, strokeWidth: 2,
        rx: 16, ry: 16,
        shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.05)', blur: 20, offsetY: 10 })
      });
      const sub = new fabric.IText(aiContent.subHeadline, {
        left: 70, top: box.top! + 20,
        fontFamily: "Inter", fontSize: 18, fontWeight: "normal", fill: "#475569",
        width: (canvasWidth * 0.4) - 40,
        lineHeight: 1.4
      });
      canvas.add(box, sub);
    }

    if (style === "aggressive" && aiContent.callToAction) {
      // Dev Gradient-benzeri CTA Modeli
      const cta = new fabric.Rect({
        left: canvasWidth / 2 - 150, top: canvasHeight - 150,
        width: 300, height: 60,
        fill: theme.accent, rx: 30, ry: 30,
        originX: "center",
        shadow: new fabric.Shadow({ color: theme.accent, blur: 40, offsetX: 0, offsetY: 10 })
      });
      const ctaText = new fabric.IText(aiContent.callToAction.toUpperCase(), {
        left: canvasWidth / 2, top: canvasHeight - 120,
        fontFamily: theme.font, fontSize: 18, fontWeight: "bold", fill: "#ffffff",
        originX: "center", originY: "center", charSpacing: 100
      });
      canvas.add(cta, ctaText);
    }

    // Markalama (Watermark / Branding)
    const brand = new fabric.IText("FIZYOSOSYAL", {
      left: canvasWidth / 2, top: 30,
      fontFamily: "Inter", fontSize: 12, fontWeight: "bold",
      fill: style === "aggressive" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)",
      originX: "center", charSpacing: 400
    });
    canvas.add(brand);

    canvas.renderAll();
    isHistoryUpdate.current = false;
    saveHistory(canvas, true);
  };

  // Otomatik Kurulum (Modelden Veri Geldiğinde)
  useEffect(() => {
    if (canvas && aiContent && history.length <= 1) {
      applySmartTemplate("scientific"); // Default Professional Angle
    }
  }, [canvas, aiContent]);


  // --- PROPERTIES UPDATER ---
  const updateProp = (key: string, value: any) => {
    if (activeObject && canvas) {
      activeObject.set(key, value);
      canvas.renderAll();
      // React state bridge
      setActiveObject(null);
      setTimeout(() => setActiveObject(activeObject), 0);
    }
  };


  // --- İHRACAT (EXPORT) ---
  const handleDownload = () => {
    if (!canvas) return;
    const dataURL = canvas.toDataURL({ format: "png", quality: 1, multiplier: 2 }); // 1600x1600 Yüksek Kalite İhracat
    const a = document.createElement("a");
    a.href = dataURL;
    a.download = `fizyososyal-design-${Date.now()}.png`;
    a.click();
  };

  return (
    <div className="flex flex-col xl:flex-row h-[80vh] gap-6 items-start overflow-hidden bg-slate-50/50 p-4 rounded-3xl">
      {/* 
        ====================================================================
        SOL ARAÇ ÇUBUĞU (TOOLKIT)
        Asimetrik, ince, Floating hissiyatlı minimal toolbox.
        ====================================================================
      */}
      <Card className="flex flex-col gap-2 p-2 shadow-xl border-slate-200 w-full xl:w-16 bg-white/80 backdrop-blur-xl shrink-0 rounded-2xl">
        <div className="flex xl:flex-col gap-2 justify-center">
          <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-100" onClick={() => {
            const t = new fabric.IText("Medikal İçerik", { left: canvasWidth / 2, top: canvasHeight / 2, fontFamily: "Inter", fontSize: 48, fontWeight: "bold", fill: "#0f172a", originX: "center", originY: "center" });
            canvas?.add(t); canvas?.setActiveObject(t); canvas?.renderAll();
          }}>
            <Type className="w-5 h-5 text-slate-700" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-100" onClick={() => {
            const r = new fabric.Rect({ left: canvasWidth / 2, top: canvasHeight / 2, width: 200, height: 200, fill: "#e2e8f0", rx: 24, ry: 24, originX: "center", originY: "center" });
            canvas?.add(r); canvas?.setActiveObject(r); canvas?.renderAll();
          }}>
            <Square className="w-5 h-5 text-slate-700" />
          </Button>
          <Separator className="xl:my-2" />
          {/* AI Fotoğraf Ekleme (Manuel Gerekirse) */}
          <Button variant="ghost" size="icon" className="rounded-xl text-purple-600 hover:bg-purple-50" title="AI Görseli Yerleştir" onClick={() => {
            if (aiContent?.generatedImageUrl) {
              fabric.FabricImage.fromURL(aiContent.generatedImageUrl, { crossOrigin: 'anonymous' }).then((img) => {
                img.scaleToWidth(canvasWidth * 0.8);
                img.set({ left: canvasWidth / 2, top: canvasHeight / 2, originX: "center", originY: "center", rx: 20, ry: 20 } as any);
                canvas?.add(img); canvas?.renderAll();
              });
            } else alert("Önce AI'dan görsel üretmelisiniz.");
          }}>
            <Sparkles className="w-5 h-5" />
          </Button>
          <div className="flex-1" />
          <Separator className="xl:my-2" />
          <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 rounded-xl" onClick={() => {
            if (activeObject) { canvas?.remove(activeObject); canvas?.discardActiveObject(); canvas?.renderAll(); }
          }}>
            <Trash2 className="w-5 h-5" />
          </Button>
        </div>
      </Card>

      {/* 
        ====================================================================
        MERKEZ CANVAS
        ====================================================================
      */}
      <div className="flex-1 flex flex-col items-center justify-center h-full w-full min-w-0 bg-slate-200/50 rounded-3xl border border-slate-200 overflow-hidden relative shadow-inner">

        {/* Undo/Redo/Download Kontrolleri (Floating Top Right) */}
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <Button variant="secondary" size="icon" className="rounded-xl shadow-sm bg-white/90 backdrop-blur-md" onClick={undo} disabled={historyIndex <= 0}>
            <Undo2 className="w-4 h-4 text-slate-700" />
          </Button>
          <Button variant="secondary" size="icon" className="rounded-xl shadow-sm bg-white/90 backdrop-blur-md" onClick={redo} disabled={historyIndex >= history.length - 1}>
            <Redo2 className="w-4 h-4 text-slate-700" />
          </Button>
          <Button variant="default" className="rounded-xl shadow-lg bg-slate-900 hover:bg-slate-800 text-white ml-2" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" /> 4K İndir
          </Button>
        </div>

        {/* Canvas Wrap (Scaled CSS) */}
        <div className="relative shadow-2xl overflow-hidden bg-white" style={{ width: 500, height: 500, transform: 'scale(0.9)' }}>
          {/* Fabric'in gerçek boyutu 800x800 olacak, CSS ile 500'e scale ediliyor (Retina Display Optimizasyonu) */}
          <div style={{ transform: 'scale(0.625)', transformOrigin: 'top left' }}>
            <canvas ref={canvasRef} />
          </div>
        </div>
      </div>

      {/* 
        ====================================================================
        SAĞ INSPECTOR PANEL
        Dünyadaki en detaylı React + FabricJS prop düzenleyicisi
        ====================================================================
      */}
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

          {/* AI ŞABLONLAR & DEPO */}
          <TabsContent value="ai" className="flex-1 overflow-hidden m-0 mt-2">
            <ScrollArea className="h-full px-4 pb-4">
              <div className="flex flex-col gap-6">
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-5 rounded-2xl border border-purple-100">
                  <h4 className="text-xs font-black text-purple-900 mb-3 uppercase tracking-wider">Profesyonel Klinik Şablonları</h4>
                  <div className="grid grid-cols-1 gap-2">
                    <Button variant="outline" className="justify-start bg-white text-left h-14 border-purple-100 hover:border-purple-300" onClick={() => applySmartTemplate("scientific")}>
                      <div className="flex flex-col"><span className="font-bold text-slate-800 text-sm">Bilimsel / Akademik</span><span className="text-[10px] text-slate-500">Beyaz arkaplan, yuvarlak kesim görsel, okunabilir temiz yazı.</span></div>
                    </Button>
                    <Button variant="outline" className="justify-start bg-white text-left h-14 border-purple-100 hover:border-purple-300" onClick={() => applySmartTemplate("aggressive")}>
                      <div className="flex flex-col"><span className="font-bold text-slate-800 text-sm">Agresif Pazarlama</span><span className="text-[10px] text-slate-500">Tam ekran görsel, devasa başlıklar, yüksek kontrast.</span></div>
                    </Button>
                    <Button variant="outline" className="justify-start bg-white text-left h-14 border-purple-100 hover:border-purple-300" onClick={() => applySmartTemplate("empathetic")}>
                      <div className="flex flex-col"><span className="font-bold text-slate-800 text-sm">Empatik İletişim</span><span className="text-[10px] text-slate-500">Yumuşak pastel renkler, zarif serif tipografi.</span></div>
                    </Button>
                  </div>
                </div>

                <div className="p-5 rounded-2xl border border-slate-100 bg-white shadow-sm">
                  <h4 className="text-xs font-black text-slate-800 mb-3 uppercase tracking-wider">AI Metin Deposu</h4>
                  <p className="text-[10px] text-slate-500 mb-4">Aşağıdaki metinlere tıklayarak kanvasa yeni obje olarak ekleyebilirsiniz.</p>
                  {aiContent ? (
                    <div className="flex flex-col gap-2">
                      {[aiContent.title, aiContent.mainHeadline, aiContent.hook, aiContent.callToAction].filter(Boolean).map((t, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-700 font-medium hover:bg-slate-100 cursor-pointer italic" onClick={() => {
                          const nt = new fabric.IText(t!, { left: canvasWidth / 2, top: canvasHeight / 2, fontFamily: "Inter", fontSize: 24, fill: "#0f172a", originX: "center" });
                          canvas?.add(nt); canvas?.setActiveObject(nt); canvas?.renderAll();
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

          {/* DÜZENLEME PANELİ (PROPERTIES) */}
          <TabsContent value="design" className="flex-1 overflow-hidden m-0 mt-2">
            <ScrollArea className="h-full px-4 pb-4">
              {!activeObject ? (
                <div className="flex flex-col gap-6 p-4">
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                    <Palette className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 font-medium">Düzenlemek için kanvastan bir element seçin.</p>
                  </div>
                  {/* Arkaplan Rengi (Genel) */}
                  <div className="space-y-3 p-5 rounded-2xl border border-slate-100 bg-white shadow-sm">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Dış Arkaplan</label>
                    <div className="flex items-center gap-3">
                      <input type="color" className="w-12 h-12 rounded-xl cursor-pointer border-0 p-0"
                        value={canvas?.backgroundColor as string || "#ffffff"}
                        onChange={(e) => {
                          if (canvas) { canvas.backgroundColor = e.target.value; canvas.renderAll(); }
                        }} />
                      <Input className="font-mono text-xs uppercase" value={canvas?.backgroundColor as string || "#ffffff"} readOnly />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {/* Temel Renk ve Opasite */}
                  <div className="space-y-4 p-5 rounded-2xl border border-slate-100 bg-white shadow-sm">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
                      <Droplet className="w-3 h-3" /> Dolgu (Fill) & Opaklık
                    </label>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-3">
                        <input type="color" className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0"
                          value={(activeObject.get('fill') as string) || "#000000"}
                          onChange={(e) => updateProp("fill", e.target.value)} />
                        <Input className="font-mono text-xs uppercase h-10" value={(activeObject.get('fill') as string) || "Görsel or Gradient"} readOnly />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-bold text-slate-500"><span>Opaklık</span><span>{Math.round((activeObject.get('opacity') || 1) * 100)}%</span></div>
                        <Slider max={100} value={[(activeObject.get('opacity') || 1) * 100]} onValueChange={(v) => updateProp("opacity", v[0] / 100)} />
                      </div>
                    </div>
                  </div>

                  {/* Gölge (Shadow) Profesyonel Motoru */}
                  <div className="space-y-4 p-5 rounded-2xl border border-slate-100 bg-white shadow-sm">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Drop Shadow</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-slate-400">Blur (Genişlik)</span>
                        <Slider max={100} value={[(activeObject.shadow as any)?.blur || 0]} onValueChange={(v) => {
                          const shadow = new fabric.Shadow({ color: 'rgba(0,0,0,0.5)', blur: v[0], offsetX: (activeObject.shadow as any)?.offsetX || 0, offsetY: (activeObject.shadow as any)?.offsetY || 10 });
                          updateProp("shadow", v[0] === 0 ? null : shadow);
                        }} />
                      </div>
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-slate-400">Y Offset</span>
                        <Slider min={-50} max={50} value={[(activeObject.shadow as any)?.offsetY || 0]} onValueChange={(v) => {
                          const shadow = new fabric.Shadow({ color: 'rgba(0,0,0,0.5)', blur: (activeObject.shadow as any)?.blur || 20, offsetX: 0, offsetY: v[0] });
                          updateProp("shadow", shadow);
                        }} />
                      </div>
                    </div>
                  </div>

                  {/* TEXT ONLY: Gelişmiş Tipografi Katmanı */}
                  {activeObject.type === 'i-text' && (
                    <div className="space-y-6 p-5 rounded-2xl border border-purple-100 bg-purple-50/20 shadow-sm">
                      <label className="text-[10px] font-black uppercase tracking-wider text-purple-700 flex items-center gap-2">
                        <Type className="w-3 h-3" /> Gelişmiş Tipografi
                      </label>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-slate-500 uppercase">Yazı Tipi</span>
                          <Select value={activeObject.get('fontFamily') as string} onValueChange={(v) => updateProp('fontFamily', v)}>
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

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <span className="text-[9px] font-bold text-slate-500 uppercase">Satır Arası (LineHeight)</span>
                          <Slider min={0.5} max={3} step={0.1} value={[(activeObject as fabric.IText).lineHeight || 1.16]} onValueChange={(v) => updateProp('lineHeight', v[0])} />
                        </div>
                        <div className="space-y-2">
                          <span className="text-[9px] font-bold text-slate-500 uppercase">Harf Arası (Tracking)</span>
                          <Slider min={-200} max={800} step={10} value={[(activeObject as fabric.IText).charSpacing || 0]} onValueChange={(v) => updateProp('charSpacing', v[0])} />
                        </div>
                      </div>

                      <div className="flex gap-2 bg-white rounded-xl p-1 border shadow-xs">
                        <Button variant={(activeObject as fabric.IText).fontWeight === 'bold' ? 'secondary' : 'ghost'} size="sm" className="flex-1 h-8" onClick={() => updateProp('fontWeight', (activeObject as fabric.IText).fontWeight === 'bold' ? 'normal' : 'bold')}><Bold className="w-3.5 h-3.5" /></Button>
                        <Button variant={(activeObject as fabric.IText).fontStyle === 'italic' ? 'secondary' : 'ghost'} size="sm" className="flex-1 h-8" onClick={() => updateProp('fontStyle', (activeObject as fabric.IText).fontStyle === 'italic' ? 'normal' : 'italic')}><Italic className="w-3.5 h-3.5" /></Button>
                        <div className="w-[1px] bg-slate-200 mx-1" />
                        {[{ v: 'left', i: AlignLeft }, { v: 'center', i: AlignCenter }, { v: 'right', i: AlignRight }].map(a => (
                          <Button key={a.v} variant={(activeObject as fabric.IText).textAlign === a.v ? 'secondary' : 'ghost'} size="sm" className="flex-1 h-8" onClick={() => updateProp('textAlign', a.v)}><a.i className="w-3.5 h-3.5" /></Button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="h-10" /> {/* Scroll Margin */}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* KATMANLAR PANELİ */}
          <TabsContent value="layers" className="flex-1 overflow-hidden m-0 mt-2">
            <ScrollArea className="h-full px-4 pb-4">
              <div className="flex flex-col gap-2">
                {layers.length === 0 && <p className="text-xs text-slate-400 text-center py-10">Kanvas boş.</p>}
                {layers.map((obj, i) => (
                  <div key={i} className={`flex items-center p-3 rounded-xl border transition-all cursor-pointer ${activeObject === obj ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white hover:bg-slate-50 border-slate-100'}`} onClick={() => { canvas?.setActiveObject(obj); canvas?.renderAll(); }}>
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center mr-3 text-slate-500">
                      {obj.type === 'i-text' ? <Type className="w-4 h-4" /> : obj.type === 'image' ? <ImageIcon className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                    </div>
                    <span className="text-xs font-bold text-slate-700 flex-1 truncate">
                      {obj.type === 'i-text' ? ((obj as fabric.IText).text?.substring(0, 20) || 'Text') : obj.type.toUpperCase()}
                    </span>
                    <div className="flex gap-1 ml-auto">
                      <Button variant="ghost" size="icon" className="w-7 h-7 hover:bg-slate-200" onClick={(e) => { e.stopPropagation(); obj.set('visible', !obj.visible); canvas?.renderAll(); }}>
                        {obj.visible ? <Eye className="w-3.5 h-3.5 text-slate-600" /> : <EyeOff className="w-3.5 h-3.5 text-slate-300" />}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
