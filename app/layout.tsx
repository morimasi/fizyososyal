import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const font = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PhysioSocial AI | Profesyonel Klinik İçerik Yönetimi",
  description: "Fizyoterapistler için yapay zeka destekli otonom içerik üretim, takvim ve analitik platformu.",
  manifest: "/manifest.json",
  metadataBase: new URL("https://physiosocial.ai"),
  openGraph: {
    title: "PhysioSocial AI",
    description: "Klinik başarınızı yapay zeka ile katlayın.",
    images: ["/og-image.png"],
  },
};

export const viewport = {
  themeColor: "#8b5cf6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
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
