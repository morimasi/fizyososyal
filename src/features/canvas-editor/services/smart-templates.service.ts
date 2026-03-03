import * as fabric from "fabric";

export type TemplateStyle = "scientific" | "aggressive" | "empathetic";

interface SmartTemplateOptions {
    canvas: fabric.Canvas;
    aiContent: {
        title?: string;
        mainHeadline?: string;
        subHeadline?: string;
        hook?: string;
        callToAction?: string;
        generatedImageUrl?: string;
    };
    canvasWidth: number;
    canvasHeight: number;
    onComplete: () => void;
}

export const applySmartTemplate = async ({
    canvas,
    aiContent,
    canvasWidth,
    canvasHeight,
    onComplete
}: SmartTemplateOptions, style: TemplateStyle) => {
    if (!canvas || !aiContent) return;

    canvas.clear();

    // Tema Paletleri
    const palettes = {
        scientific: { bg: "#f8fafc", text: "#0f172a", accent: "#3b82f6", font: "Inter" },
        aggressive: { bg: "#09090b", text: "#ffffff", accent: "#e11d48", font: "Outfit" },
        empathetic: { bg: "#fdf4ff", text: "#4a044e", accent: "#c026d3", font: "Playfair Display" }
    };

    const theme = palettes[style];
    canvas.backgroundColor = theme.bg;

    // 1. Görsel Yönetimi
    if (aiContent.generatedImageUrl) {
        try {
            const img = await fabric.FabricImage.fromURL(aiContent.generatedImageUrl, { crossOrigin: 'anonymous' });

            if (style === "scientific") {
                img.scaleToWidth(canvasWidth * 0.45);
                img.set({
                    left: canvasWidth * 0.5, top: 40, rx: 200, ry: 200,
                    shadow: new fabric.Shadow({ color: 'rgba(59,130,246,0.2)', blur: 40, offsetX: 0, offsetY: 20 })
                } as any);
            } else if (style === "aggressive") {
                img.scaleToWidth(canvasWidth);
                img.set({ left: 0, top: 0, opacity: 0.4 });

                // Fabric v7 filter optimization
                const grayscale = new fabric.filters.Grayscale();
                img.filters = [grayscale];
                img.applyFilters();
            } else {
                img.scaleToWidth(canvasWidth * 0.8);
                img.set({ left: canvasWidth * 0.1, top: 200, rx: 30, ry: 30, opacity: 0.9 } as any);
            }

            canvas.add(img);
            canvas.sendObjectToBack(img);
        } catch (e) {
            console.error("Resim yükleme hatası", e);
        }
    }

    // 2. Tipografi Motoru
    const headlineText = aiContent.mainHeadline || aiContent.title || "Yeni İçerik";

    const headline = new fabric.IText(headlineText, {
        left: style === "scientific" ? 50 : (style === "aggressive" ? canvasWidth / 2 : 60),
        top: style === "scientific" ? 80 : (style === "aggressive" ? 200 : 80),
        fontFamily: theme.font,
        fontSize: style === "aggressive" ? 72 : 54,
        fontWeight: "900",
        fill: theme.text,
        width: style === "scientific" ? canvasWidth * 0.4 : canvasWidth - 100,
        textAlign: style === "aggressive" ? "center" : "left",
        originX: style === "aggressive" ? "center" : "left",
        lineHeight: 1.1,
        charSpacing: style === "aggressive" ? -40 : -20,
        shadow: style === "aggressive" ? new fabric.Shadow({ color: 'rgba(0,0,0,0.8)', blur: 30 }) : undefined
    });
    canvas.add(headline);

    // 3. Dekoratif Elemanlar
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

    // Markalama
    const brand = new fabric.IText("FIZYOSOSYAL", {
        left: canvasWidth / 2, top: 30,
        fontFamily: "Inter", fontSize: 12, fontWeight: "bold",
        fill: style === "aggressive" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)",
        originX: "center"
    });
    canvas.add(brand);

    canvas.renderAll();
    onComplete();
};
