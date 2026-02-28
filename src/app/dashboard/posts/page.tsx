import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/auth";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { FileText, Calendar, CheckCircle, Clock } from "lucide-react";

export default async function PostsPage() {
  const session = await auth();
  
  const allPosts = session?.user?.id 
    ? await db.query.posts.findMany({
        where: eq(posts.userId, session.user.id),
        orderBy: [desc(posts.createdAt)],
      })
    : [];

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">İçeriklerim</h1>
          <p className="text-slate-500 mt-1 text-sm">Tüm oluşturduğunuz ve paylaştığınız içerikler.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {allPosts.length > 0 ? (
          allPosts.map((post) => (
            <Card key={post.id} className="border-slate-200/60 overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-48 aspect-square bg-slate-100 shrink-0">
                    {post.mediaUrl ? (
                      <img src={post.mediaUrl} alt="Post content" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <FileText className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex flex-col justify-between flex-1">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
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
                          <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-full">
                            Taslak
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                          {post.type}
                        </span>
                      </div>
                      <p className="text-slate-700 text-sm line-clamp-3 italic">
                        "{post.caption || "Açıklama yok"}"
                      </p>
                    </div>
                    <div className="mt-4 flex items-center gap-4 text-[11px] text-slate-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(post.createdAt).toLocaleDateString('tr-TR')}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800">Henüz içerik yok</h3>
            <p className="text-slate-500 text-sm">AI Studio'ya giderek ilk içeriğinizi oluşturun.</p>
          </div>
        )}
      </div>
    </div>
  );
}
