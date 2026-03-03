import React from "react";
import * as fabric from "fabric";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    Type,
    Square,
    Sparkles,
    Trash2
} from "lucide-react";
import { useCanvasStore } from "../store/canvas.store";
import { useStudioStore } from "@/features/studio/store/studio.store";

export function ToolbarLeft() {
    const { canvas, activeObject, saveHistory, updateLayers, deleteActiveObject } = useCanvasStore();
    const { aiContent } = useStudioStore();

    const addText = () => {
        if (!canvas) return;
        const text = new fabric.IText("Yeni Metin", {
            left: 100,
            top: 100,
            fontFamily: "Inter",
            fontSize: 40,
            fontWeight: "bold",
            fill: "#0f172a",
            originX: "center",
            originY: "center"
        });
        canvas.add(text);
        canvas.setActiveObject(text);
        canvas.renderAll();
        saveHistory();
        updateLayers();
    };

    const addRect = () => {
        if (!canvas) return;
        const rect = new fabric.Rect({
            left: 150,
            top: 150,
            width: 200,
            height: 200,
            fill: "#e2e8f0",
            rx: 24,
            ry: 24,
            originX: "center",
            originY: "center"
        });
        canvas.add(rect);
        canvas.setActiveObject(rect);
        canvas.renderAll();
        saveHistory();
        updateLayers();
    };

    const addAIImage = () => {
        if (!aiContent?.generatedImageUrl) {
            alert("Önce AI'dan görsel üretmelisiniz.");
            return;
        }

        fabric.FabricImage.fromURL(aiContent.generatedImageUrl, { crossOrigin: 'anonymous' }).then((img) => {
            img.scaleToWidth(400);
            img.set({
                left: 400,
                top: 400,
                originX: "center",
                originY: "center",
                rx: 20,
                ry: 20
            } as any);
            canvas?.add(img);
            canvas?.renderAll();
            saveHistory();
            updateLayers();
        });
    };

    return (
        <Card className="flex flex-col gap-2 p-2 shadow-xl border-slate-200 w-full xl:w-16 bg-white/80 backdrop-blur-xl shrink-0 rounded-2xl">
            <div className="flex xl:flex-col gap-2 justify-center">
                <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-100" onClick={addText} title="Metin Ekle">
                    <Type className="w-5 h-5 text-slate-700" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-100" onClick={addRect} title="Şekil Ekle">
                    <Square className="w-5 h-5 text-slate-700" />
                </Button>
                <Separator className="xl:my-2" />
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-xl text-purple-600 hover:bg-purple-50"
                    title="AI Görseli Yerleştir"
                    onClick={addAIImage}
                >
                    <Sparkles className="w-5 h-5" />
                </Button>
                <div className="flex-1" />
                <Separator className="xl:my-2" />
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:bg-red-50 rounded-xl disabled:opacity-30"
                    onClick={deleteActiveObject}
                    disabled={!activeObject}
                    title="Seçiliyi Sil"
                >
                    <Trash2 className="w-5 h-5" />
                </Button>
            </div>
        </Card>
    );
}
