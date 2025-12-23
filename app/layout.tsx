// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#020617",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://dompetpintar.a76labs.online"),
  title: { default: "Dompet Pintar", template: "%s | Dompet Pintar" },
  description: "Aplikasi manajemen keuangan pribadi.",  
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="scroll-smooth">
      <head>
         {/* CSS BRUTAL: Tetap pertahankan yang kamu punya */}
         <style>{`
            .goog-te-banner-frame { display: none !important; }
            .goog-te-gadget { display: none !important; }
            body { top: 0px !important; position: static !important; }
            .goog-tooltip { display: none !important; }
            .goog-tooltip:hover { display: none !important; }
            .goog-text-highlight { background-color: transparent !important; border: none !important; box-shadow: none !important; }
            iframe.goog-te-banner-frame { display: none !important; }
            body > .skiptranslate { display: none !important; }
        `}</style>
      </head>
    <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950 text-slate-100`}>

  {/* SATU SCRIPT SAJA: Digabung dan Dirapikan */}
  <Script id="google-translate-init" strategy="afterInteractive">
    {`
      function googleTranslateElementInit() {
        new google.translate.TranslateElement({
          pageLanguage: 'id',
          includedLanguages: 'id,en',
          autoDisplay: false, 
          // Penting: matikan autoDisplay biar ga muncul bar aneh
          layout: google.translate.TranslateElement.InlineLayout.SIMPLE
        }, 'google_translate_element');
      }

      (function() {
          // Cek apakah cookie googtrans SUDAH ADA.
          var cookies = document.cookie.split('; ');
          var googtrans = cookies.find(function(row) { 
              return row.trim().startsWith('googtrans='); 
          });

          // Jika cookie BELUM ADA, kita set default
          // Ini mencegah 'flicker' atau bahasa berubah sendiri saat pertama load
          if (!googtrans) {
              var lang = navigator.language || navigator.userLanguage; 
              var domain = window.location.hostname;
              
              // Jika browser bukan bahasa Indonesia, paksa ke Inggris
              if (lang.indexOf('id') === -1) {
                  document.cookie = "googtrans=/id/en; path=/";
                  document.cookie = "googtrans=/id/en; path=/; domain=" + domain;
              } else {
                  // Jika Indo, set explicit ke Indo
                  document.cookie = "googtrans=/id/id; path=/";
                  document.cookie = "googtrans=/id/id; path=/; domain=" + domain;
              }
          }
      })();
    `}
  </Script>
  
  {/* Load Script Asli Google Translate */}
  <Script src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" strategy="afterInteractive" />

  {/* ELEMENT GOOGLE (HIDDEN) */}
  <div id="google_translate_element" style={{ display: 'none' }}></div>

  {children}
</body>
    </html>
  );
}