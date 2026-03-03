import { create } from "zustand";
import * as fabric from "fabric";

interface CanvasState {
    canvas: fabric.Canvas | null;
    activeObject: fabric.Object | null;
    layers: fabric.Object[];
    history: string[];
    historyIndex: number;
    isHistoryUpdate: boolean;

    // Actions
    setCanvas: (canvas: fabric.Canvas | null) => void;
    setActiveObject: (obj: fabric.Object | null) => void;
    setLayers: (layers: fabric.Object[]) => void;

    // History Actions
    saveHistory: () => void;
    undo: () => void;
    redo: () => void;

    // Utility Actions
    updateLayers: () => void;
    deleteActiveObject: () => void;
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
    canvas: null,
    activeObject: null,
    layers: [],
    history: [],
    historyIndex: -1,
    isHistoryUpdate: false,

    setCanvas: (canvas) => set({ canvas }),

    setActiveObject: (activeObject) => set({ activeObject }),

    setLayers: (layers) => set({ layers }),

    updateLayers: () => {
        const { canvas } = get();
        if (canvas) {
            set({ layers: [...canvas.getObjects()].reverse() });
        }
    },

    saveHistory: () => {
        const { canvas, isHistoryUpdate, historyIndex, history } = get();
        if (!canvas || isHistoryUpdate) return;

        // @ts-expect-error Fabric v6/v7 JSON export optimization
        const json = canvas.toJSON(['id', 'layerName', 'selectable', 'evented', 'hoverCursor']);
        const jsonStr = JSON.stringify(json);

        // Don't save if it's the same as current
        if (historyIndex >= 0 && history[historyIndex] === jsonStr) return;

        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(jsonStr);

        // Limit history to 30 steps for memory optimization
        if (newHistory.length > 30) {
            newHistory.shift();
        }

        set({
            history: newHistory,
            historyIndex: newHistory.length - 1
        });
    },

    undo: () => {
        const { canvas, history, historyIndex } = get();
        if (!canvas || historyIndex <= 0) return;

        set({ isHistoryUpdate: true });
        const prevIndex = historyIndex - 1;

        canvas.loadFromJSON(JSON.parse(history[prevIndex])).then(() => {
            canvas.renderAll();
            set({
                historyIndex: prevIndex,
                isHistoryUpdate: false,
                activeObject: null,
                layers: [...canvas.getObjects()].reverse()
            });
        });
    },

    redo: () => {
        const { canvas, history, historyIndex } = get();
        if (!canvas || historyIndex >= history.length - 1) return;

        set({ isHistoryUpdate: true });
        const nextIndex = historyIndex + 1;

        canvas.loadFromJSON(JSON.parse(history[nextIndex])).then(() => {
            canvas.renderAll();
            set({
                historyIndex: nextIndex,
                isHistoryUpdate: false,
                activeObject: null,
                layers: [...canvas.getObjects()].reverse()
            });
        });
    },

    deleteActiveObject: () => {
        const { canvas, activeObject } = get();
        if (canvas && activeObject) {
            canvas.remove(activeObject);
            canvas.discardActiveObject();
            canvas.renderAll();
            set({ activeObject: null });
            get().saveHistory();
            get().updateLayers();
        }
    }
}));
