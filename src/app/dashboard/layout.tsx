import React from "react";
import { Button } from "@/components/ui/button";
import { auth, signOut } from "@/auth";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  const user = session?.user?.id 
    ? await db.query.users.findFirst({
        where: eq(users.id, session.user.id),
      })
    : null;

  return (
    <div className="flex min-h-screen w-full bg-slate-50">
      {/* Yan Menü (Sidebar) Skeleton */}
      <aside className="w-64 border-r bg-white flex flex-col p-4 gap-2">
        <div className="font-bold text-sage-dark text-xl mb-6 px-2 flex items-center gap-2">
          <span className="w-8 h-8 bg-sage rounded-lg flex items-center justify-center text-white text-xs">F</span>
          Fizyososyal
        </div>
        
        <Link href="/dashboard" className="w-full">
          <Button variant="ghost" className="w-full justify-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-sage/40"></span>
            Ana Panel
          </Button>
        </Link>
        <Link href="/dashboard/studio" className="w-full">
          <Button variant="ghost" className="w-full justify-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-orchid/40"></span>
            İçerik Stüdyosu
          </Button>
        </Link>
        <Link href="/dashboard/editor" className="w-full">
          <Button variant="ghost" className="w-full justify-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-aquamarine/40"></span>
            Görsel Editör
          </Button>
        </Link>
        <Link href="/dashboard/calendar" className="w-full">
          <Button variant="ghost" className="w-full justify-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-coral/40"></span>
            Planlama
          </Button>
        </Link>
        
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
          className="mt-auto"
        >
          <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-500 hover:bg-red-50 text-xs">
            Çıkış Yap
          </Button>
        </form>
      </aside>

      {/* Ana İçerik */}
      <main className="flex-1 flex flex-col">
        {/* Üst Bar */}
        <header className="h-16 border-b bg-white flex items-center px-6 justify-between">
          <div className="font-medium text-slate-500 text-sm">Fizyoterapi Kontrol Merkezi</div>
          <div className="flex gap-4 items-center">
            <div className="flex flex-col items-end mr-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">AI Kredisi</span>
              <span className="text-sm font-black text-sage-dark">
                {user?.aiCredits ?? 0}
              </span>
            </div>
            {session?.user?.image ? (
              <Image 
                src={session.user.image} 
                alt={session.user.name || "User"} 
                width={32} 
                height={32} 
                className="rounded-full border-2 border-sage"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-sage flex items-center justify-center text-white font-bold">
                {session?.user?.name?.[0] || "U"}
              </div>
            )}
          </div>
        </header>

        {/* Sayfa İçeriği */}
        <div className="flex-1 p-8 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
