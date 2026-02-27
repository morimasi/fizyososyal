import React from "react";
import { Button } from "@/components/ui/button";
import { auth, signOut } from "@/auth";
import Image from "next/image";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex min-h-screen w-full bg-slate-50">
      {/* Yan Menü (Sidebar) Skeleton */}
      <aside className="w-64 border-r bg-white flex flex-col p-4 gap-2">
        <div className="font-bold text-sage-dark text-xl mb-6 px-2">Fizyososyal</div>
        
        <Link href="/dashboard" className="w-full">
          <Button variant="ghost" className="w-full justify-start">Ana Panel</Button>
        </Link>
        <Link href="/dashboard/studio" className="w-full">
          <Button variant="ghost" className="w-full justify-start">İçerik Stüdyosu</Button>
        </Link>
        <Link href="/dashboard/editor" className="w-full">
          <Button variant="ghost" className="w-full justify-start">Görsel Editör</Button>
        </Link>
        <Link href="/dashboard/calendar" className="w-full">
          <Button variant="ghost" className="w-full justify-start">Planlama</Button>
        </Link>
        
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
          className="mt-auto"
        >
          <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50">
            Çıkış Yap
          </Button>
        </form>
      </aside>

      {/* Ana İçerik */}
      <main className="flex-1 flex flex-col">
        {/* Üst Bar */}
        <header className="h-16 border-b bg-white flex items-center px-6 justify-between">
          <div className="font-medium text-slate-700">Çalışma Alanı</div>
          <div className="flex gap-4 items-center">
            <span className="text-sm font-medium bg-orchid/20 text-orchid-dark px-3 py-1 rounded-full">
              Kalan Kredi: {session?.user?.id ? "100" : "0"}
            </span>
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
