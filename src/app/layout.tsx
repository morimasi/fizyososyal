import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Fizyososyal - AI Destekli İçerik Platformu",
  description: "Fizyoterapi profesyonelleri için yapay zeka ile sosyal medya içeriği oluşturun ve planlayın.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={inter.variable}>
      <body className="min-h-screen bg-fluid">
        {children}
      </body>
    </html>
  );
}
