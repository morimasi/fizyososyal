"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Sparkles } from "lucide-react";
import { useStudioStore } from "@/features/studio/store/studio.store";

export function AIGenerator() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const { aiContent: result, setAIContent: setResult } = useStudioStore();

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        body: JSON.stringify({ prompt, type: "text" }),
      });
      const data = await response.json();
      if (data.success) {
        setResult(data.data);
      } else {
        alert(data.error || "Bir hata oluştu");
      }
    } catch (error) {
      alert("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto">
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sage" />
            AI İçerik Üretici
          </CardTitle>
          <CardDescription>
            İçerik fikrinizi yazın, Gemini sizin için Instagram uyumlu hale getirsin.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Input
            placeholder="Örn: Bel fıtığı egzersizleri hakkında bilgilendirici bir post..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="rounded-xl border-sage/20 focus-visible:ring-sage"
          />
          <Button 
            onClick={handleGenerate} 
            disabled={loading || !prompt}
            className="w-full rounded-xl shadow-lg shadow-sage/20 font-bold py-6"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "İçeriği Oluştur"
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardHeader>
            <CardTitle className="text-xl text-slate-800">{result.title}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-wrap text-slate-700">
              {result.caption}
            </div>
            <div className="flex flex-wrap gap-2">
              {result.hashtags?.map((tag: string) => (
                <span key={tag} className="text-xs font-medium text-sage-dark bg-sage/10 px-2 py-1 rounded-md">
                  {tag}
                </span>
              ))}
            </div>
            <div className="text-sm text-slate-500 italic mt-2 border-t pt-4">
              <strong>Görsel Önerisi:</strong> {result.imageDescription}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
