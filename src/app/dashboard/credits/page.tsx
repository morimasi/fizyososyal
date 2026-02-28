import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Sparkles, CreditCard, Check } from "lucide-react";

export default async function CreditsPage() {
  const session = await auth();
  
  const user = session?.user?.id 
    ? await db.query.users.findFirst({
        where: eq(users.id, session.user.id),
      })
    : null;

  const plans = [
    {
      name: "Başlangıç",
      price: "₺299",
      credits: "50",
      features: ["AI İçerik Üretimi", "Görsel Editör", "Temel Analizler"],
      current: false
    },
    {
      name: "Profesyonel",
      price: "₺599",
      credits: "200",
      features: ["Tüm Başlangıç Özellikleri", "Instagram Otomatik Paylaşım", "Öncelikli Destek"],
      current: true,
      popular: true
    },
    {
      name: "Klinik",
      price: "₺999",
      credits: "Sınırsız",
      features: ["Tüm Profesyonel Özellikleri", "Çoklu Hesap Yönetimi", "Özel Markalama"],
      current: false
    }
  ];

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">Krediler ve Planlar</h1>
        <p className="text-slate-500 mt-2">Mevcut krediniz: <span className="font-bold text-sage">{user?.aiCredits || 0}</span></p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.name} className={`relative border-slate-200/60 flex flex-col ${plan.popular ? 'ring-2 ring-sage shadow-xl' : ''}`}>
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-sage text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                En Popüler
              </span>
            )}
            <CardHeader>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription>{plan.credits} AI Kredisi / Ay</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-6">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-slate-800">{plan.price}</span>
                <span className="text-slate-400 text-sm">/aylık</span>
              </div>
              
              <div className="flex flex-col gap-3">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm text-slate-600">
                    <Check className="w-4 h-4 text-sage shrink-0" />
                    {feature}
                  </div>
                ))}
              </div>

              <Button className={`w-full mt-auto rounded-xl ${plan.popular ? 'bg-sage hover:bg-sage-dark' : ''}`} variant={plan.popular ? 'default' : 'outline'}>
                {plan.current ? 'Mevcut Plan' : 'Planı Seç'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-slate-50 border-none shadow-none">
        <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-2xl shadow-sm text-orchid">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Kredi Nasıl Çalışır?</h3>
              <p className="text-sm text-slate-500">Her yapay zeka içerik üretimi 1 kredi harcar. Instagram paylaşımı krediden düşmez.</p>
            </div>
          </div>
          <Button variant="outline" className="rounded-xl border-slate-300">
            <CreditCard className="w-4 h-4 mr-2" />
            Ödeme Yöntemlerini Yönet
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
