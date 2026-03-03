"use client";

import React, { useEffect, useRef } from "react";
import * as fabric from "fabric";
import WebFont from "webfontloader";
import { Button } from "@/components/ui/button";
import {
  Undo2,
  Redo2,
  Download
} from "lucide-react";

import { useCanvasStore } from "../store/canvas.store";
import { useStudioStore } from "@/features/studio/store/studio.store";
import { ToolbarLeft } from "./toolbar-left";
import { InspectorRight } from "./inspector-right";
import { applySmartTemplate } from "../services/smart-templates.service";

/**
 * CanvasEditor - Refactored Modular Architecture
 * Focus: High Performance, Scalability, and Clean State Management
 */
export function CanvasEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRenderFrame = useRef<number | null>(null);

  const {
    canvas,
    setCanvas,
    historyIndex,
    history,
    undo,
    redo,
    saveHistory,
    updateLayers,
    setActiveObject
  } = useCanvasStore();

  const { aiContent } = useStudioStore();

  const canvasWidth = 800;
  const canvasHeight = 800;

  // --- INITIALIZATION ---
  useEffect(() => {
    if (canvasRef.current && !canvas) {
      const fabricCanvas = new fabric.Canvas(canvasRef.current, {
        width: canvasWidth,
        height: canvasHeight,
        backgroundColor: "#0a0a0a",
        preserveObjectStacking: true,
      });

      // Font Pre-fetching
      WebFont.load({
        google: { families: ["Inter:400,700,900", "Outfit:400,700", "Playfair Display:400,700"] },
        active: () => fabricCanvas.renderAll(),
      });

      // Global Event Bindings
      fabricCanvas.on("selection:created", (e) => setActiveObject(e.selected[0]));
      fabricCanvas.on("selection:updated", (e) => setActiveObject(e.selected[0]));
      fabricCanvas.on("selection:cleared", () => setActiveObject(null));

      fabricCanvas.on("object:added", () => { updateLayers(); saveHistory(); });
      fabricCanvas.on("object:modified", () => { updateLayers(); saveHistory(); });
      fabricCanvas.on("object:removed", () => { updateLayers(); saveHistory(); });

      // Keyboard Shortcuts
      const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;

        if (e.key === 'Delete' || e.key === 'Backspace') {
          const active = fabricCanvas.getActiveObject();
          const isEditing = active && 'isEditing' in active && (active as any).isEditing;
          if (active && !isEditing) {
            fabricCanvas.remove(active);
            fabricCanvas.discardActiveObject();
            fabricCanvas.renderAll();
          }
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
          e.preventDefault();
          undo();
        }
        if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
          e.preventDefault();
          redo();
        }
      };

      window.addEventListener('keydown', handleKeyDown);

      setCanvas(fabricCanvas);

      // Initial state save
      setTimeout(() => {
        // @ts-expect-error Initial save
        const json = fabricCanvas.toJSON(['id', 'selectable']);
        useCanvasStore.setState({
          history: [JSON.stringify(json)],
          historyIndex: 0
        });
      }, 100);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        fabricCanvas.dispose();
        setCanvas(null);
      };
    }
  }, []);

  // Auto-apply template when AI content arrives
  useEffect(() => {
    if (canvas && aiContent && history.length <= 1) {
      applySmartTemplate({
        canvas,
        aiContent,
        canvasWidth,
        canvasHeight,
        onComplete: () => {
          saveHistory();
          updateLayers();
        }
      }, "scientific");
    }
  }, [canvas, aiContent]);

  // --- EXPORT ENGINE ---
  const downloadArtwork = async () => {
    if (!canvas) return;

    const hasVideo = canvas.getObjects().some(obj => (obj as any)._element?.tagName === 'VIDEO');

    if (hasVideo) {
      try {
        const stream = (canvasRef.current as any).captureStream(30);
        const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
        const chunks: BlobPart[] = [];

        recorder.ondataavailable = e => chunks.push(e.data);
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = `fizyososyal-video-${Date.now()}.webm`;
          link.click();
        };

        recorder.start();
        setTimeout(() => recorder.stop(), 5000);
        alert("Video hazırlanıyor... Lütfen 5 saniye bekleyin.");
      } catch (err) {
        console.error("Export error:", err);
      }
    } else {
      const dataUrl = canvas.toDataURL({ format: 'png', multiplier: 2 });
      const link = document.createElement('a');
      link.download = `fizyososyal-studio-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    }
  };

  return (
    <div className="flex flex-col xl:flex-row h-[80vh] gap-6 items-start overflow-hidden bg-slate-50/50 p-4 rounded-3xl">
      {/* SOL ARAÇ ÇUBUĞU */}
      <ToolbarLeft />

      {/* MERKEZ TUVAL (CANVAS) AREA */}
      <div className="flex-1 flex flex-col items-center justify-center h-full w-full min-w-0 bg-slate-200/50 rounded-3xl border border-slate-200 overflow-hidden relative shadow-inner">

        {/* Kontroller */}
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <Button
            variant="secondary"
            size="icon"
            className="rounded-xl shadow-sm bg-white/90 backdrop-blur-md"
            onClick={undo}
            disabled={historyIndex <= 0}
          >
            <Undo2 className="w-4 h-4 text-slate-700" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="rounded-xl shadow-sm bg-white/90 backdrop-blur-md"
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
          >
            <Redo2 className="w-4 h-4 text-slate-700" />
          </Button>
          <Button
            variant="default"
            className="rounded-xl shadow-lg bg-slate-900 hover:bg-slate-800 text-white ml-2"
            onClick={downloadArtwork}
          >
            <Download className="w-4 h-4 mr-2" /> 4K İndir
          </Button>
        </div>

        {/* Tuval Kapsayıcısı */}
        <div className="relative shadow-2xl overflow-hidden bg-white rounded-lg" style={{ width: 500, height: 500 }}>
          <div style={{ transform: 'scale(0.625)', transformOrigin: 'top left' }}>
            <canvas ref={canvasRef} />
          </div>
        </div>
      </div>

      {/* SAĞ DENETÇİ PANELİ */}
      <InspectorRight />
    </div>
  );
}
