import { CanvasEditor } from "@/features/canvas-editor/components/canvas-editor";

export default function EditorPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">Görsel Editör</h1>
        <p className="text-slate-500">İçeriğinizi görselleştirin ve özelleştirin.</p>
      </div>
      
      <div className="mt-4">
        <CanvasEditor />
      </div>
    </div>
  );
}
