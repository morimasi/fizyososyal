"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Sparkles, 
  Loader2, 
  Instagram, 
  Layers, 
  Settings2, 
  Copy, 
  ArrowRight, 
  CheckCircle2,
  Volume2,
  FileVideo,
  LayoutGrid,
  MessageCircle,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { 
  useStudioStore, 
  ContentType, 
  ContentTone,
  TargetAudience,
  PostLength,
  CallToActionType 
} from "@/features/studio/store/studio.store";
import Link from "next/link";

export function AIGenerator() {
  const { 
    prompt, setPrompt, 
    contentType, setContentType, 
    tone, setTone, 
    language, setLanguage,
    targetAudience, setTargetAudience,
    postLength, setPostLength,
    callToActionType, setCallToActionType,
    useEmojis, setUseEmojis,
    aiContent: result, setAIContent: setResult,
    isGenerating: loading, setIsGenerating: setLoading
  } = useStudioStore();

  const [copied, setCopied] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          prompt, type: contentType, tone, language,
          targetAudience, postLength, callToActionType, useEmojis
        }),
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

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Settings Panel */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <Card className="glass-panel border-sage/20 shadow-xl overflow-hidden">
          <div className="bg-sage/5 p-4 border-b border-sage/10 flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-sage-dark" />
            <span className="text-xs font-bold text-sage-dark uppercase tracking-tight">Stüdyo Yapılandırması</span>
          </div>
          <CardContent className="p-6 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">İçerik Hedefi</label>
              <Input
                placeholder="Örn: Bel fıtığı egzersizleri..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="rounded-xl border-sage/20 focus-visible:ring-sage h-12"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Format</label>
                <Select value={contentType} onValueChange={(v) => setContentType(v as ContentType)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="post">Single Post</SelectItem>
                    <SelectItem value="carousel">Carousel</SelectItem>
                    <SelectItem value="reels">Reels Script</SelectItem>
                    <SelectItem value="ad">Klinik Reklamı</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tonlama</label>
                <Select value={tone} onValueChange={(v) => setTone(v as ContentTone)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Profesyonel</SelectItem>
                    <SelectItem value="friendly">Samimi</SelectItem>
                    <SelectItem value="scientific">Bilimsel</SelectItem>
                    <SelectItem value="motivational">Motive Edici</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dil</label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tr">Türkçe</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Button 
                variant="ghost" 
                className="flex items-center justify-between w-full rounded-xl text-slate-500 hover:text-sage-dark bg-slate-50 hover:bg-sage/10 h-10 px-4 text-xs font-bold"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                Gelişmiş Ayarlar (Hedef Kitle, CTA...) 
                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </div>

            {showAdvanced && (
              <div className="flex flex-col gap-4 p-4 bg-slate-50/50 rounded-xl border border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Hedef Kitle</label>
                  <Select value={targetAudience} onValueChange={(v) => setTargetAudience(v as TargetAudience)}>
                    <SelectTrigger className="rounded-xl h-9 text-xs bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">Genel / Herkes</SelectItem>
                      <SelectItem value="athletes">Sporcular</SelectItem>
                      <SelectItem value="elderly">Yaşlılar / İleri Yaş</SelectItem>
                      <SelectItem value="office_workers">Ofis Çalışanları</SelectItem>
                      <SelectItem value="women_health">Kadın Sağlığı</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">İçerik Uzunluğu</label>
                    <Select value={postLength} onValueChange={(v) => setPostLength(v as PostLength)}>
                      <SelectTrigger className="rounded-xl h-9 text-xs bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="short">Kısa ve Öz</SelectItem>
                        <SelectItem value="medium">Orta / Standart</SelectItem>
                        <SelectItem value="long">Uzun ve Detaylı</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Aksiyon Çağrısı (CTA)</label>
                    <Select value={callToActionType} onValueChange={(v) => setCallToActionType(v as CallToActionType)}>
                      <SelectTrigger className="rounded-xl h-9 text-xs bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="appointment">Randevu Al</SelectItem>
                        <SelectItem value="comment">Yorum Yap / Soru Sor</SelectItem>
                        <SelectItem value="save">Kaydet</SelectItem>
                        <SelectItem value="share">Arkadaşınla Paylaş</SelectItem>
                        <SelectItem value="dm">DM Gönder</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Emoji Kullanımı</span>
                  <Button 
                    variant={useEmojis ? "default" : "outline"}
                    size="sm" 
                    className={`h-7 px-3 text-[10px] rounded-lg ${useEmojis ? "bg-sage hover:bg-sage-dark" : ""}`}
                    onClick={() => setUseEmojis(!useEmojis)}
                  >
                    {useEmojis ? "Açık 🤩" : "Kapalı"}
                  </Button>
                </div>
              </div>
            )}

            <Button 
              onClick={handleGenerate} 
              disabled={loading || !prompt}
              className="w-full rounded-2xl shadow-lg shadow-sage/30 font-bold py-8 relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center gap-2">
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
                    İçeriği Sihirle Oluştur
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-sage-dark to-sage opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
          </CardContent>
        </Card>

        {/* AI Insight Card */}
        <Card className="bg-orchid/5 border-orchid/20">
          <CardContent className="p-4 flex gap-3">
            <div className="bg-orchid/20 p-2 rounded-lg h-fit">
              <Sparkles className="w-4 h-4 text-orchid-dark" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-orchid-dark">AI İpucu</span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Fizyoterapi içeriklerinde "Önce-Sonra" yerine "Süreç Odaklı" anlatımlar %40 daha fazla etkileşim alıyor.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Studio Area */}
      <div className="lg:col-span-8">
        {!result && !loading ? (
          <div className="h-[500px] border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400 gap-4 bg-slate-50/50">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center">
              <Layers className="w-8 h-8 text-slate-200" />
            </div>
            <p className="font-medium">Yapılandırmayı seçin ve sihirli butona basın.</p>
          </div>
        ) : loading ? (
          <div className="h-[500px] glass-panel rounded-3xl flex flex-col items-center justify-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-sage/20 border-t-sage rounded-full animate-spin"></div>
              <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-sage animate-pulse" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <h3 className="font-bold text-slate-800">İçerik Hazırlanıyor...</h3>
              <p className="text-sm text-slate-500 animate-bounce italic text-center max-w-[250px]">
                Bilimsel makaleler taranıyor ve stratejik kancalar ekleniyor.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-8 duration-700">
            <Tabs defaultValue="preview" className="w-full">
              <div className="flex items-center justify-between mb-4">
                <TabsList className="bg-slate-100 rounded-xl p-1 h-12">
                  <TabsTrigger value="preview" className="rounded-lg px-6 flex items-center gap-2">
                    <Instagram className="w-4 h-4" /> Önizleme
                  </TabsTrigger>
                  <TabsTrigger value="content" className="rounded-lg px-6 flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4" /> Detaylar
                  </TabsTrigger>
                  {contentType === 'reels' && (
                    <TabsTrigger value="script" className="rounded-lg px-6 flex items-center gap-2">
                      <FileVideo className="w-4 h-4" /> Senaryo
                    </TabsTrigger>
                  )}
                </TabsList>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => result && copyToClipboard(result.caption)}>
                    {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                  <Link href="/dashboard/editor">
                    <Button variant="default" size="sm" className="bg-sage hover:bg-sage-dark">
                      Editöre Gönder <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>

              <TabsContent value="preview" className="m-0">
                <Card className="overflow-hidden border-none shadow-2xl rounded-3xl bg-slate-100 p-8 flex justify-center">
                  <div className="w-[320px] bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
                    <div className="p-3 flex items-center gap-2 border-b border-slate-50">
                      <div className="w-8 h-8 rounded-full bg-sage flex items-center justify-center text-white text-[10px] font-bold">F</div>
                      <span className="text-[11px] font-bold">klinik_fizyoterapi</span>
                    </div>
                    {result?.generatedImageUrl ? (
                      <div className="aspect-square w-full relative bg-slate-100 overflow-hidden">
                        <img 
                          src={result.generatedImageUrl} 
                          alt="AI Generated" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    ) : (
                      <div className="aspect-square bg-slate-100 flex items-center justify-center p-6 text-center">
                        <div className="flex flex-col gap-2">
                          <Sparkles className="w-6 h-6 text-sage mx-auto" />
                          <span className="text-xs font-bold text-slate-800 px-4">{result?.title}</span>
                        </div>
                      </div>
                    )}
                    <div className="p-3 flex flex-col gap-2">
                      <div className="flex gap-3 items-center">
                        <Instagram className="w-5 h-5 text-slate-700" />
                        <MessageCircle className="w-5 h-5 text-slate-700" />
                        <Sparkles className="w-5 h-5 text-sage" />
                      </div>
                      <div className="text-[11px] text-slate-800 leading-tight line-clamp-3">
                        <span className="font-bold mr-1">klinik_fizyoterapi</span>
                        {result?.caption}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {result?.hashtags?.slice(0, 3).map((tag: string) => (
                          <span key={tag} className="text-[10px] text-blue-600">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="content" className="m-0">
                <Card className="glass-panel border-none shadow-sm rounded-3xl overflow-hidden">
                  <ScrollArea className="h-[500px]">
                    <div className="p-8 flex flex-col gap-8">
                      <section>
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-sage" /> Başlık ve Strateji
                        </h4>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          <p className="font-bold text-lg text-slate-700">{result?.title}</p>
                          <Badge variant="outline" className="mt-2 text-sage-dark border-sage/30 bg-sage/5 uppercase text-[10px]">
                            {tone} Tonlama
                          </Badge>
                        </div>
                      </section>

                      <section>
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-sage" /> Instagram Açıklaması
                        </h4>
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 whitespace-pre-wrap text-slate-700 leading-relaxed italic">
                          {result?.caption}
                        </div>
                      </section>

                      <section>
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">Anahtar Kelimeler</h4>
                        <div className="flex flex-wrap gap-2">
                          {result?.hashtags?.map((tag: string) => (
                            <Badge key={tag} variant="secondary" className="rounded-lg bg-white border shadow-sm">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </section>

                      {result?.suggestedMusic && (
                        <section>
                          <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Volume2 className="w-4 h-4 text-orchid" /> Önerilen Ses
                          </h4>
                          <div className="bg-orchid/5 p-4 rounded-2xl border border-orchid/10 text-orchid-dark font-medium text-sm">
                            {result?.suggestedMusic}
                          </div>
                        </section>
                      )}
                    </div>
                  </ScrollArea>
                </Card>
              </TabsContent>

              {result?.reelsScript && (
                <TabsContent value="script" className="m-0">
                  <Card className="glass-panel border-none shadow-sm rounded-3xl p-8">
                    <div className="flex flex-col gap-4">
                      {Object.entries(result.reelsScript).map(([key, scene]: [string, any]) => (
                        <div key={key} className="flex gap-4 p-4 rounded-2xl border bg-white/50">
                          <div className="bg-sage/10 text-sage-dark font-bold text-xs p-2 rounded-lg h-fit">
                            {scene.duration || key}
                          </div>
                          <div className="flex flex-col gap-2">
                            <div className="text-xs font-bold uppercase text-slate-400 tracking-wider">Aksiyon</div>
                            <p className="text-sm text-slate-700">{scene.action || scene}</p>
                            {scene.voiceover && (
                              <>
                                <Separator className="my-2" />
                                <div className="text-xs font-bold uppercase text-orchid-dark tracking-wider">Seslendirme</div>
                                <p className="text-sm text-slate-600 italic">"{scene.voiceover}"</p>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}
