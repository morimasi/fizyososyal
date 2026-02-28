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
  ChevronUp,
  Calendar,
  Zap,
  Target,
  BarChart3,
  Clock
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
    enhancedPrompt, setEnhancedPrompt,
    contentType, setContentType,
    tone, setTone,
    language, setLanguage,
    targetAudience, setTargetAudience,
    postLength, setPostLength,
    callToActionType, setCallToActionType,
    useEmojis, setUseEmojis,
    aiContent: result, setAIContent: setResult,
    isGenerating: loading, setIsGenerating: setLoading,
    isEnriching, setIsEnriching
  } = useStudioStore();

  const [copied, setCopied] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleEnrichPrompt = async () => {
    if (!prompt) return;
    setIsEnriching(true);
    try {
      const response = await fetch("/api/ai/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      if (data.success) {
        setEnhancedPrompt(data.data);
        setPrompt(data.data); // Promptu da güncelle ki kullanıcı görsün
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsEnriching(false);
    }
  };

  const handleGenerate = async () => {
    const finalPrompt = enhancedPrompt || prompt;
    if (!finalPrompt) return;
    setLoading(true);
    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: finalPrompt, type: contentType, tone, language,
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
          <div className="bg-sage/5 p-4 border-b border-sage/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-sage-dark" />
              <span className="text-xs font-bold text-sage-dark uppercase tracking-tight">Stüdyo Yapılandırması</span>
            </div>
            <Badge variant="outline" className="text-[10px] bg-purple-50 text-purple-600 border-purple-100">Gemini 3.1 Pro</Badge>
          </div>
          <CardContent className="p-6 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">İçerik Hedefi</label>
                <div className="flex gap-1">
                  <Badge variant="secondary" className="text-[9px] h-5 bg-blue-50 text-blue-600 border-none">Multimodal</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[10px] text-purple-600 hover:text-purple-700 hover:bg-purple-50 gap-1 px-2"
                    onClick={handleEnrichPrompt}
                    disabled={isEnriching || !prompt}
                  >
                    {isEnriching ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    Prompt Sihirbazı
                  </Button>
                </div>
              </div>
              <textarea
                placeholder="Örn: Bel fıtığı egzersizleri..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="rounded-xl border border-sage/20 p-3 min-h-[100px] text-sm focus:ring-1 focus:ring-sage outline-none resize-none transition-all"
              />
              <p className="text-[10px] text-slate-400 italic">Sihirbazı kullanarak isteminizi ultra profesyonel hale getirebilirsiniz.</p>
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
                    <SelectItem value="carousel">Carousel (Slide)</SelectItem>
                    <SelectItem value="reels">Reels / Video</SelectItem>
                    <SelectItem value="ad">Klinik Reklamı</SelectItem>
                    <SelectItem value="thread">X/Tweet Thread</SelectItem>
                    <SelectItem value="story">Instagram Story</SelectItem>
                    <SelectItem value="article">Blog Makalesi</SelectItem>
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
                    <SelectItem value="scientific">Bilimsel / Klinik</SelectItem>
                    <SelectItem value="motivational">Motive Edici</SelectItem>
                    <SelectItem value="empathetic">Empatik / Şefkatli</SelectItem>
                    <SelectItem value="bold">Cesur / İddialı</SelectItem>
                    <SelectItem value="educational">Eğitici / Öğretici</SelectItem>
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
                      <SelectItem value="chronic_pain">Kronik Ağrı</SelectItem>
                      <SelectItem value="post_op">Ameliyat Sonrası</SelectItem>
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
              <h3 className="font-bold text-slate-800">Stratejik Akıl Yürütme Aktif...</h3>
              <p className="text-sm text-slate-500 animate-bounce italic text-center max-w-[250px]">
                Gemini 3.1 Pro; klinik verileri ve sosyal medya trendlerini analiz ediyor.
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
                  <TabsTrigger value="strategy" className="rounded-lg px-6 flex items-center gap-2">
                    <Target className="w-4 h-4" /> Strateji
                  </TabsTrigger>
                  <TabsTrigger value="thinking" className="rounded-lg px-6 flex items-center gap-2 text-purple-600">
                    <Sparkles className="w-4 h-4" /> Zihin Haritası
                  </TabsTrigger>
                  {contentType === 'reels' && (
                    <TabsTrigger value="script" className="rounded-lg px-6 flex items-center gap-2">
                      <FileVideo className="w-4 h-4" /> Senaryo
                    </TabsTrigger>
                  )}
                  {(contentType === 'reels' || contentType === 'story') && (
                    <TabsTrigger value="video" className="rounded-lg px-6 flex items-center gap-2 text-blue-600">
                      <FileVideo className="w-4 h-4" /> Video AI
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
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080"><rect width="1080" height="1080" fill="%23f1f5f9"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="32" fill="%2394a3b8">Görsel Yüklenemedi</text></svg>';
                          }}
                        />
                        {/* Görsel kaynak badge */}
                        <div className="absolute bottom-2 right-2">
                          <Badge className="text-[9px] bg-black/60 text-white border-none backdrop-blur-sm">
                            ✨ Gemini 3.1 Flash Image
                          </Badge>
                        </div>
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

              <TabsContent value="thinking" className="m-0">
                <Card className="border-none shadow-sm rounded-3xl p-8 bg-purple-50/30 border-purple-100">
                  <div className="flex flex-col gap-6">
                    <h4 className="text-sm font-black text-purple-800 uppercase tracking-widest flex items-center gap-2">
                      <Sparkles className="w-4 h-4" /> AI Stratejik Akıl Yürütme
                    </h4>
                    <div className="p-6 bg-white rounded-2xl border border-purple-100 italic text-purple-900 leading-relaxed">
                      {(result as any)?.thinking || "AI bu içeriği oluştururken klinik verileri ve sosyal medya trendlerini analiz etti."}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white/50 rounded-xl border border-purple-100">
                        <div className="text-[10px] font-bold text-purple-400 uppercase">Analiz Modu</div>
                        <div className="text-xs font-bold text-purple-700">Multimodal Thinking v2</div>
                      </div>
                      <div className="p-4 bg-white/50 rounded-xl border border-purple-100">
                        <div className="text-[10px] font-bold text-purple-400 uppercase">Tasarım Zekası</div>
                        <div className="text-xs font-bold text-purple-700">Generative Logic</div>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="strategy" className="m-0">
                <Card className="glass-panel border-none shadow-sm rounded-3xl p-8">
                  <div className="flex flex-col gap-8">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-sage" /> İçerik Stratejisi & Planlama
                      </h4>
                      <Button variant="outline" size="sm" className="rounded-xl gap-2 border-sage/30 text-sage" onClick={() => alert("Takvime Planlandı!")}>
                        <Calendar className="w-4 h-4" /> Takvime Planla
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-sage/10 flex items-center justify-center text-sage">
                            <Target className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase">İçerik Sütunu (Pillar)</div>
                            <div className="text-sm font-bold text-slate-700">{result?.strategy?.contentPillar || "Eğitici / Klinik Bilgi"}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                            <Clock className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase">En İyi Paylaşım Zamanı</div>
                            <div className="text-sm font-bold text-slate-700">{result?.strategy?.bestTimeToPost || "Salı, 19:30"}</div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500">
                            <Zap className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase">Tahmini Erişim</div>
                            <div className="text-sm font-bold text-slate-700">{result?.strategy?.potentialReach || "2.5k - 4.0k"}</div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <div className="text-[10px] font-bold text-slate-400 uppercase">Stratejik Anahtar Kelimeler</div>
                          <div className="flex flex-wrap gap-1">
                            {(result?.strategy?.targetKeywords || ["fizyoterapi", "sağlık", "rehabilitasyon"]).map((kw: string) => (
                              <Badge key={kw} variant="outline" className="text-[10px] bg-white">{kw}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-orchid/5 p-6 rounded-2xl border border-orchid/10">
                      <h5 className="text-xs font-bold text-orchid-dark mb-2 flex items-center gap-2">
                        <Sparkles className="w-3 h-3" /> AI Strateji Notu
                      </h5>
                      <p className="text-xs text-slate-600 leading-relaxed italic">
                        Bu içerik, seçtiğiniz hedef kitle için "Bilişsel Güven" tetikleyicilerini kullanacak şekilde yapılandırılmıştır.
                        Önerilen paylaşım saatinde etkileşim oranı, kitlemizin aktiflik verilerine göre %22 daha yüksektir.
                      </p>
                    </div>
                  </div>
                </Card>
              </TabsContent>
              {/* Veo 3.1 / Flow / Whisk Bilgi Kartı */}
              {(contentType === 'reels' || contentType === 'story') && (
                <TabsContent value="video" className="m-0">
                  <div className="flex flex-col gap-4 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border border-blue-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                        <FileVideo className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-blue-900">Veo 3.1 ile Video Üretimi</h4>
                        <p className="text-[10px] text-blue-500">Google DeepMind — En Gelişmiş Video AI Modeli</p>
                      </div>
                      <Badge className="ml-auto text-[9px] bg-green-100 text-green-700 border-green-200">Ücretsiz Erişim</Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <a href="https://flow.google" target="_blank" rel="noreferrer"
                        className="flex flex-col gap-2 p-4 bg-white rounded-2xl border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all group">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                          <Sparkles className="w-4 h-4 text-indigo-600" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-700">Flow</span>
                        <span className="text-[10px] text-slate-400 leading-tight">AI Filmmaking Suite — Metin → Video</span>
                      </a>
                      <a href="https://labs.google/whisk" target="_blank" rel="noreferrer"
                        className="flex flex-col gap-2 p-4 bg-white rounded-2xl border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all group">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                          <Zap className="w-4 h-4 text-purple-600" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-700">Whisk Animate</span>
                        <span className="text-[10px] text-slate-400 leading-tight">Fotoğraf → Animasyon (Veo 3)</span>
                      </a>
                      <a href="https://deepmind.google/technologies/veo/" target="_blank" rel="noreferrer"
                        className="flex flex-col gap-2 p-4 bg-white rounded-2xl border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all group">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                          <BarChart3 className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-700">Veo 3.1</span>
                        <span className="text-[10px] text-slate-400 leading-tight">720p/1080p, native ses, 4–8 sn</span>
                      </a>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-white/70 rounded-2xl border border-blue-100">
                      <Clock className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-[11px] font-bold text-blue-800">Ücretsiz Plan: Aylık 100 kredi</p>
                        <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5">
                          Her kredi 4–8 saniyelik video üretir. Ücretsiz planda SynthID filigranı eklenir.
                          AI&apos;nın oluşturduğu metni ve görseli Veo&apos;ya prompt olarak kopyalayabilirsiniz.
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}
