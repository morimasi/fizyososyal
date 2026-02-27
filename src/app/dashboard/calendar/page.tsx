import { auth } from "@/auth";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  addMonths, 
  subMonths,
  isToday,
  startOfWeek,
  endOfWeek
} from "date-fns";
import { tr } from "date-fns/locale";
import { InstagramConnect } from "@/features/social-publisher/components/instagram-connect";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Instagram,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  CalendarCheck,
  Zap
} from "lucide-react";
import Link from "next/link";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: { month?: string };
}) {
  const session = await auth();
  const currentMonth = searchParams.month ? new Date(searchParams.month) : new Date();
  
  const start = startOfMonth(currentMonth);
  const end = endOfMonth(currentMonth);
  
  // To fill the grid correctly, we need the start of the first week and end of the last week
  const calendarStart = startOfWeek(start, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(end, { weekStartsOn: 1 });
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const scheduledPosts = session?.user?.id 
    ? await db.query.posts.findMany({
        where: and(
          eq(posts.userId, session.user.id),
          gte(posts.createdAt, calendarStart),
          lte(posts.createdAt, calendarEnd)
        ),
        orderBy: [desc(posts.createdAt)]
      })
    : [];

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-sage/10 rounded-xl">
               <CalendarCheck className="w-6 h-6 text-sage" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-800">Planlama Stüdyosu</h1>
          </div>
          <p className="text-slate-500 font-medium ml-10">Profesyonel içerik takvimi ve AI destekli zamanlama servisi.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/studio">
            <Button className="bg-sage hover:bg-sage-dark text-white rounded-2xl shadow-lg shadow-sage/20 border-none px-6 h-12">
              <Zap className="w-4 h-4 mr-2" /> Hızlı Planla
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar: Connections & AI Insights */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <InstagramConnect />

          <Card className="glass-panel border-orchid/20 bg-orchid/5 overflow-hidden shadow-xl">
            <div className="bg-gradient-to-r from-orchid to-orchid-dark p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-sm uppercase tracking-wider">
                <Sparkles className="w-4 h-4" /> AI Optimal Zamanlama
              </div>
              <Badge className="bg-white/20 text-white border-none text-[9px] font-black uppercase">Aktif</Badge>
            </div>
            <CardContent className="p-6 flex flex-col gap-4">
              <p className="text-[11px] text-slate-600 leading-relaxed font-semibold italic">
                "Fizyoterapi hastalarınız akşam saatlerinde içerikleri daha çok kaydediyor."
              </p>
              <div className="flex flex-col gap-3 mt-2">
                {[
                  { day: "Salı", time: "19:30", status: "Yüksek Etkileşim", color: "text-green-600", bg: "bg-green-50" },
                  { day: "Perşembe", time: "21:15", status: "Zirve Saat", color: "text-orchid-dark", bg: "bg-orchid/10" },
                  { day: "Pazar", time: "11:00", status: "Egzersiz Vakti", color: "text-blue-600", bg: "bg-blue-50" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 shadow-sm transition-transform hover:scale-[1.02] cursor-pointer">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{item.day}</span>
                      <span className="text-sm font-bold text-slate-700">{item.time}</span>
                    </div>
                    <Badge variant="secondary" className={`${item.bg} ${item.color} border-none text-[9px] px-2`}>
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel border-slate-200 shadow-lg">
            <CardHeader className="pb-2 border-b border-slate-50">
              <CardTitle className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" /> Yaklaşan Gönderiler
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[300px]">
                <div className="flex flex-col">
                  {scheduledPosts.filter(p => p.status === 'scheduled').length > 0 ? (
                    scheduledPosts.filter(p => p.status === 'scheduled').map((post) => (
                      <div key={post.id} className="p-4 border-b border-slate-50 last:border-0 flex gap-3 group hover:bg-slate-50 transition-colors">
                        <div className="w-10 h-10 bg-white border border-slate-100 rounded-xl shrink-0 flex items-center justify-center shadow-sm">
                           <Instagram className="w-4 h-4 text-pink-500" />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-xs font-bold text-slate-700 truncate">{post.caption || "Başlıksız Gönderi"}</span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1 font-medium">
                             {format(new Date(post.createdAt), "d MMMM, HH:mm", { locale: tr })}
                          </span>
                        </div>
                        <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg">
                          <MoreVertical className="w-4 h-4 text-slate-300" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center text-xs text-slate-400 font-medium italic">Kuyrukta bekleyen gönderi yok.</div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Main Content: Interactive Calendar */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <Card className="glass-panel border-none shadow-2xl overflow-hidden rounded-[2.5rem] border-4 border-white">
            <div className="p-8 bg-white border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-6">
                <div className="flex flex-col">
                   <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter leading-none">
                    {format(currentMonth, "MMMM", { locale: tr })}
                  </h2>
                  <span className="text-sm font-bold text-slate-400">{format(currentMonth, "yyyy")}</span>
                </div>
                <div className="flex bg-slate-50 border border-slate-100 rounded-2xl p-1.5 shadow-inner">
                  <Link href={`?month=${format(subMonths(currentMonth, 1), "yyyy-MM")}`}>
                    <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl hover:bg-white hover:shadow-md transition-all">
                      <ChevronLeft className="w-5 h-5 text-slate-600" />
                    </Button>
                  </Link>
                  <Link href={`?month=${format(addMonths(currentMonth, 1), "yyyy-MM")}`}>
                    <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl hover:bg-white hover:shadow-md transition-all">
                      <ChevronRight className="w-5 h-5 text-slate-600" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex p-1 bg-slate-100 rounded-2xl shadow-inner border border-slate-200/50">
                <Button variant="ghost" className="rounded-xl px-6 h-10 text-xs font-bold text-slate-500">HAFTALIK</Button>
                <Button variant="secondary" className="rounded-xl px-6 h-10 text-xs font-black bg-white shadow-sm text-sage-dark">AYLIK</Button>
              </div>
            </div>

            <CardContent className="p-0">
              <div className="grid grid-cols-7 bg-slate-50/80">
                {["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"].map((day) => (
                  <div key={day} className="py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-r last:border-0 border-slate-200/50">
                    {day.substring(0, 3)}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 auto-rows-[140px] bg-slate-50/30">
                {days.map((day, idx) => {
                  const dayPosts = scheduledPosts.filter(p => isSameDay(new Date(p.createdAt), day));
                  const isCurrentToday = isToday(day);
                  const isCurrentMonth = isSameDay(startOfMonth(day), startOfMonth(currentMonth));
                  
                  return (
                    <div 
                      key={idx} 
                      className={`border-r border-b border-slate-200/40 p-3 flex flex-col gap-2 transition-all hover:bg-white hover:z-10 hover:shadow-2xl group relative ${!isCurrentMonth ? 'bg-slate-100/50 opacity-40' : ''}`}
                    >
                      <div className="flex justify-between items-center">
                        <span className={`text-xs font-black w-7 h-7 flex items-center justify-center rounded-xl transition-all ${isCurrentToday ? 'bg-sage text-white shadow-lg shadow-sage/40 ring-4 ring-sage/10' : 'text-slate-400 font-bold'}`}>
                          {format(day, "d")}
                        </span>
                        {dayPosts.length > 0 && (
                          <div className="flex -space-x-2">
                             {dayPosts.slice(0, 3).map((_, i) => (
                               <div key={i} className="w-4 h-4 rounded-full border-2 border-white bg-orchid shadow-sm" />
                             ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 overflow-hidden flex flex-col gap-1.5 mt-1">
                        {dayPosts.slice(0, 3).map((post) => (
                          <div 
                            key={post.id} 
                            className={`px-2 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-tighter border flex items-center gap-1.5 cursor-pointer shadow-sm transition-all hover:translate-x-1 ${
                              post.status === 'published' 
                                ? 'bg-green-50 border-green-200 text-green-700' 
                                : post.status === 'scheduled' 
                                ? 'bg-blue-50 border-blue-200 text-blue-700'
                                : 'bg-white border-slate-100 text-slate-500'
                            }`}
                          >
                            <Instagram className="w-2.5 h-2.5 shrink-0" />
                            <span className="truncate">{post.type}</span>
                          </div>
                        ))}
                        {dayPosts.length > 3 && (
                          <span className="text-[9px] font-bold text-slate-400 pl-1">+{dayPosts.length - 3} daha...</span>
                        )}
                      </div>
                      
                      <Button variant="ghost" size="icon" className="absolute bottom-2 right-2 w-7 h-7 rounded-xl opacity-0 group-hover:opacity-100 transition-all bg-white shadow-xl border border-slate-100 hover:bg-sage hover:text-white group-hover:translate-y-[-4px]">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="glass-panel border-none bg-sage/5 p-6 flex flex-col gap-2">
                <span className="text-[10px] font-black text-sage-dark uppercase tracking-widest">Yayın Başarısı</span>
                <div className="text-4xl font-black text-slate-800 tracking-tighter">98.4%</div>
                <div className="flex items-center gap-2 mt-2">
                   <Badge className="bg-green-100 text-green-700 border-none font-bold">+2.1%</Badge>
                   <span className="text-[10px] text-slate-400 font-bold">vs GEÇEN AY</span>
                </div>
            </Card>

            <Card className="glass-panel border-none bg-orchid/5 p-6 flex flex-col gap-2">
                <span className="text-[10px] font-black text-orchid-dark uppercase tracking-widest">Planlanan</span>
                <div className="text-4xl font-black text-slate-800 tracking-tighter">{scheduledPosts.filter(p => p.status === 'scheduled').length}</div>
                <div className="flex items-center gap-2 mt-2">
                   <Badge className="bg-orchid/10 text-orchid-dark border-none font-bold">STABİL</Badge>
                   <span className="text-[10px] text-slate-400 font-bold">İÇERİK KUYRUĞU</span>
                </div>
            </Card>

            <Card className="glass-panel border-none bg-blue-50/50 p-6 flex flex-col gap-2">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">AI Önerisi</span>
                <div className="text-lg font-bold text-slate-700 leading-tight">Yarın saat 14:00'te yeni bir post planlayın.</div>
                <Button variant="outline" size="sm" className="mt-2 h-8 rounded-xl text-[10px] font-black uppercase border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white">Şimdi Yap</Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
