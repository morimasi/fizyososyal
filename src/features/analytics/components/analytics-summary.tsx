"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, MessageCircle } from "lucide-react";

export function AnalyticsSummary() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="glass-panel border-none shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-slate-400 uppercase">Toplam Erişim</span>
              <span className="text-2xl font-bold text-slate-800">12.4K</span>
            </div>
            <div className="p-2 bg-sage/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-sage" />
            </div>
          </div>
          <div className="mt-4 text-[10px] text-green-600 font-bold flex items-center gap-1">
            +12% <span className="text-slate-400 font-normal">geçen haftaya göre</span>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-panel border-none shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-slate-400 uppercase">Etkileşim Oranı</span>
              <span className="text-2xl font-bold text-slate-800">4.8%</span>
            </div>
            <div className="p-2 bg-orchid/10 rounded-lg">
              <BarChart3 className="w-5 h-5 text-orchid" />
            </div>
          </div>
          <div className="mt-4 text-[10px] text-green-600 font-bold flex items-center gap-1">
            +5% <span className="text-slate-400 font-normal">geçen haftaya göre</span>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-panel border-none shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-slate-400 uppercase">Yeni Takipçi</span>
              <span className="text-2xl font-bold text-slate-800">+128</span>
            </div>
            <div className="p-2 bg-aquamarine/10 rounded-lg">
              <Users className="w-5 h-5 text-aquamarine" />
            </div>
          </div>
          <div className="mt-4 text-[10px] text-green-600 font-bold flex items-center gap-1">
            +24% <span className="text-slate-400 font-normal">geçen haftaya göre</span>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-panel border-none shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-slate-400 uppercase">Yorumlar</span>
              <span className="text-2xl font-bold text-slate-800">42</span>
            </div>
            <div className="p-2 bg-coral/10 rounded-lg">
              <MessageCircle className="w-5 h-5 text-coral" />
            </div>
          </div>
          <div className="mt-4 text-[10px] text-red-500 font-bold flex items-center gap-1">
            -2% <span className="text-slate-400 font-normal">geçen haftaya göre</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
