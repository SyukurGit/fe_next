// components/NinjaSwitcher.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { ChevronDown, Check, Globe } from "lucide-react"; 

export default function NinjaSwitcher() {
  const [currentLang, setCurrentLang] = useState("ID");
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const cookies = document.cookie.split('; ');
    const googtrans = cookies.find(row => row.trim().startsWith('googtrans='));
    
    if (googtrans && googtrans.includes('/en')) {
      setCurrentLang("EN");
    } else {
      setCurrentLang("ID");
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const changeLanguage = (lang: string) => {
    const domain = window.location.hostname;
    const cleanDomain = domain.replace(/^www\./, ''); // Hapus www.
    // Ambil bagian domain utama saja (misal: vercel.app) untuk case subdomain deep
    const parts = cleanDomain.split('.');
    const topLevelDomain = parts.slice(-2).join('.'); 

    // Tentukan Target Cookie
    // Kalau ID -> paksa /id/id (biar layout gak auto-detect ke EN lagi)
    // Kalau EN -> paksa /id/en
    const cookieValue = lang === 'en' ? '/id/en' : '/id/id';

    // 1. HAPUS COOKIE LAMA (Bersihkan area)
    const expires = "expires=Thu, 01 Jan 1970 00:00:00 UTC";
    document.cookie = `googtrans=;${expires};path=/`;
    document.cookie = `googtrans=;${expires};path=/;domain=${domain}`;
    document.cookie = `googtrans=;${expires};path=/;domain=.${domain}`;
    document.cookie = `googtrans=;${expires};path=/;domain=${cleanDomain}`;
    document.cookie = `googtrans=;${expires};path=/;domain=.${cleanDomain}`;
    
    // 2. TULIS COOKIE BARU (Serangan Bertubi-tubi)
    // Tulis di Host Only
    document.cookie = `googtrans=${cookieValue};path=/`;
    
    // Tulis di Domain saat ini
    document.cookie = `googtrans=${cookieValue};path=/;domain=${domain}`;

    // Tulis di Root Domain (khusus Vercel kadang butuh ini)
    if (domain !== topLevelDomain) {
        document.cookie = `googtrans=${cookieValue};path=/;domain=.${topLevelDomain}`;
    }

    setIsOpen(false);
    
    // Reload halaman
    window.location.reload();
  };

  if (!mounted) return null;

  return (
    <div className="relative z-50" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-full text-xs font-semibold transition border border-slate-700 shadow-lg"
      >
        <Globe size={14} className="text-emerald-400" />
        <span>{currentLang}</span>
        <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>

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