import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";
import { db } from "@/db";
import { posts, users } from "@/db/schema";
import { eq, desc, and, count } from "drizzle-orm";
import Link from "next/link";
import { 
  Sparkles, 
  FileText, 
  CheckCircle, 
  Clock, 
  Pencil, 
  Calendar,
  CreditCard,
  TrendingUp
} from "lucide-react";

async function getDashboardData(userId: string) {
  const [user, allPosts, publishedPosts, scheduledPosts, draftPosts] = await Promise.all([
    db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { aiCredits: true, name: true }
    }),
    db.query.posts.findMany({
      where: eq(posts.userId, userId),
      orderBy: [desc(posts.createdAt)],
      limit: 5
    }),
    db.select({ count: count() }).from(posts).where(and(eq(posts.userId, userId), eq(posts.status, 'published'))),
    db.select({ count: count() }).from(posts).where(and(eq(posts.userId, userId), eq(posts.status, 'scheduled'))),
    db.select({ count: count() }).from(posts).where(and(eq(posts.userId, userId), eq(posts.status, 'draft'))),
  ]);

  return {
    user,
    recentPosts: allPosts,
    stats: {
      total: (publishedPosts[0]?.count || 0) + (scheduledPosts[0]?.count || 0) + (draftPosts[0]?.count || 0),
      published: publishedPosts[0]?.count || 0,
      scheduled: scheduledPosts[0]?.count || 0,
      draft: draftPosts[0]?.count || 0,
      credits: user?.aiCredits || 0,
    }
  };
}

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h1 className="text-2xl font-bold text-slate-800">Giriş yapmalısınız</h1>
        <p className="text-slate-500 mt-2">Devam etmek için lütfen giriş yapın.</p>
      </div>
    );
  }

  const { user, recentPosts, stats } = await getDashboardData(session.user.id);

  const statCards = [
    { 
      label: "Toplam İçerik", 
      value: stats.total, 
      icon: FileText, 
      color: "bg-sage/10 text-sage",
      href: "/dashboard/posts"
    },
    { 
      label: "Paylaşıldı", 
      value: stats.published, 
      icon: CheckCircle, 
      color: "bg-green-100 text-green-600",
      href: "/dashboard/posts?status=published"
    },
    { 
      label: "Planlandı", 
      value: stats.scheduled, 
      icon: Clock, 
      color: "bg-blue-100 text-blue-600",
      href: "/dashboard/calendar"
    },
    { 
      label: "AI Kredisi", 
      value: stats.credits, 
      icon: Sparkles, 
      color: "bg-orchid/10 text-orchid",
      href: "/dashboard/credits"
    },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">
            Hoş Geldiniz, {user?.name?.split(" ")[0] || "Fizyoterapist"}
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Klinik içerikleriniz tek bir yerde.</p>
        </div>
        <Link href="/dashboard/studio">
          <Button size="sm" className="shadow-md rounded-xl bg-sage hover:bg-sage/90">
            <Sparkles className="w-4 h-4 mr-2" />
            Yeni İçerik
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map((stat, idx) => (
          <Link key={idx} href={stat.href}>
            <Card className="hover:border-sage/50 transition-all duration-200 cursor-pointer border-slate-200/60">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                      {stat.label}
                    </span>
                    <span className="text-xl font-bold text-slate-800 mt-1">
                      {stat.value}
                    </span>
                  </div>
                  <div className={`p-2 rounded-lg ${stat.color}`}>
                    <stat.icon className="w-4 h-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 border-slate-200/60">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-sage" />
                Son İçerikler
              </CardTitle>
              <Link href="/dashboard/posts" className="text-xs text-sage hover:underline font-medium">
                Tümünü gör →
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {recentPosts.length > 0 ? (
              <div className="flex flex-col gap-2">
                {recentPosts.map((post) => (
                  <div 
                    key={post.id} 
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-white rounded-md border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                        {post.type === 'reels' ? '🎬' : post.type === 'carousel' ? '🎠' : '📝'}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium text-slate-700 text-sm truncate max-w-[180px]">
                          {post.caption?.slice(0, 40) || "Başlıksız"}{post.caption && post.caption.length > 40 ? "..." : ""}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(post.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0">
                      {post.status === 'published' && (
                        <span className="bg-green-100 text-green-700 text-[10px] font-semibold px-2 py-1 rounded-full">
                          Paylaşıldı
                        </span>
                      )}
                      {post.status === 'scheduled' && (
                        <span className="bg-blue-100 text-blue-700 text-[10px] font-semibold px-2 py-1 rounded-full">
                          Planlandı
                        </span>
                      )}
                      {post.status === 'draft' && (
                        <span className="bg-slate-100 text-slate-500 text-[10px] font-semibold px-2 py-1 rounded-full">
                          Taslak
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400">Henüz içerik yok</p>
                <Link href="/dashboard/studio">
                  <Button variant="link" size="sm" className="text-sage">
                    İlk içeriğini oluştur →
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Hızlı İşlemler</CardTitle>
            <CardDescription className="text-xs">Sık kullanılan araçlar</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Link href="/dashboard/studio" className="block">
              <Button variant="outline" className="w-full justify-start text-sm h-10 border-slate-200 hover:border-sage hover:bg-sage/5">
                <Sparkles className="w-4 h-4 mr-2 text-orchid" />
                AI İçerik Üret
              </Button>
            </Link>
            <Link href="/dashboard/editor" className="block">
              <Button variant="outline" className="w-full justify-start text-sm h-10 border-slate-200 hover:border-sage hover:bg-sage/5">
                <Pencil className="w-4 h-4 mr-2 text-sage" />
                Görsel Editör
              </Button>
            </Link>
            <Link href="/dashboard/calendar" className="block">
              <Button variant="outline" className="w-full justify-start text-sm h-10 border-slate-200 hover:border-sage hover:bg-sage/5">
                <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                İçerik Takvimi
              </Button>
            </Link>
            <Link href="/dashboard/credits" className="block">
              <Button variant="outline" className="w-full justify-start text-sm h-10 border-slate-200 hover:border-sage hover:bg-sage/5">
                <CreditCard className="w-4 h-4 mr-2 text-green-600" />
                Kredi Satın Al
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
