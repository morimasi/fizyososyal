import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Activity, Zap, Shield, Sparkles } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white selection:bg-violet-500/30">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-teal-400 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Activity className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight">PhysioSocial <span className="text-violet-400">AI</span></span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <Link href="#features" className="hover:text-white transition-colors">Özellikler</Link>
            <Link href="#about" className="hover:text-white transition-colors">Nasıl Çalışır?</Link>
            <Link href="/login" className="px-5 py-2 rounded-full border border-white/10 hover:bg-white/5 transition-all">Giriş Yap</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <section className="relative py-24 lg:py-32 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-violet-600/10 blur-[120px] rounded-full -z-10" />
          <div className="container mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold mb-6 animate-fade-in">
              <Sparkles className="w-3 h-3" />
              <span>Yapay Zeka Destekli Fizyoterapi Asistanı</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
              Kliniğinizin Sosyal Medya Gücünü <br />
              <span className="bg-gradient-to-r from-violet-400 via-teal-300 to-blue-500 bg-clip-text text-transparent">Yapay Zeka</span> ile Katlayın
            </h1>
            <p className="text-lg lg:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Fizyoterapistler için özel olarak tasarlanmış AI motoruyla profesyonel içerikler üretin,
              paylaşımlarınızı planlayın ve hastalarınızla olan etkileşiminizi artırın.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login">
                <Button variant="primary" size="lg" className="h-14 px-10 text-lg rounded-2xl shadow-xl shadow-violet-600/20">
                  Hemen Ücretsiz Başlayın
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="ghost" size="lg" className="h-14 px-10 text-lg rounded-2xl border border-white/10">
                  Özellikleri Keşfet
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Preview */}
        <section id="features" className="py-24 bg-white/5 backdrop-blur-sm border-t border-white/5">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card glow className="p-8 border-violet-500/20">
                <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mb-6">
                  <Zap className="text-violet-400 w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Akıllı İçerik Üretimi</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Tıbbi doğruluk payı yüksek, profesyonel egzersiz ve bilgilendirme postlarını saniyeler içinde hazırlayın.
                </p>
              </Card>

              <Card className="p-8 border-teal-500/20">
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center mb-6">
                  <Activity className="text-teal-400 w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Sesli Komut Desteği</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  "Bel fıtığı için 3 egzersiz videosu hazırla" demeniz yeterli. AI asistanınız sizin için her şeyi halleder.
                </p>
              </Card>

              <Card className="p-8 border-blue-500/20">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6">
                  <Shield className="text-blue-400 w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Klinik Marka Yönetimi</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Tüm paylaşımlarınıza logonuzu otomatik ekleyin ve klinik ses tonunuzu (Brand Voice) koruyun.
                </p>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 text-center text-slate-500 text-sm">
        <p>&copy; 2026 PhysioSocial AI. Tüm hakları saklıdır. bbma</p>
      </footer>
    </div>
  );
}
