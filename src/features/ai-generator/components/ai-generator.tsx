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

                <div className="flex gap-3 ml-auto opacity-0 animate-in fade-in slide-in-from-right-12 duration-1000 delay-300 fill-mode-forwards">
                  <Button variant="outline" size="default" className="rounded-2xl border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 shadow-sm transition-all" onClick={() => result && copyToClipboard(result.caption)}>
                    {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 mr-2 text-slate-400" />}
                    <span className="font-bold">{copied ? 'Kopyalandı' : 'Ham Metin'}</span>
                  </Button>
                  <Link href="/dashboard/editor">
                    <Button variant="default" size="default" className="rounded-2xl px-6 bg-gradient-to-r from-sage to-sage-dark hover:from-sage-dark hover:to-slate-900 border border-sage/50 text-white shadow-xl shadow-sage/30 hover:shadow-2xl hover:shadow-sage/40 transition-all group overflow-hidden relative">
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                      <span className="relative z-10 flex items-center font-bold tracking-wide">
                        Stüdyo'da Tasarla <ArrowRight className="ml-2 w-4 h-4 group-hover:-rotate-45 transition-transform" />
                      </span>
                    </Button>
                  </Link>
                </div>
              </div>

              <TabsContent value="preview" className="m-0">
                <Card className="overflow-hidden border-none shadow-2xl rounded-[40px] bg-gradient-to-br from-slate-100 to-slate-200 p-12 flex justify-center relative">
                  {/* Dekoratif Arkaplan Blur */}
                  <div className="absolute top-10 left-10 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute bottom-10 right-10 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />

                  <div className="w-[340px] bg-white rounded-[40px] shadow-2xl overflow-hidden border-8 border-slate-100 relative z-10 transition-transform hover:scale-[1.02] duration-500">
                    <div className="p-4 flex items-center gap-3 border-b border-slate-50">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sage to-sage-dark flex items-center justify-center text-white text-xs font-bold shadow-md">Fizy</div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold">fizyososyal_klinik</span>
                        <span className="text-[9px] text-slate-500">Sponsorlu</span>
                      </div>
                      <div className="ml-auto w-1 h-3 flex flex-col justify-between items-center"><div className="w-1 h-1 bg-slate-400 rounded-full"></div><div className="w-1 h-1 bg-slate-400 rounded-full"></div><div className="w-1 h-1 bg-slate-400 rounded-full"></div></div>
                    </div>
                    {result?.generatedImageUrl ? (
                      <div className="aspect-square w-full relative bg-slate-900 overflow-hidden group">
                        <img src={result.generatedImageUrl} alt="AI Generated" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                        <div className="absolute bottom-3 left-3 flex gap-2 w-full pr-6">
                          <Badge className="text-[9px] bg-black/60 text-white border-white/20 backdrop-blur-md shadow-xl flex items-center gap-1.5 px-2.5 py-1">
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" /> AI Vision
                          </Badge>
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-[4/5] bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-8 text-center border-y border-slate-100">
                        <div className="flex flex-col gap-4 items-center">
                          <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center"><Sparkles className="w-8 h-8 text-sage" /></div>
                          <span className="text-sm font-bold text-slate-800 leading-snug">{result?.title}</span>
                        </div>
                      </div>
                    )}
                    <div className="p-4 flex flex-col gap-3">
                      <div className="flex gap-4 items-center">
                        <Instagram className="w-6 h-6 text-slate-800 transition-transform hover:scale-110 cursor-pointer" />
                        <MessageCircle className="w-6 h-6 text-slate-800 transition-transform hover:scale-110 cursor-pointer" />
                        <svg aria-label="Share Post" className="w-6 h-6 text-slate-800 transition-transform hover:scale-110 cursor-pointer" viewBox="0 0 24 24"><line fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" x1="22" x2="9.218" y1="3" y2="10.083"></line><polygon fill="none" points="11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></polygon></svg>
                        <svg className="w-6 h-6 text-slate-800 ml-auto transition-transform hover:scale-110 cursor-pointer" viewBox="0 0 24 24"><polygon fill="none" points="20 21 12 13.44 4 21 4 3 20 3 20 21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></polygon></svg>
                      </div>
                      <div className="text-[12px] font-bold text-slate-900 flex items-center gap-2">
                        <div className="flex -space-x-1.5"><div className="w-4 h-4 rounded-full bg-slate-200 border border-white"></div><div className="w-4 h-4 rounded-full bg-slate-300 border border-white"></div></div>
                        <span>4.291 beğenme</span>
                      </div>
                      <div className="text-[12px] text-slate-800 leading-tight line-clamp-2 cursor-pointer hover:line-clamp-none transition-all">
                        <span className="font-bold mr-2">fizyososyal_klinik</span>
                        {result?.caption}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {result?.hashtags?.slice(0, 3).map((tag: string) => (
                          <span key={tag} className="text-[11px] text-blue-800/80 hover:text-blue-600 font-medium cursor-pointer">#{tag.replace('#', '')}</span>
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wide mt-1">1 DAKİKA ÖNCE</span>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="content" className="m-0">
                <Card className="glass-panel border-none shadow-sm rounded-[32px] overflow-hidden bg-white/70 backdrop-blur-3xl">
                  <ScrollArea className="h-[600px]">
                    <div className="p-8 lg:p-10 flex flex-col gap-10">

                      {/* En Tepe: Genel Skor ve Başlık */}
                      <div className="flex flex-col gap-6 items-start">
                        <div className="flex items-center gap-3">
                          <div className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Okunabilirlik: Yüksek</div>
                          <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> Hook Gücü: %94</div>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 leading-tight">{result?.title}</h2>
                      </div>

                      <Separator className="bg-slate-200" />

                      {/* Mikro-Kapsül Metin Merkezi */}
                      <section className="space-y-4">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          Instagram Açıklaması (Copy Pods)
                        </h4>
                        <div className="grid grid-cols-1 gap-4">
                          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative group hover:border-slate-300 transition-colors">
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="secondary" size="sm" className="h-8 rounded-lg shadow-sm" onClick={() => result && result.caption && copyToClipboard(result.caption)}><Copy className="w-3.5 h-3.5 mr-2" /> Kopyala</Button>
                            </div>
                            <p className="text-slate-800 text-[15px] leading-relaxed whitespace-pre-wrap pr-24 font-medium">{result?.caption}</p>
                          </div>
                        </div>
                      </section>

                      {/* Asimetrik Hashtag Haritası */}
                      <section className="space-y-4">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">Algoritma Anahtar Kelimeleri</h4>
                        <div className="flex flex-wrap gap-2.5">
                          {result?.hashtags?.map((tag: string, i: number) => (
                            <div key={tag} className={`px-4 py-2 rounded-xl border text-[12px] font-bold shadow-sm transition-all hover:-translate-y-0.5 ${i % 3 === 0 ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200'}`}>
                              {tag.includes('#') ? tag : `#${tag}`}
                            </div>
                          ))}
                        </div>
                      </section>

                    </div>
                  </ScrollArea>
                </Card>
              </TabsContent>

              <TabsContent value="thinking" className="m-0">
                <Card className="border-none shadow-2xl rounded-[32px] p-0 bg-[#0A0A0B] overflow-hidden border-t border-slate-800">
                  <div className="bg-slate-900/50 p-4 border-b border-slate-800 flex items-center gap-3">
                    <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500"></div><div className="w-3 h-3 rounded-full bg-yellow-500"></div><div className="w-3 h-3 rounded-full bg-green-500"></div></div>
                    <span className="text-[10px] uppercase font-mono text-slate-500 tracking-widest ml-4">Neural_Decision_Tree_v3.1.log</span>
                  </div>

                  <div className="p-8 flex flex-col gap-6">
                    {/* Node Tree UI */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <span className="text-[10px] text-slate-400 font-mono">STEP 01</span>
                        <span className="text-sm text-slate-200 font-bold">Klinik Semantik Analiz</span>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-2">
                        <Zap className="w-5 h-5 text-amber-400" />
                        <span className="text-[10px] text-slate-400 font-mono">STEP 02</span>
                        <span className="text-sm text-slate-200 font-bold">Ağrı Noktası (Pain-Point) Modeli</span>
                      </div>
                      <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-5 flex flex-col gap-2 relative overflow-hidden">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                        <span className="text-[10px] text-purple-300 font-mono">STEP 03 (GENERATIVE)</span>
                        <span className="text-sm text-white font-bold">Dil ve Ton Sentezi</span>
                        <div className="absolute right-0 bottom-0 w-16 h-16 bg-purple-500/20 rounded-full blur-xl"></div>
                      </div>
                    </div>

                    <div className="p-6 bg-black/40 rounded-2xl border border-white/5 font-mono text-sm text-emerald-300/80 leading-relaxed whitespace-pre-wrap">
                      <span className="text-slate-500 select-none">{'> '}</span>
                      {(result as any)?.thinking || "Yapay zeka bu içerikte hastanın endişelerini giderecek ve 'Bilişsel Güven' (Cognitive Trust) endeksini maksimize edecek kelime dizilimlerini seçti. Karmaşık medikal jargondan kaçınıldı."}
                      <span className="animate-pulse inline-block w-2.5 h-4 bg-emerald-400 align-middle ml-2"></span>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="strategy" className="m-0">
                <Card className="glass-panel border-none shadow-sm rounded-[32px] p-8 lg:p-10 bg-white/80 backdrop-blur-3xl min-h-[500px]">
                  <div className="flex flex-col gap-10">
                    {/* CMO Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                      <div>
                        <h4 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                          <Target className="w-6 h-6 text-indigo-600" /> CMO Dashboard
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">İçeriğinizin büyüme, etkileşim ve klinik pazarlama metrikleri.</p>
                      </div>
                      <Button variant="default" className="rounded-xl shadow-lg bg-indigo-950 hover:bg-indigo-900 px-6">
                        <Calendar className="w-4 h-4 mr-2" /> Yayın Takvimine Planla
                      </Button>
                    </div>

                    {/* Metrikler (Barlar) */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                      {/* Sol Kolon: Barlar */}
                      <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between text-xs font-bold text-slate-700"><span>Bilişsel Güven Endeksi</span><span className="text-emerald-600">%94</span></div>
                          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full w-[94%]" /></div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between text-xs font-bold text-slate-700"><span>Kaydetme Potansiyeli (Eğiticilik)</span><span className="text-indigo-600">%88</span></div>
                          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 rounded-full w-[88%]" /></div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between text-xs font-bold text-slate-700"><span>Viral Etkileşim İhtimali</span><span className="text-amber-600">%72</span></div>
                          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-amber-500 rounded-full w-[72%]" /></div>
                        </div>
                      </div>

                      {/* Sağ Kolon: Kartlar */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-1 justify-center relative overflow-hidden group">
                          <div className="absolute right-[-10px] bottom-[-10px] opacity-5 group-hover:scale-110 transition-transform"><Clock className="w-20 h-20" /></div>
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Altın Saat</span>
                          <span className="text-lg font-black text-slate-800">{result?.strategy?.bestTimeToPost || "Salı, 19:30"}</span>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-1 justify-center relative overflow-hidden group">
                          <div className="absolute right-[-10px] bottom-[-10px] opacity-5 group-hover:scale-110 transition-transform"><Zap className="w-20 h-20" /></div>
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Erişim T.</span>
                          <span className="text-lg font-black text-slate-800">{result?.strategy?.potentialReach || "3.5k+"}</span>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-1 justify-center col-span-2">
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Stratejik Kategori / Pillar</span>
                          <span className="text-sm font-bold text-slate-700 leading-tight">{result?.strategy?.contentPillar || "Hasta Bilinçlendirme & Çözüm"}</span>
                        </div>
                      </div>
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
