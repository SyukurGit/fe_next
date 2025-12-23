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
    // Membaca cookie yang ada untuk set state awal UI
    const cookies = document.cookie.split('; ');
    const googtrans = cookies.find(row => row.trim().startsWith('googtrans='));
    
    // Logika deteksi yang lebih aman
    if (googtrans) {
        if (googtrans.includes('/en')) {
            setCurrentLang("EN");
        } else {
            setCurrentLang("ID");
        }
    } else {
        // Fallback jika tidak ada cookie, set ID sebagai default visual
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
    
    // Logika domain root yang lebih robust untuk menghantam subdomain
    // Contoh: dompet.a76labs.online -> a76labs.online
    const parts = domain.split('.');
    let topLevelDomain = domain;
    if (parts.length > 2) {
        // Ambil 2 bagian terakhir (misal: a76labs.online)
        topLevelDomain = parts.slice(-2).join('.'); 
    }

    // Tentukan Target Cookie Format Google Translate: /source_lang/target_lang
    const cookieValue = lang === 'en' ? '/id/en' : '/id/id';

    // === LANGKAH 1: NUCLEAR OPTION (Hapus Cookie Lama) ===
    // Kita hapus di semua kemungkinan path dan domain
    const domainsToClear = [
        domain,                 // "dompetpintar.a76labs.online"
        `.${domain}`,           // ".dompetpintar.a76labs.online"
        topLevelDomain,         // "a76labs.online"
        `.${topLevelDomain}`    // ".a76labs.online"
    ];

    domainsToClear.forEach(d => {
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${d}`;
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`; // Host only
    });
    
    // === LANGKAH 2: SET COOKIE BARU ===
    // Kita set di Domain Utama (Top Level) agar konsisten di semua subdomain (jika ada)
    // Atau set di Host Only jika di localhost
    
    if (domain === 'localhost') {
        document.cookie = `googtrans=${cookieValue}; path=/`;
    } else {
        // Set di domain spesifik dan root domain untuk memastikan 'menempel'
        document.cookie = `googtrans=${cookieValue}; path=/`;
        document.cookie = `googtrans=${cookieValue}; path=/; domain=${topLevelDomain}`;
        document.cookie = `googtrans=${cookieValue}; path=/; domain=.${topLevelDomain}`;
    }

    setIsOpen(false);
    
    // Reload halaman untuk trigger script Google Translate ulang
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

      {/* Dropdown Menu */}
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