"use client";

import React, { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useStudioStore } from "@/features/studio/store/studio.store";
import { 
  Type, 
  Square, 
  Circle as CircleIcon, 
  Trash2, 
  Download, 
  Image as ImageIcon,
  Layers,
  Sparkles
} from "lucide-react";

export function CanvasEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const { aiContent } = useStudioStore();

  useEffect(() => {
    if (canvasRef.current) {
      const fabricCanvas = new fabric.Canvas(canvasRef.current, {
        width: 500,
        height: 500,
        backgroundColor: "#ffffff",
      });
      setCanvas(fabricCanvas);

      return () => {
        fabricCanvas.dispose();
      };
    }
  }, []);

  const addText = () => {
    if (canvas) {
      const text = new fabric.IText("Metin Yazın", {
        left: 100,
        top: 100,
        fontFamily: "Inter",
        fontSize: 24,
        fill: "#334155",
      });
      canvas.add(text);
      canvas.setActiveObject(text);
    }
  };

  const addRect = () => {
    if (canvas) {
      const rect = new fabric.Rect({
        left: 150,
        top: 150,
        fill: "#82A99B",
        width: 100,
        height: 100,
        rx: 10,
        ry: 10,
      });
      canvas.add(rect);
      canvas.setActiveObject(rect);
    }
  };

  const addCircle = () => {
    if (canvas) {
      const circle = new fabric.Circle({
        left: 200,
        top: 200,
        fill: "#C4A5C9",
        radius: 50,
      });
      canvas.add(circle);
      canvas.setActiveObject(circle);
    }
  };

  const deleteObject = () => {
    if (canvas) {
      const activeObjects = canvas.getActiveObjects();
      canvas.discardActiveObject();
      canvas.remove(...activeObjects);
    }
  };

  const downloadCanvas = () => {
    if (canvas) {
      const dataURL = canvas.toDataURL({
        format: "png",
        quality: 1,
        multiplier: 1,
      });
      const link = document.createElement("a");
      link.download = "fizyososyal-post.png";
      link.href = dataURL;
      link.click();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !canvas) return;

    const reader = new FileReader();
    reader.onload = (f) => {
      const data = f.target?.result;
      if (typeof data === "string") {
        fabric.FabricImage.fromURL(data).then((img) => {
          img.scaleToWidth(200);
          canvas.add(img);
          canvas.setActiveObject(img);
          canvas.renderAll();
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveDraft = async () => {
    if (!canvas) return;
    
    try {
      // In a real scenario, we would upload the canvas image to Vercel Blob first, 
      // but for MVP, we'll save the dataURL or a placeholder.
      const dataURL = canvas.toDataURL({ format: "png", quality: 0.8, multiplier: 1 });
      
      const payload = {
        type: "post",
        mediaUrl: dataURL.substring(0, 100) + "...", // Placeholder for real URL
        caption: aiContent?.caption || "",
        settings: canvas.toJSON(),
        status: "draft"
      };

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (data.success) {
        alert("Taslak başarıyla kaydedildi!");
      } else {
        alert("Hata: " + (data.error || "Bilinmeyen hata"));
      }
    } catch (e) {
      alert("Bağlantı hatası!");
    }
  };

  const handlePublish = async () => {
    if (!canvas) return;
    
    if (!confirm("Instagram hesabınızda anında paylaşılacak. Onaylıyor musunuz?")) return;

    try {
      // In a real scenario, upload to Blob and get URL.
      // We will simulate it by showing a success alert.
      const dataURL = canvas.toDataURL({ format: "png", quality: 0.8, multiplier: 1 });
      
      const payload = {
        imageUrl: dataURL.substring(0, 100) + "...", // Placeholder
        caption: aiContent?.caption || "Fizyososyal ile oluşturuldu."
      };

      const res = await fetch("/api/instagram/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (data.success) {
        alert("Instagram'da paylaşıldı!");
      } else {
        alert("Hata (Simülasyon Modu): " + (data.error || "Bilinmeyen hata"));
      }
    } catch (e) {
      alert("Bağlantı hatası!");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      <Card className="p-4 flex flex-col gap-4 glass-panel w-full lg:w-auto">
        <div className="text-sm font-bold text-slate-500 uppercase tracking-wider px-2">Araçlar</div>
        <div className="grid grid-cols-2 lg:flex lg:flex-col gap-2">
          <Button variant="outline" size="icon" onClick={addText} title="Metin Ekle">
            <Type className="w-5 h-5" />
          </Button>
          <Button variant="outline" size="icon" onClick={addRect} title="Dikdörtgen Ekle">
            <Square className="w-5 h-5" />
          </Button>
          <Button variant="outline" size="icon" onClick={addCircle} title="Daire Ekle">
            <CircleIcon className="w-5 h-5" />
          </Button>
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleImageUpload}
            />
            <Button variant="outline" size="icon" title="Resim Yükle">
              <ImageIcon className="w-5 h-5" />
            </Button>
          </div>
          <div className="h-px bg-slate-200 my-2 hidden lg:block" />
          <Button variant="ghost" size="icon" onClick={deleteObject} className="text-red-500 hover:bg-red-50">
            <Trash2 className="w-5 h-5" />
          </Button>
        </div>
      </Card>

      <div className="flex flex-col gap-4 flex-1 items-center">
        <div className="relative shadow-2xl rounded-lg overflow-hidden border-8 border-white bg-white">
          <canvas ref={canvasRef} />
        </div>
        
        <div className="flex gap-4">
          <Button variant="secondary" className="rounded-xl" onClick={downloadCanvas}>
            <Download className="w-4 h-4 mr-2" />
            Görseli İndir
          </Button>
          <Button variant="outline" className="rounded-xl text-sage hover:bg-sage/10" onClick={handleSaveDraft}>
            Taslak Olarak Kaydet
          </Button>
          <Button className="rounded-xl shadow-lg shadow-sage/20" onClick={handlePublish}>
            Paylaşıma Hazırla
          </Button>
        </div>
      </div>

      <Card className="p-4 glass-panel w-full lg:w-64">
        <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4" /> Katmanlar & Ayarlar
        </div>
        <div className="text-xs text-slate-400 italic">
          Düzenlemek istediğiniz nesneyi seçin.
        </div>
        {aiContent && (
          <div className="mt-6 border-t pt-4 flex flex-col gap-2">
            <div className="text-xs font-bold text-sage-dark uppercase flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> AI İçerik Fikri
            </div>
            <p className="text-xs text-slate-600 font-medium">{aiContent.title}</p>
            <p className="text-[10px] text-slate-500 bg-slate-50 p-2 rounded border">
              {aiContent.imageDescription}
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs w-full mt-2"
              onClick={() => {
                if (canvas) {
                  const text = new fabric.IText(aiContent.title, {
                    left: 50, top: 50, fontFamily: "Inter", fontSize: 20, fill: "#334155"
                  });
                  canvas.add(text);
                  canvas.setActiveObject(text);
                }
              }}
            >
              Başlığı Tuvale Ekle
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
