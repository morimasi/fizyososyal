import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";
import { AnalyticsSummary } from "@/features/analytics/components/analytics-summary";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">
            Hoş Geldiniz, {session?.user?.name?.split(" ")[0] || "Dr. Fizyoterapist"}
          </h1>
          <p className="text-slate-500 mt-1">Klinik performansınız ve içerik planınız tek bir yerde.</p>
        </div>
        <Link href="/dashboard/studio">
          <Button size="lg" className="shadow-lg shadow-sage/20 rounded-2xl">
            + Yeni İçerik Oluştur
          </Button>
        </Link>
      </div>

      <AnalyticsSummary />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        <Card className="hover:border-sage transition-colors duration-300">
          <CardHeader>
            <CardTitle>AI İçerik Asistanı</CardTitle>
            <CardDescription>Metin, görsel ve video fikirleri üretin.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full h-32 bg-sage/10 rounded-lg flex items-center justify-center animate-pulse">
              <span className="text-sage text-2xl">✨</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-orchid transition-colors duration-300">
          <CardHeader>
            <CardTitle>Reels Stüdyosu</CardTitle>
            <CardDescription>Animasyonlu video ve rehberler.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full h-32 bg-orchid/10 rounded-lg flex items-center justify-center">
              <span className="text-orchid text-2xl">📱</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-aquamarine transition-colors duration-300">
          <CardHeader>
            <CardTitle>Planlama & Yayım</CardTitle>
            <CardDescription>Instagram'da zamanlanmış paylaşımlar.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full h-32 bg-aquamarine/10 rounded-lg flex items-center justify-center">
              <span className="text-aquamarine text-2xl">📅</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
