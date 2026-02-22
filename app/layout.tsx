import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const font = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PhysioSocial AI | Fizyoterapistler İçin Sosyal Medya Asistanı",
  description: "Fizyoterapistler için yapay zeka destekli otonom Instagram yönetim aracı.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="dark">
      <body className={`${font.className} bg-slate-950 text-slate-50 antialiased selection:bg-violet-500/30`}>
        {children}
      </body>
    </html>
  );
}
