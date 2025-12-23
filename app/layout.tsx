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
         {/* CSS BRUTAL: HIDE GOOGLE POPUP */}
         <style>{`
            /* Sembunyikan Top Bar Google */
            .goog-te-banner-frame { display: none !important; }
            .goog-te-gadget { display: none !important; }
            /* Sembunyikan Body Top Padding yg dibuat Google */
            body { top: 0px !important; position: static !important; }
            /* Sembunyikan Tooltip & Iframe Google */
            .goog-tooltip { display: none !important; }
            .goog-tooltip:hover { display: none !important; }
            .goog-text-highlight { background-color: transparent !important; border: none !important; box-shadow: none !important; }
            iframe.goog-te-banner-frame { display: none !important; }
            /* Penting: Jangan sembunyikan 'skiptranslate' global, cuma bannernya aja */
            body > .skiptranslate { display: none !important; }
        `}</style>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950 text-slate-100`}>
        
        {/* SCRIPT GOOGLE TRANSLATE */}
        <Script id="google-translate-init" strategy="afterInteractive">
          {`
            function googleTranslateElementInit() {
              new google.translate.TranslateElement({
                pageLanguage: 'id',
                includedLanguages: 'id,en',
                autoDisplay: false, // JANGAN TAMPILKAN POPUP
                layout: google.translate.TranslateElement.InlineLayout.SIMPLE
              }, 'google_translate_element');
            }

            // AUTO DETECT LANGUAGE
            if (!document.cookie.split('; ').find(row => row.trim().startsWith('googtrans='))) {
              var lang = navigator.language || navigator.userLanguage; 
              if (lang.indexOf('id') === -1) {
                document.cookie = "googtrans=/id/en; path=/";
                document.cookie = "googtrans=/id/en; path=/; domain=" + window.location.hostname;
              } else {
                document.cookie = "googtrans=/id/id; path=/";
                document.cookie = "googtrans=/id/id; path=/; domain=" + window.location.hostname;
              }
            }
          `}
        </Script>
        <Script src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" strategy="afterInteractive" />

        {/* ELEMENT GOOGLE (HIDDEN TAPI WAJIB ADA) */}
        <div id="google_translate_element" style={{ display: 'none' }}></div>

        {children}
      </body>
    </html>
  );
}