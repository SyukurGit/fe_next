// components/NinjaSwitcher.tsx
"use client";

import { useEffect, useState, useRef } from "react";
// Pastikan install lucide-react, atau ganti icon pakai text/svg biasa jika error
import { ChevronDown, Check, Globe } from "lucide-react"; 

export default function NinjaSwitcher() {
  const [currentLang, setCurrentLang] = useState("ID");
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    // Cek cookie saat ini
    const cookies = document.cookie.split('; ');
    const googtrans = cookies.find(row => row.trim().startsWith('googtrans='));
    
    // Logic deteksi sederhana
    if (googtrans && googtrans.includes('/en')) {
      setCurrentLang("EN");
    } else {
      setCurrentLang("ID");
    }

    // Listener klik luar untuk tutup dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const changeLanguage = (lang: string) => {
    // 1. Tentukan Value Cookie Google Translate
    // Format: /bahasa_asal/bahasa_tujuan
    const value = lang === 'en' ? '/id/en' : '/id/id';
    
    const domain = window.location.hostname;
    // Potong 'www.' jika ada biar bersih
    const cleanDomain = domain.replace(/^www\./, ''); 

    // 2. HAPUS COOKIE LAMA (NUCLEAR METHOD) ☢️
    // Kita hapus di semua kemungkinan path dan domain biar tidak ada cookie 'zombie'
    const expires = "expires=Thu, 01 Jan 1970 00:00:00 UTC";
    
    // Hapus: Host Only
    document.cookie = `googtrans=;${expires};path=/`;
    // Hapus: Domain saat ini
    document.cookie = `googtrans=;${expires};path=/;domain=${domain}`;
    // Hapus: Dot Domain (untuk subdomain)
    document.cookie = `googtrans=;${expires};path=/;domain=.${domain}`;
    // Hapus: Clean Domain
    document.cookie = `googtrans=;${expires};path=/;domain=${cleanDomain}`;
    document.cookie = `googtrans=;${expires};path=/;domain=.${cleanDomain}`;

    // 3. SET COOKIE BARU (Double Tap) 🔫
    // Kita set di dua tempat untuk memastikan Google script membacanya
    
    // Set A: Host Only (Paling sering berhasil di Vercel)
    document.cookie = `googtrans=${value};path=/;SameSite=Lax`; 
    
    // Set B: Explicit Domain (Backup jika Host Only gagal)
    document.cookie = `googtrans=${value};path=/;domain=${domain};SameSite=Lax`;

    // 4. Tutup & Reload
    setIsOpen(false);
    
    // Timeout sedikit biar cookie sempat tertulis sebelum reload
    setTimeout(() => {
        window.location.reload();
    }, 100);
  };

  if (!mounted) return null;

  return (
    <div className="relative z-50" ref={dropdownRef}>
      {/* TOMBOL UTAMA */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-full text-xs font-semibold transition border border-slate-700 shadow-lg"
      >
        <Globe size={14} className="text-emerald-400" />
        <span>{currentLang}</span>
        <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* DROPDOWN MENU */}
      <div 
        className={`absolute top-full right-0 mt-2 w-32 bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden transition-all duration-200 origin-top-right ${
          isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
        }`}
      >
        <div className="p-1">
          <button
            onClick={() => changeLanguage('id')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
              currentLang === 'ID' ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">🇮🇩</span> Indonesia
            </div>
            {currentLang === 'ID' && <Check size={12} />}
          </button>
          
          <button
            onClick={() => changeLanguage('en')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
              currentLang === 'EN' ? 'bg-blue-500/10 text-blue-400' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">🇺🇸</span> English
            </div>
            {currentLang === 'EN' && <Check size={12} />}
          </button>
        </div>
      </div>
    </div>
  );
}