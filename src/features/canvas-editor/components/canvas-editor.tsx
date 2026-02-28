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
  Palette
} from "lucide-react";
import { useStudioStore } from "@/features/studio/store/studio.store";

export function CanvasEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [activeObject, setActiveObject] = useState<fabric.Object | null>(null);
  const [layers, setLayers] = useState<fabric.Object[]>([]);
  const { aiContent, contentType, setAIContent } = useStudioStore();

  // --- Auto Rebuild when AI Content Changes ---
  useEffect(() => {
    if (canvas && aiContent) {
      // Sadece içerik ilk geldiğinde veya manuel tetiklendiğinde otomatik dizayn yapalım
      const shouldAutoBuild = canvas.getObjects().length <= 1; // Boş veya sadece bg varsa
      if (shouldAutoBuild) {
        applyProfessionalLayout();
      }
    }
  }, [canvas, aiContent]);

  const applyProfessionalLayout = async (overrideStyle?: "minimal" | "bold" | "scientific" | "modern") => {
    if (!canvas || !aiContent) return;

    // Use current or override style
    const layout = overrideStyle || aiContent.designHints?.layoutType || "modern";
    const font = aiContent.designHints?.fontFamily || "Inter";
    const primaryColor = aiContent.designHints?.primaryColor || "#ffffff";
    const accentColor = aiContent.designHints?.secondaryColor || "#334155";

    // Canvas'ı temizle
    canvas.clear();
    canvas.backgroundColor = primaryColor;
    setBgColor(primaryColor);

    // 1. Arkaplan Görseli (varsa)
    if (aiContent.generatedImageUrl) {
       try {
         const img = await fabric.FabricImage.fromURL(aiContent.generatedImageUrl, { crossOrigin: 'anonymous' });
         
         // Layout'a göre görsel yerleşimi
         if (layout === "minimal") {
            img.scaleToWidth(canvasWidth * 0.7);
            img.set({ left: canvasWidth * 0.15, top: canvasHeight * 0.35, opacity: 0.9, rx: 20, ry: 20 } as any);
         } else if (layout === "bold") {
            img.scaleToWidth(canvasWidth);
            img.set({ left: 0, top: 0, opacity: 0.4 });
         } else if (layout === "scientific") {
            img.scaleToWidth(canvasWidth * 0.5);
            img.set({ left: canvasWidth * 0.45, top: canvasHeight * 0.2, opacity: 1, rx: 100, ry: 100 } as any);
         } else {
            img.scaleToWidth(canvasWidth);
            img.set({ left: 0, top: 0, opacity: 0.6 });
         }
         
         canvas.add(img);
         canvas.sendObjectToBack(img);
       } catch (e) {
         console.error("BG Image error", e);
       }
    }

    // 2. Ana Başlık (Headline)
    const headlineText = aiContent.mainHeadline || aiContent.title;
    const headline = new fabric.IText(headlineText, {
      left: layout === "scientific" ? 40 : 250,
      top: layout === "bold" ? 100 : 60,
      fontFamily: font,
      fontSize: layout === "bold" ? 52 : 38,
      fontWeight: "bold",
      fill: layout === "bold" ? "#ffffff" : accentColor,
      width: layout === "scientific" ? canvasWidth * 0.5 : canvasWidth - 80,
      textAlign: layout === "scientific" ? "left" : "center",
      originX: layout === "scientific" ? "left" : "center"
    });
    canvas.add(headline);

    // 3. Alt Başlık veya Slogan
    if (aiContent.subHeadline || aiContent.slogan) {
      const sub = new fabric.IText(aiContent.subHeadline || aiContent.slogan || "", {
        left: layout === "scientific" ? 40 : 250,
        top: headline.top! + headline.height! + 10,
        fontFamily: font,
        fontSize: 18,
        fontWeight: "normal",
        fill: layout === "bold" ? "#f1f5f9" : "#64748b",
        width: layout === "scientific" ? canvasWidth * 0.5 : canvasWidth - 80,
        textAlign: layout === "scientific" ? "left" : "center",
        originX: layout === "scientific" ? "left" : "center"
      });
      canvas.add(sub);
    }

    // 4. Dekoratif Elemanlar & Vurgular
    if (layout === "scientific" && aiContent.highlights) {
       aiContent.highlights.slice(0, 3).forEach((h, i) => {
          const circle = new fabric.Circle({
            left: 40,
            top: 250 + (i * 40),
            radius: 4,
            fill: accentColor
          });
          const hText = new fabric.IText(h, {
            left: 60,
            top: 250 + (i * 40) - 4,
            fontFamily: font,
            fontSize: 14,
            fill: "#475569"
          });
          canvas.add(circle, hText);
       });
    }

    // 5. CTA Kutusu (Alt Kısım)
    if (aiContent.callToAction) {
      const ctaBg = new fabric.Rect({
        left: canvasWidth / 2 - 110,
        top: canvasHeight - 85,
        width: 220,
        height: 45,
        fill: accentColor,
        rx: 12, ry: 12,
        shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.15)', blur: 12, offsetX: 0, offsetY: 6 })
      });
      
      const ctaText = new fabric.IText(aiContent.callToAction.toUpperCase(), {
        left: canvasWidth / 2,
        top: canvasHeight - 62,
        fontFamily: font,
        fontSize: 13,
        fontWeight: "bold",
        fill: "#ffffff",
        originX: "center",
        originY: "center",
        charSpacing: 100
      });
      
      canvas.add(ctaBg, ctaText);
    }

    // 6. Filigran (Branding)
    const branding = new fabric.IText("@fizyososyal", {
      left: canvasWidth / 2,
      top: 20,
      fontFamily: font,
      fontSize: 10,
      fill: layout === "bold" ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.2)",
      originX: "center",
      fontWeight: "bold",
      charSpacing: 200
    });
    canvas.add(branding);

    canvas.renderAll();
  };

  // Canvas Config
  const [bgColor, setBgColor] = useState("#ffffff");
  const canvasWidth = 500;
  const canvasHeight = 500;

  // Initialize Canvas
  useEffect(() => {
    if (canvasRef.current) {
      const fabricCanvas = new fabric.Canvas(canvasRef.current, {
        width: canvasWidth,
        height: canvasHeight,
        backgroundColor: bgColor,
      });

      // Load initial fonts
      WebFont.load({
        google: { families: ["Inter", "Poppins", "Montserrat", "Playfair Display"] },
        active: () => fabricCanvas.renderAll(),
      });

      // Event Listeners
      fabricCanvas.on("selection:created", (e) => setActiveObject(e.selected[0]));
      fabricCanvas.on("selection:updated", (e) => setActiveObject(e.selected[0]));
      fabricCanvas.on("selection:cleared", () => setActiveObject(null));
      
      const updateL = () => setLayers([...fabricCanvas.getObjects()].reverse());
      fabricCanvas.on("object:added", updateL);
      fabricCanvas.on("object:removed", updateL);
      fabricCanvas.on("object:modified", updateL);

      setCanvas(fabricCanvas);

      return () => {
        fabricCanvas.dispose();
      };
    }
  }, []);

  const addImageFromUrl = (url: string) => {
    if (!canvas) return;
    fabric.FabricImage.fromURL(url, { crossOrigin: 'anonymous' }).then((img) => {
      img.scaleToWidth(300);
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
    }).catch((err) => {
      console.error("AI Görseli yüklenemedi:", err);
      alert("AI görseli yüklenirken bir hata oluştu (Geçici servis kesintisi olabilir). Lütfen tekrar deneyin.");
    });
  };

  // --- Actions ---
  const addText = (initialText: string = "Metin Yazın") => {
    if (canvas) {
      const text = new fabric.IText(initialText, {
        left: 50,
        top: 50,
        fontFamily: "Inter",
        fontSize: 32,
        fill: "#334155",
      });
      canvas.add(text);
      canvas.setActiveObject(text);
      canvas.renderAll();
    }
  };

  const addShape = (type: "rect" | "circle") => {
    if (canvas) {
      let shape;
      if (type === "rect") {
        shape = new fabric.Rect({
          left: 100, top: 100, fill: "#82A99B", width: 150, height: 150, rx: 12, ry: 12
        });
      } else {
        shape = new fabric.Circle({
          left: 100, top: 100, fill: "#C4A5C9", radius: 75
        });
      }
      canvas.add(shape);
      canvas.setActiveObject(shape);
      canvas.renderAll();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !canvas) return;

    const reader = new FileReader();
    reader.onload = (f) => {
      const data = f.target?.result;
      if (typeof data === "string") {
        fabric.FabricImage.fromURL(data).then((img) => {
          img.scaleToWidth(300);
          canvas.add(img);
          canvas.setActiveObject(img);
          canvas.renderAll();
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // --- Property Updates ---
  const updateActiveObject = (props: any) => {
    if (activeObject && canvas) {
      activeObject.set(props);
      canvas.renderAll();
      // Force state update to reflect property changes in UI
      setActiveObject(null);
      setTimeout(() => setActiveObject(activeObject), 0);
    }
  };

  const toggleLock = (obj: fabric.Object) => {
    const isLocked = obj.lockMovementX;
    obj.set({
      lockMovementX: !isLocked,
      lockMovementY: !isLocked,
      lockScalingX: !isLocked,
      lockScalingY: !isLocked,
      lockRotation: !isLocked,
      hasControls: isLocked,
    });
    canvas?.renderAll();
    setLayers([...canvas!.getObjects()].reverse());
  };

  const handleSaveDraft = async () => {
    if (!canvas) return;
    try {
      const dataURL = canvas.toDataURL({ format: "png", quality: 0.8, multiplier: 1 });
      
      const blob = await (await fetch(dataURL)).blob();
      const file = new File([blob], `design-${Date.now()}.png`, { type: "image/png" });
      const formData = new FormData();
      formData.append("file", file);
      formData.append("filename", file.name);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      
      const uploadData = await uploadRes.json();
      if (!uploadData.success) {
        alert("Görsel yüklenemedi: " + (uploadData.error || "Bilinmeyen hata"));
        return;
      }

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "post",
          mediaUrl: uploadData.url,
          caption: aiContent?.caption || "",
          settings: canvas.toJSON(),
          status: "draft"
        })
      });
      const data = await res.json();
      if (data.success) alert("Taslak başarıyla kaydedildi!");
      else alert("Hata: " + (data.error || "Bilinmeyen hata"));
    } catch (e) {
      alert("Bağlantı hatası!");
    }
  };

  const handlePublish = async () => {
    if (!canvas) return;
    if (!confirm("Instagram hesabınızda anında paylaşılacak. Onaylıyor musunuz?")) return;
    try {
      const dataURL = canvas.toDataURL({ format: "png", quality: 0.8, multiplier: 1 });
      
      const blob = await (await fetch(dataURL)).blob();
      const file = new File([blob], `publish-${Date.now()}.png`, { type: "image/png" });
      const formData = new FormData();
      formData.append("file", file);
      formData.append("filename", file.name);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      
      const uploadData = await uploadRes.json();
      if (!uploadData.success) {
        alert("Görsel yüklenemedi: " + (uploadData.error || "Bilinmeyen hata"));
        return;
      }

      const res = await fetch("/api/instagram/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: uploadData.url,
          caption: aiContent?.caption || "Fizyososyal ile oluşturuldu."
        })
      });
      const data = await res.json();
      if (data.success) alert("Instagram'da paylaşıldı!");
      else alert("Hata (Simülasyon Modu): " + (data.error || "Bilinmeyen hata"));
    } catch (e) {
      alert("Bağlantı hatası!");
    }
  };

  const [isPreviewMode, setIsPreviewMode] = useState(false);

  useEffect(() => {
    if (isPreviewMode && canvas) {
      const previewCanvas = document.getElementById("preview-canvas-placeholder") as HTMLCanvasElement;
      if (previewCanvas) {
        const ctx = previewCanvas.getContext("2d");
        if (ctx) {
          const mainData = canvas.toDataURL({ format: 'png', multiplier: 1 });
          const img = new Image();
          img.onload = () => {
            const tempImg = img;
            ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
            ctx.drawImage(tempImg, 0, 0, previewCanvas.width, previewCanvas.height);
          };
          img.src = mainData;
        }
      }
    }
  }, [isPreviewMode, canvas]);

  return (
    <div className="flex flex-col xl:flex-row h-full gap-6 items-start overflow-hidden">
      {/* LEFT TOOLBAR */}
      {!isPreviewMode && (
        <Card className="flex flex-col gap-4 p-3 glass-panel border-sage/20 shadow-lg w-full xl:w-16">
          <div className="flex xl:flex-col gap-3 justify-center">
            <Button variant="outline" size="icon" className="rounded-xl border-sage/10 hover:bg-sage/10" title="Metin Ekle" onClick={() => addText()}>
              <Type className="w-5 h-5 text-slate-600" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-xl border-sage/10 hover:bg-sage/10" title="Dikdörtgen Ekle" onClick={() => addShape("rect")}>
              <Square className="w-5 h-5 text-slate-600" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-xl border-sage/10 hover:bg-sage/10" title="Daire Ekle" onClick={() => addShape("circle")}>
              <CircleIcon className="w-5 h-5 text-slate-600" />
            </Button>
            <div className="relative">
              <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} />
              <Button variant="outline" size="icon" className="rounded-xl border-sage/10 hover:bg-sage/10" title="Resim Yükle">
                <ImageIcon className="w-5 h-5 text-slate-600" />
              </Button>
            </div>
            <Separator className="xl:my-2" />
            <Button variant="ghost" size="icon" className="text-red-400 hover:bg-red-50 rounded-xl" title="Seçileni Sil" onClick={() => {
              if (activeObject) {
                canvas?.remove(activeObject);
                canvas?.discardActiveObject();
                canvas?.renderAll();
              }
            }}>
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>
        </Card>
      )}

      {/* CENTER AREA */}
      <div className="flex-1 flex flex-col gap-6 items-center min-w-0">
        <div className="w-full flex justify-between items-center px-4">
          <div className="flex gap-2">
            <Button 
              variant={isPreviewMode ? "default" : "outline"} 
              size="sm" 
              className="rounded-xl"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
            >
              {isPreviewMode ? <Settings className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {isPreviewMode ? "Düzenle" : "Instagram Önizleme"}
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              className="rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-100 border-purple-100"
              onClick={() => applyProfessionalLayout()}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Sihirli Düzenle
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-xl border-sage/30 text-sage hover:bg-sage/5" onClick={handleSaveDraft}>
               Taslak Kaydet
            </Button>
            <Button className="bg-sage hover:bg-sage-dark rounded-xl shadow-lg shadow-sage/20" onClick={handlePublish}>
              Paylaş
            </Button>
          </div>
        </div>

        {isPreviewMode ? (
          /* INSTAGRAM PREVIEW */
          <div className="bg-white border rounded-lg shadow-xl w-[400px] overflow-hidden">
            <div className="p-3 flex items-center gap-2 border-b">
              <div className="w-8 h-8 rounded-full bg-slate-200 border" />
              <span className="text-xs font-bold text-slate-900">fizyososyal_klinik</span>
            </div>
            <div className="aspect-square bg-slate-100 flex items-center justify-center relative">
               <div className="shadow-lg border-4 border-white">
                  <canvas id="preview-canvas-placeholder" width={380} height={380} className="pointer-events-none" />
               </div>
            </div>
            <div className="p-3 space-y-2">
               <div className="flex gap-3 text-slate-900">
                  <svg aria-label="Like" height="24" role="img" viewBox="0 0 24 24" width="24"><path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.194 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938m0-2a6.04 6.04 0 0 0-4.797 2.127 6.052 6.052 0 0 0-4.787-2.127A6.985 6.985 0 0 0 .5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 0 0 3.511 3.11.45.45 0 0 0 .583.021 45.163 45.163 0 0 0 3.554-3.12l1.047-.936c.284-.25.568-.493.856-.749 2.465-2.143 5.015-4.36 5.015-7.97a6.985 6.985 0 0 0-6.708-7.218Z"></path></svg>
                  <svg aria-label="Comment" height="24" role="img" viewBox="0 0 24 24" width="24"><path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></path></svg>
                  <svg aria-label="Share Post" height="24" role="img" viewBox="0 0 24 24" width="24"><line fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" x1="22" x2="9.218" y1="3" y2="10.083"></line><polygon fill="none" points="11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></polygon></svg>
               </div>
               <div className="text-xs font-bold">12.345 beğenme</div>
               <div className="text-xs">
                  <span className="font-bold mr-2">fizyososyal_klinik</span>
                  {aiContent?.caption || "Harika bir içerik!"}
               </div>
               <div className="text-[10px] text-slate-500 uppercase">1 DAKİKA ÖNCE</div>
            </div>
          </div>
        ) : (
          <div className="relative shadow-2xl rounded-2xl overflow-hidden border-[12px] border-white bg-slate-200">
            <canvas ref={canvasRef} />
          </div>
        )}

        {/* AI ASSETS (Scrollable & Categorized) */}
        {aiContent && (
          <Card className="w-full bg-white border-sage/20 border rounded-3xl overflow-hidden shadow-sm">
            <div className="bg-sage/5 px-6 py-3 border-b border-sage/10 flex justify-between items-center">
               <span className="text-xs font-bold text-sage-dark flex items-center gap-2">
                 <Sparkles className="w-4 h-4 text-purple-500" /> AI İÇERİK DEPOSU
               </span>
               <span className="text-[10px] text-sage-dark/60 italic">Tıkla ve tasarıma ekle</span>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-[150px] overflow-y-auto custom-scrollbar">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Manşetler</label>
                  <div className="flex flex-col gap-1">
                     {[aiContent.title, aiContent.mainHeadline, aiContent.hook].filter(Boolean).map((t, idx) => (
                       <Button key={idx} variant="outline" size="sm" className="text-[10px] h-auto py-2 px-3 rounded-lg bg-white border-slate-100 hover:border-sage hover:bg-sage/5 text-left justify-start" onClick={() => addText(t!)}>
                         {t}
                       </Button>
                     ))}
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Vurgular & Sloganlar</label>
                  <div className="flex flex-col gap-1">
                     {[aiContent.subHeadline, aiContent.slogan, aiContent.vignette].filter(Boolean).map((t, idx) => (
                       <Button key={idx} variant="outline" size="sm" className="text-[10px] h-auto py-2 px-3 rounded-lg bg-white border-slate-100 hover:border-sage hover:bg-sage/5 text-left justify-start" onClick={() => addText(t!)}>
                         {t}
                       </Button>
                     ))}
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Aksiyon & Görsel</label>
                  <div className="flex flex-col gap-1">
                     <Button variant="outline" size="sm" className="text-[10px] h-auto py-2 px-3 rounded-lg bg-white border-slate-100 hover:border-sage hover:bg-sage/5 text-left justify-start" onClick={() => addText(aiContent.callToAction)}>
                        CTA: {aiContent.callToAction}
                     </Button>
                     {aiContent.generatedImageUrl && (
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="text-[10px] h-auto py-2 px-3 rounded-lg bg-sage/10 text-sage-dark border-sage/20 hover:bg-sage/20" 
                          onClick={() => addImageFromUrl(aiContent.generatedImageUrl!)}
                        >
                          <ImageIcon className="w-3 h-3 mr-2" /> AI Görselini Ekle
                        </Button>
                     )}
                  </div>
               </div>
            </div>
          </Card>
        )}
      </div>

      {/* RIGHT SIDEBAR */}
      <div className="w-full xl:w-80 flex flex-col gap-6 h-full">
        <Tabs defaultValue="props" className="w-full">
          <TabsList className="w-full bg-slate-100 rounded-2xl p-1 h-12">
            <TabsTrigger value="props" className="flex-1 rounded-xl gap-2 text-xs">
              <Palette className="w-4 h-4" /> Düzenle
            </TabsTrigger>
            <TabsTrigger value="layers" className="flex-1 rounded-xl gap-2 text-xs">
              <Layers className="w-4 h-4" /> Katmanlar
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex-1 rounded-xl gap-2 text-xs">
              <Sparkles className="w-4 h-4" /> AI Asistan
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai" className="mt-4">
            <Card className="border-none shadow-sm glass-panel rounded-2xl">
              <ScrollArea className="h-[550px]">
                <CardContent className="p-6 flex flex-col gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                      <Sparkles className="w-4 h-4 text-purple-500" /> Tasarım Stili
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                       {["minimal", "bold", "scientific", "modern"].map((style) => (
                         <Button 
                           key={style} 
                           variant="outline" 
                           size="sm" 
                           className={`capitalize rounded-xl text-[10px] h-12 ${aiContent?.designHints?.layoutType === style ? 'border-purple-500 bg-purple-50 text-purple-700' : ''}`}
                           onClick={() => {
                             // Force layout with specific style
                             if (aiContent) {
                               const updated = {
                                 ...aiContent,
                                 designHints: {
                                   ...(aiContent.designHints || { primaryColor: '#ffffff', secondaryColor: '#334155', fontFamily: 'Inter' }),
                                   layoutType: style as any
                                 }
                               };
                               setAIContent(updated);
                               applyProfessionalLayout(style as any);
                             }
                           }}
                         >
                           {style}
                         </Button>
                       ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                      <ImageIcon className="w-4 h-4 text-blue-500" /> Görsel Varyasyonları
                    </div>
                    <div className="rounded-xl border border-dashed p-4 text-center text-[10px] text-slate-400 bg-slate-50">
                      AI tarafından yeni varyasyonlar üretmek için stüdyoya dönün veya yeni bir istem girin.
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400">Yazı Tipi Önerisi</label>
                    <div className="p-3 bg-white border rounded-xl text-xs flex justify-between items-center">
                       <span className="font-bold">{aiContent?.designHints?.fontFamily || "Inter"}</span>
                       <Button variant="ghost" size="sm" className="h-7 text-[10px]" onClick={() => {
                         if (activeObject && activeObject.type === 'i-text') {
                           updateActiveObject({ fontFamily: aiContent?.designHints?.fontFamily || "Inter" });
                         }
                       }}>Uygula</Button>
                    </div>
                  </div>
                </CardContent>
              </ScrollArea>
            </Card>
          </TabsContent>

          <TabsContent value="props" className="mt-4">
            <Card className="border-none shadow-sm glass-panel rounded-2xl">
              <ScrollArea className="h-[550px]">
                <CardContent className="p-6 flex flex-col gap-8">
                  {!activeObject ? (
                    <div className="flex flex-col gap-6">
                      <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                        <Settings className="w-4 h-4 text-sage" /> Genel Ayarlar
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400">Arkaplan</label>
                        <div className="flex gap-2">
                          <input type="color" value={bgColor} onChange={(e) => {
                            setBgColor(e.target.value);
                            if (canvas) {
                              canvas.backgroundColor = e.target.value;
                              canvas.renderAll();
                            }
                          }} className="w-10 h-10 rounded-lg cursor-pointer border-none" />
                          <Input value={bgColor} readOnly className="text-xs h-10 font-mono" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-8">
                       {/* Common Props */}
                       <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase text-slate-400">Renk & Görünüm</label>
                          <div className="flex gap-2">
                            <input 
                              type="color" 
                              value={typeof activeObject.get('fill') === 'string' ? activeObject.get('fill') as string : '#000000'} 
                              onChange={(e) => updateActiveObject({ fill: e.target.value })} 
                              className="w-10 h-10 rounded-lg cursor-pointer" 
                            />
                            <Input value={typeof activeObject.get('fill') === 'string' ? activeObject.get('fill') as string : 'Resim'} readOnly className="text-xs h-10 font-mono" />
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-bold">
                              <span>OPASİTE</span>
                              <span>{Math.round((activeObject.get('opacity') || 1) * 100)}%</span>
                            </div>
                            <Slider 
                              max={100} 
                              step={1} 
                              value={[(activeObject.get('opacity') || 1) * 100]}
                              onValueChange={(val) => updateActiveObject({ opacity: val[0] / 100 })} 
                            />
                          </div>
                       </div>

                       {/* Text Specific */}
                       {activeObject.type === 'i-text' && (
                         <div className="flex flex-col gap-6 border-t pt-6">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-slate-400">Tipografi</label>
                              <Select 
                                value={activeObject.get('fontFamily') as string} 
                                onValueChange={(v) => updateActiveObject({ fontFamily: v })}
                              >
                                <SelectTrigger className="rounded-xl text-xs h-10">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {["Inter", "Poppins", "Montserrat", "Playfair Display"].map(f => (
                                    <SelectItem key={f} value={f}>{f}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex gap-2">
                               <Button variant={activeObject.get('fontWeight') === 'bold' ? 'default' : 'outline'} className="flex-1 rounded-xl" onClick={() => updateActiveObject({ fontWeight: activeObject.get('fontWeight') === 'bold' ? 'normal' : 'bold' })}>
                                 <Bold className="w-4 h-4" />
                               </Button>
                               <Button variant={activeObject.get('fontStyle') === 'italic' ? 'default' : 'outline'} className="flex-1 rounded-xl" onClick={() => updateActiveObject({ fontStyle: activeObject.get('fontStyle') === 'italic' ? 'normal' : 'italic' })}>
                                 <Italic className="w-4 h-4" />
                               </Button>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                               {[{icon: AlignLeft, v: 'left'}, {icon: AlignCenter, v: 'center'}, {icon: AlignRight, v: 'right'}].map(a => (
                                 <Button key={a.v} variant="outline" size="sm" onClick={() => updateActiveObject({ textAlign: a.v })}>
                                   <a.icon className="w-4 h-4" />
                                 </Button>
                               ))}
                            </div>
                         </div>
                       )}

                       {/* Shape Specific */}
                       {(activeObject.type === 'rect') && (
                         <div className="space-y-4 border-t pt-6">
                            <label className="text-[10px] font-black uppercase text-slate-400">Köşeler</label>
                            <Slider max={100} value={[(activeObject.get('rx') as number) || 0]} onValueChange={(v) => updateActiveObject({ rx: v[0], ry: v[0] })} />
                         </div>
                       )}
                    </div>
                  )}
                </CardContent>
              </ScrollArea>
            </Card>
          </TabsContent>

          <TabsContent value="layers" className="mt-4">
            <Card className="border-none shadow-sm glass-panel rounded-2xl">
              <ScrollArea className="h-[550px]">
                <CardContent className="p-4 flex flex-col gap-2">
                  {layers.map((obj, i) => (
                    <div 
                      key={i} 
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${activeObject === obj ? 'bg-sage/10 border-sage/30' : 'bg-white/50 border-slate-100 hover:bg-slate-50'}`}
                      onClick={() => {
                        canvas?.setActiveObject(obj);
                        canvas?.renderAll();
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                          {obj.type === 'i-text' ? <Type className="w-3 h-3" /> : obj.type === 'image' ? <ImageIcon className="w-3 h-3" /> : <Square className="w-3 h-3" />}
                        </div>
                        <span className="text-[10px] font-bold text-slate-600 truncate max-w-[100px]">
                          {obj.type === 'i-text' ? (obj as fabric.IText).text?.substring(0, 15) : obj.type}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="w-7 h-7" onClick={(e) => {
                          e.stopPropagation();
                          obj.set({ visible: !obj.visible });
                          canvas?.renderAll();
                          setLayers([...canvas!.getObjects()].reverse());
                        }}>
                          {obj.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-slate-300" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="w-7 h-7" onClick={(e) => { e.stopPropagation(); toggleLock(obj); }}>
                          {obj.lockMovementX ? <Lock className="w-3.5 h-3.5 text-orange-400" /> : <Unlock className="w-3.5 h-3.5" />}
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </ScrollArea>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
