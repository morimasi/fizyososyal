import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Activity, Zap, Shield, Sparkles, ArrowRight, Brain, Smartphone, Globe, CheckCircle2 } from "lucide-react";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#050505] text-white selection:bg-violet-500/30 overflow-x-hidden">
      {/* Header - Glassmorphism */}
      <header className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl z-50 border border-white/5 bg-black/40 backdrop-blur-2xl rounded-2xl shadow-2xl">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Activity className="text-white w-5 h-5" />
            </div>
            <span className="text-lg font-black tracking-tighter">
              PhysioSocial <span className="text-violet-500">AI</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-[13px] font-bold uppercase tracking-widest text-slate-400">
            <Link href="#features" className="hover:text-white transition-colors">Özellikler</Link>
            <Link href="#how-it-works" className="hover:text-white transition-colors">Teknoloji</Link>
            <Link href="/login" className="px-5 py-2 rounded-xl bg-white text-black hover:bg-slate-200 transition-all">
              Giriş
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section - Minimalist & Compact */}
        <section className="relative pt-40 pb-20 lg:pt-56 lg:pb-32 overflow-hidden px-6">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[120%] -z-10 opacity-40">
            <Image
              src="/hero-clinical.png"
              alt="Clinical AI Background"
              fill
              className="object-cover mask-gradient-to-b"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505]" />
          </div>

          <div className="container mx-auto max-w-5xl text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8 animate-in fade-in slide-in-from-top-4 duration-1000">
              <Sparkles className="w-3 h-3" />
              <span>Yeni Nesil Klinik Zeka</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black tracking-tighter mb-8 leading-[0.9] animate-fade-in-up">
              Fizyoterapistlerin <br />
              <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-teal-400 bg-clip-text text-transparent">Dijital İmzası</span>
            </h1>

            <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed font-medium animate-fade-in-up [animation-delay:200ms]">
              Yapay zeka ile güçlendirilmiş, klinik odaklı sosyal medya stüdyosu.
              Veriyle içeriği, teknolojiyle samimiyeti birleştirin.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up [animation-delay:400ms]">
              <Link href="/login" className="w-full sm:w-auto">
                <Button size="lg" className="h-14 px-10 text-base font-bold rounded-2xl shadow-2xl shadow-violet-600/20 bg-violet-600 hover:bg-violet-500 transition-all border-none w-full">
                  Başlayın <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <div className="flex -space-x-3 mt-4 sm:mt-0 sm:ml-6 items-center">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-slate-800 flex items-center justify-center text-[10px] overlow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900" />
                  </div>
                ))}
                <span className="ml-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider">+1,200 Klinik</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features - Bento Grid Style */}
        <section id="features" className="py-24 px-6 bg-gradient-to-b from-transparent to-black/40">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6">

              {/* Main Bento Card */}
              <div className="md:col-span-6 lg:col-span-8 p-10 rounded-[32px] bg-gradient-to-br from-violet-600/20 via-slate-900/40 to-black border border-white/5 flex flex-col justify-between group overflow-hidden relative">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-violet-600/10 blur-[100px] group-hover:bg-violet-600/20 transition-all" />
                <div>
                  <div className="w-12 h-12 rounded-xl bg-violet-600/20 flex items-center justify-center mb-8 border border-violet-500/20">
                    <Brain className="text-violet-400 w-6 h-6" />
                  </div>
                  <h3 className="text-3xl font-bold mb-4 tracking-tight">AI Senaryo Mühendisliği</h3>
                  <p className="text-slate-400 max-w-md leading-relaxed text-sm">
                    Fizyoterapi terminolojisine tam hakim AI motoru. Basit bir konuyu alıp, tıbbi doğruluğu yüksek ve etkileşim odaklı profesyonel bir senaryoya dönüştürür.
                  </p>
                </div>
                <div className="mt-12 flex items-center gap-4">
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-violet-500/50 to-transparent" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-violet-500">Gemini 1.5 Pro Destekli</span>
                </div>
              </div>

              {/* Small Card 1 */}
              <div className="md:col-span-3 lg:col-span-4 p-8 rounded-[32px] bg-white/[0.03] border border-white/5 hover:border-teal-500/30 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center mb-6">
                  <Zap className="text-teal-400 w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold mb-3">Ultra Hızlı Üretim</h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Post, video senaryosu ve hashtag seti. Saniyeler içinde sosyal medyaya hazır.
                </p>
              </div>

              {/* Small Card 2 */}
              <div className="md:col-span-3 lg:col-span-4 p-8 rounded-[32px] bg-white/[0.03] border border-white/5 hover:border-blue-500/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6">
                  <Smartphone className="text-blue-400 w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold mb-3">Çapraz Platform</h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Instagram, LinkedIn ve TikTok formatlarını tek tıkla simüle edin.
                </p>
              </div>

              {/* Wide Bento Card */}
              <div className="md:col-span-6 lg:col-span-8 p-10 rounded-[32px] bg-gradient-to-r from-black to-slate-900/60 border border-white/5 flex items-center justify-between gap-8 group">
                <div className="flex-1">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center mb-6 border border-white/5">
                    <Shield className="text-slate-400 w-5 h-5" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 tracking-tight">Klinik Güvenliği</h3>
                  <p className="text-slate-500 text-xs leading-relaxed max-w-xs">
                    Marka ses tonunuzu ve klinik kimliğinizi koruyan, kurumsal yapıda içerik denetimi.
                  </p>
                </div>
                <div className="hidden sm:grid grid-cols-2 gap-3 opacity-30 group-hover:opacity-60 transition-opacity">
                  <div className="w-16 h-16 rounded-xl bg-violet-500/20 border border-violet-500/20" />
                  <div className="w-16 h-16 rounded-xl bg-teal-500/20 border border-teal-500/20" />
                  <div className="w-16 h-16 rounded-xl bg-blue-500/20 border border-blue-500/20" />
                  <div className="w-16 h-16 rounded-xl bg-white/10 border border-white/20" />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 px-6">
          <div className="container mx-auto max-w-4xl p-16 rounded-[48px] bg-gradient-to-br from-violet-600 to-indigo-700 text-center relative overflow-hidden shadow-3xl shadow-violet-900/40">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />
            <h2 className="text-4xl sm:text-5xl font-black mb-6 tracking-tighter text-white">
              Kliniğinizi Dijital <br className="sm:hidden" /> Dünyaya Hazırlayın.
            </h2>
            <p className="text-violet-100/70 mb-10 text-sm sm:text-base font-medium max-w-md mx-auto">
              Modern fizyoterapi asistanıyla sosyal medya yönetimi hiç bu kadar profesyonel olmamıştı.
            </p>
            <Link href="/login">
              <Button size="lg" className="h-16 px-12 bg-white text-violet-600 hover:bg-slate-100 rounded-2xl shadow-xl font-black text-lg border-none">
                Hemen Katılın
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer - Minimal */}
      <footer className="py-12 border-t border-white/5 px-6">
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <Activity className="w-4 h-4" />
            <span className="text-xs font-bold tracking-widest uppercase">PhysioSocial AI</span>
          </div>
          <div className="flex gap-8 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
            <Link href="#" className="hover:text-white transition-colors">Destek</Link>
            <Link href="#" className="hover:text-white transition-colors">Gizlilik</Link>
            <Link href="#" className="hover:text-white transition-colors">Şartlar</Link>
          </div>
          <p className="text-[11px] text-slate-600 font-medium">
            &copy; 2026 Tüm Hakları Saklıdır.
          </p>
        </div>
      </footer>
    </div>
  );
}
