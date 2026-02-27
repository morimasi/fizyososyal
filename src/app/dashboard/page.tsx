import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";
import { AnalyticsSummary } from "@/features/analytics/components/analytics-summary";
import Link from "next/link";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Clock, CheckCircle, FileText } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  
  const recentPosts = session?.user?.id 
    ? await db.query.posts.findMany({
        where: eq(posts.userId, session.user.id),
        orderBy: [desc(posts.createdAt)],
        limit: 5
      })
    : [];

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-sage" /> Son Etkinlikler
              </CardTitle>
              <CardDescription>Oluşturduğunuz son içeriklerin durumu.</CardDescription>
            </CardHeader>
            <CardContent>
              {recentPosts.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {recentPosts.map((post) => (
                    <div key={post.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white/50">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center text-slate-400">
                          {post.type === 'post' ? <FileText className="w-6 h-6" /> : '📱'}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-700 text-sm truncate max-w-[200px]">
                            {post.caption || "Başlıksız İçerik"}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(post.createdAt).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {post.status === 'published' && (
                          <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Paylaşıldı
                          </span>
                        )}
                        {post.status === 'scheduled' && (
                          <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Planlandı
                          </span>
                        )}
                        {post.status === 'draft' && (
                          <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                             Taslak
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 text-sm italic">
                  Henüz bir içerik oluşturmadınız.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card className="hover:border-sage transition-colors duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-md">Hızlı Erişim</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Link href="/dashboard/studio">
                <Button variant="ghost" className="w-full justify-start text-sm h-12">✨ AI İçerik Üretici</Button>
              </Link>
              <Link href="/dashboard/editor">
                <Button variant="ghost" className="w-full justify-start text-sm h-12">🎨 Görsel Editör</Button>
              </Link>
              <Link href="/dashboard/calendar">
                <Button variant="ghost" className="w-full justify-start text-sm h-12">📅 İçerik Takvimi</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
