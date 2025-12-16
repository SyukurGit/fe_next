// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 1. Konfigurasi Tampilan Mobile (Warna bar browser)
export const viewport: Viewport = {
  themeColor: "#020617", // Sesuai bg-slate-950
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

// 2. Metadata Lengkap untuk SEO & Branding
export const metadata: Metadata = {
  // Ganti URL ini dengan domain aslimu nanti (misal: https://dompetpintar.com)
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://dompetpintar.a76labs.online"),
  
  title: {
    default: "Dompet Pintar - Kelola Keuangan",
    template: "%s | Dompet Pintar", // Halaman lain akan jadi: "Dashboard | Dompet Pintar"
  },
  
  description: "Aplikasi manajemen keuangan pribadi yang terintegrasi dengan Bot Telegram. Catat pemasukan, pantau pengeluaran, dan analisa cashflow harian dengan mudah dan cepat.",
  
  keywords: ["dompet pintar", "bot keuangan", "catat keuangan", "telegram bot finance", "aplikasi pengatur keuangan", "a76 labs"],
  
  authors: [{ name: "A76 Labs", url: "https://t.me/unxpctedd" }],
  
  creator: "A76 Labs",
  
  // Konfigurasi Icon
  icons: {
    icon: '/fav.png',      // Icon di tab browser
    apple: '/fav.png',     // Icon saat di-add to homescreen iOS
    shortcut: '/fav.png',
  },

  // Tampilan saat link di-share di WA/Facebook/LinkedIn
  openGraph: {
    title: "Dompet Pintar - Asisten Keuangan Pribadi",
    description: "Kelola keuangan harian tanpa ribet via Web & Telegram. Coba gratis sekarang!",
    url: "/",
    siteName: "Dompet Pintar Bot",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: '/images/logobot.png', // Menggunakan logo sebagai thumbnail share
        width: 800,
        height: 600,
        alt: "Logo Dompet Pintar",
      },
    ],
  },

  // Tampilan saat di-share di Twitter/X
  twitter: {
    card: "summary_large_image",
    title: "Dompet Pintar Bot",
    description: "Solusi cerdas kelola cashflow harianmu.",
    images: ['/images/logobot.png'], 
    creator: "@unxpctedd", // Bisa diganti username twitter official jika ada
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950 text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-200`}
      >
        {children}
      </body>
    </html>
  );
}