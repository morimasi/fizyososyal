import { InstagramConnect } from "@/features/social-publisher/components/instagram-connect";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, Clock } from "lucide-react";

export default function CalendarPage() {
  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">Planlama & Takvim</h1>
        <p className="text-slate-500">Paylaşımlarınızı zamanlayın ve sosyal medya hesaplarınızı yönetin.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="flex flex-col gap-6">
          <InstagramConnect />
          
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="text-lg">Yayın Sırası</CardTitle>
              <CardDescription>Onay bekleyen ve planlanmış içerikler.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-center h-32 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-sm italic">
                  Henüz planlanmış bir içerik yok.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-panel h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-sage" />
              İçerik Takvimi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {/* Basit Takvim Görünümü */}
              {["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pz"].map((day) => (
                <div key={day} className="text-center text-xs font-bold text-slate-400 py-2">
                  {day}
                </div>
              ))}
              {Array.from({ length: 31 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`h-12 border border-slate-100 rounded-lg flex items-start p-1 text-[10px] font-medium transition-colors hover:bg-sage/5 cursor-pointer ${
                    i + 1 === 27 ? "bg-sage/10 border-sage/30 text-sage-dark ring-2 ring-sage/20" : "text-slate-400"
                  }`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
            
            <div className="mt-8 p-4 bg-orchid/5 rounded-2xl border border-orchid/10">
              <div className="flex items-center gap-2 text-orchid-dark font-bold text-sm mb-2">
                <Clock className="w-4 h-4" /> Önerilen Paylaşım Saatleri
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Takipçilerinizin en aktif olduğu saatler baz alınarak AI tarafından önerilmiştir:
                <br />• Salı: 19:30
                <br />• Perşembe: 21:00
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
