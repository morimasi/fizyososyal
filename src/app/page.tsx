import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 relative overflow-hidden">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex flex-col gap-6">
        {/* Hero Section */}
        <div className="glass-panel rounded-3xl p-12 text-center w-full max-w-2xl mx-auto flex flex-col items-center gap-6 relative transition-transform hover:scale-[1.02] duration-500">
          <div className="bg-sage/10 text-sage-dark px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase border border-sage/20">
            Fizyososyal v2.0
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight leading-tight">
            İyileşmenin Gücünü <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sage to-orchid">Yapay Zeka</span> ile Paylaşın.
          </h1>
          <p className="text-slate-600 text-lg">
            Saniyeler içinde profesyonel Instagram postları, rehberler ve hasta hikayeleri oluşturun.
          </p>
          <div className="flex gap-4 mt-4">
            <Link href="/login">
              <button className="bg-sage text-white px-8 py-3 rounded-2xl font-semibold shadow-lg shadow-sage/30 hover:bg-sage-dark transition-all hover:-translate-y-1">
                Ücretsiz Başla
              </button>
            </Link>
            <button className="bg-white/50 backdrop-blur text-slate-700 px-8 py-3 rounded-2xl font-semibold border border-white/50 hover:bg-white transition-all">
              Nasıl Çalışır?
            </button>
          </div>
        </div>

        {/* Floating Elements / Micro-interactions Demo */}
        <div className="absolute top-1/4 left-[10%] w-24 h-24 bg-orchid/30 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-[10%] w-32 h-32 bg-aquamarine/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
    </main>
  );
}
