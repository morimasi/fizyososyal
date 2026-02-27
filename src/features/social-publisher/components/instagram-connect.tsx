"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Instagram, CheckCircle2, AlertCircle, Link2, Settings, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function InstagramConnect() {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConnect = () => {
    setLoading(true);
    // Simulation of OAuth Flow
    setTimeout(() => {
      setIsConnected(true);
      setLoading(false);
    }, 1500);
  };

  return (
    <Card className="glass-panel w-full border-none shadow-xl overflow-hidden rounded-[2rem]">
      <div className="bg-slate-900 p-6 flex flex-col gap-2 relative">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Instagram className="w-24 h-24 text-white" />
        </div>
        <div className="flex items-center gap-2">
           <Badge className="bg-pink-500 hover:bg-pink-600 text-white border-none text-[8px] font-black uppercase tracking-tighter px-2">Meta Business</Badge>
           {isConnected && (
             <Badge className="bg-green-500/20 text-green-400 border-none text-[8px] font-black uppercase tracking-tighter px-2 flex items-center gap-1">
               <ShieldCheck className="w-2 h-2" /> Güvenli
             </Badge>
           )}
        </div>
        <CardTitle className="text-white text-xl font-black tracking-tight flex items-center gap-2">
          Instagram API
        </CardTitle>
        <CardDescription className="text-slate-400 text-xs font-medium max-w-[200px]">
          İçeriklerinizi doğrudan yayınlamak için Business hesabınızı bağlayın.
        </CardDescription>
      </div>

      <CardContent className="p-6">
        {isConnected ? (
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group transition-all hover:border-pink-200">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px]">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                   <div className="font-black text-slate-800 text-xs">KF</div>
                </div>
              </div>
              <div className="flex flex-col flex-1">
                <span className="text-sm font-black text-slate-800 tracking-tight">@klinik_fizyoterapi</span>
                <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5" /> Bağlantı Aktif
                </span>
              </div>
              <Button variant="ghost" size="icon" className="rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                <Settings className="w-4 h-4 text-slate-400" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="rounded-xl h-11 text-xs font-bold border-slate-200 text-slate-500 hover:bg-slate-50" onClick={() => setIsConnected(false)}>
                Bağlantıyı Kes
              </Button>
              <Button variant="outline" className="rounded-xl h-11 text-xs font-bold border-slate-200 text-slate-500 hover:bg-slate-50">
                Hesap Değiştir
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="flex items-start gap-3 p-4 bg-blue-50/50 border border-blue-100 rounded-2xl text-blue-700">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed font-semibold">
                Yayınlama servisi için Instagram hesabınızın <strong>İşletme</strong> veya <strong>İçerik Üreticisi</strong> modunda olması gerekmektedir.
              </p>
            </div>
            <Button 
              className="w-full rounded-2xl bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 hover:scale-[1.02] transition-all text-white font-black text-sm py-8 shadow-xl shadow-pink-500/20 group"
              onClick={handleConnect}
              disabled={loading}
            >
              <Link2 className="w-5 h-5 mr-3 group-hover:rotate-45 transition-transform" />
              {loading ? "META API'YE BAĞLANILIYOR..." : "INSTAGRAM HESABINI BAĞLA"}
            </Button>
            <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest italic">
              %100 Güvenli Meta Graph API Altyapısı
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
