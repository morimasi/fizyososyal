import { AIGenerator } from "@/features/ai-generator/components/ai-generator";

export default function StudioPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">İçerik Stüdyosu</h1>
        <p className="text-slate-500">Yapay zeka ile multimodal içerikler üretin ve düzenleyin.</p>
      </div>
      
      <div className="mt-4">
        <AIGenerator />
      </div>
    </div>
  );
}
