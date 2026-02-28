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
  const { aiContent } = useStudioStore();

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

  return (
    <div className="flex flex-col xl:flex-row h-full gap-6 items-start overflow-hidden">
      {/* LEFT TOOLBAR */}
      <Card className="flex flex-col gap-4 p-3 glass-panel border-sage/20 shadow-lg w-full xl:w-16">
        <div className="flex xl:flex-col gap-3 justify-center">
          <Button variant="outline" size="icon" className="rounded-xl border-sage/10 hover:bg-sage/10" onClick={() => addText()}>
            <Type className="w-5 h-5 text-slate-600" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-xl border-sage/10 hover:bg-sage/10" onClick={() => addShape("rect")}>
            <Square className="w-5 h-5 text-slate-600" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-xl border-sage/10 hover:bg-sage/10" onClick={() => addShape("circle")}>
            <CircleIcon className="w-5 h-5 text-slate-600" />
          </Button>
          <div className="relative">
            <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} />
            <Button variant="outline" size="icon" className="rounded-xl border-sage/10 hover:bg-sage/10">
              <ImageIcon className="w-5 h-5 text-slate-600" />
            </Button>
          </div>
          <Separator className="xl:my-2" />
          <Button variant="ghost" size="icon" className="text-red-400 hover:bg-red-50 rounded-xl" onClick={() => {
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

      {/* CENTER AREA */}
      <div className="flex-1 flex flex-col gap-6 items-center min-w-0">
        <div className="w-full flex justify-between items-center px-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Proje Boyutu</span>
            <span className="text-xs font-medium text-slate-600">500x500px</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-xl border-sage/30 text-sage hover:bg-sage/5" onClick={handleSaveDraft}>
               Taslak Kaydet
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => {
              const data = canvas?.toDataURL({ format: 'png', multiplier: 2 });
              const link = document.createElement('a');
              link.download = 'fizyososyal-tasarim.png';
              link.href = data!;
              link.click();
            }}>
              <Download className="w-4 h-4 mr-2" /> PNG
            </Button>
            <Button className="bg-sage hover:bg-sage-dark rounded-xl shadow-lg shadow-sage/20" onClick={handlePublish}>
              Paylaş
            </Button>
          </div>
        </div>

        <div className="relative shadow-2xl rounded-2xl overflow-hidden border-[12px] border-white bg-slate-200">
          <canvas ref={canvasRef} />
        </div>

        {/* AI ASSETS */}
        {aiContent && (
          <Card className="w-full bg-sage/5 border-sage/20 border-dashed rounded-3xl">
            <CardContent className="p-4 flex items-center gap-6 overflow-x-auto">
              <div className="flex items-center gap-2 shrink-0 text-sage-dark font-bold text-xs">
                <Sparkles className="w-4 h-4" /> AI ASSETS
              </div>
              <div className="h-8 w-px bg-sage/20" />
              <div className="flex gap-2">
                {[aiContent.title, aiContent.hook, aiContent.callToAction].map((t, idx) => (
                  <Button key={idx} variant="secondary" size="sm" className="text-[10px] h-8 rounded-lg bg-white truncate max-w-[150px]" onClick={() => addText(t)}>
                    {t}
                  </Button>
                ))}
                {aiContent.generatedImageUrl && (
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="text-[10px] h-8 rounded-lg bg-sage hover:bg-sage-dark" 
                    onClick={() => addImageFromUrl(aiContent.generatedImageUrl!)}
                  >
                    <ImageIcon className="w-3 h-3 mr-2" /> AI Görseli
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* RIGHT SIDEBAR */}
      <div className="w-full xl:w-80 flex flex-col gap-6 h-full">
        <Tabs defaultValue="props" className="w-full">
          <TabsList className="w-full bg-slate-100 rounded-2xl p-1 h-12">
            <TabsTrigger value="props" className="flex-1 rounded-xl gap-2">
              <Palette className="w-4 h-4" /> Özellikler
            </TabsTrigger>
            <TabsTrigger value="layers" className="flex-1 rounded-xl gap-2">
              <Layers className="w-4 h-4" /> Katmanlar
            </TabsTrigger>
          </TabsList>

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
