// components/Navbar.tsx
"use client";

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// Pastikan import ini tidak merah/error
import NinjaSwitcher from './NinjaSwitcher'; 

const Navbar: React.FC = () => {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleLogout = (): void => {
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("user");
    localStorage.removeItem("username");
    router.push("/login");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuOpen && menuRef.current && !menuRef.current.contains(event.target as Node) && buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileMenuOpen]);

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* LOGO */}
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-12 h-12 relative rounded-lg overflow-hidden shadow-md shadow-emerald-500/20">
                <img src="/images/croplogobot.png" alt="Logo" className="w-full h-full object-cover group-hover:opacity-80 transition"/>
            </div>
            <span className="font-bold text-lg text-white group-hover:text-emerald-300 transition notranslate">
              Dompet<span className="text-emerald-400 group-hover:text-emerald-200">Pintar</span>Bot
            </span>
          </Link>

          {/* MENU DESKTOP */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/dashboard/laporan" className="text-sm font-medium text-white hover:text-amber-300 transition">
              Laporan Pengeluaran
            </Link>
            
            <div className="flex items-center gap-4 border-l border-slate-800 pl-6">
               {/* 🟢 TOMBOL DISINI (DESKTOP) */}
              <NinjaSwitcher />

              <Link href="/dashboard/pengaturan" className="text-sm font-medium text-slate-400 hover:text-amber-300 transition">
                ⚙️ Pengaturan
              </Link>
              <button onClick={handleLogout} className="text-sm font-medium text-red-400 hover:text-red-300 transition flex items-center gap-4">
                Logout
              </button>
            </div>
          </div>
          
          {/* MENU MOBILE BUTTON */}
          <div className="md:hidden flex items-center gap-3">
             {/* 🟢 TOMBOL DISINI (MOBILE - DILUAR BURGER BIAR GAMPANG) */}
             <div className="scale-90"><NinjaSwitcher /></div>

            <button
                ref={buttonRef}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800/70 focus:outline-none transition"
            >
                {/* Icon Burger */}
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={!mobileMenuOpen ? "M4 6h16M4 12h16M4 18h16" : "M6 18L18 6M6 6l12 12"} />
                </svg>
            </button>
          </div>

        </div>
      </div>

      {/* MOBILE PANEL */}
      {mobileMenuOpen && (
        <div ref={menuRef} className="md:hidden absolute right-4 top-16 w-56 origin-top-right rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-50">
            <div className="px-2 py-2 space-y-1">
                <Link href="/dashboard/laporan" className="block px-4 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800 hover:text-white transition" onClick={() => setMobileMenuOpen(false)}>
                    📊 Laporan Pengeluaran
                </Link>
                <Link href="/dashboard/pengaturan" className="block px-4 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800 hover:text-white transition" onClick={() => setMobileMenuOpen(false)}>
                    ⚙️ Pengaturan
                </Link>
                <div className="border-t border-slate-800 my-1"></div>
                <button onClick={() => { setMobileMenuOpen(false); handleLogout(); }} className="block w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-slate-800 hover:text-red-300 transition">
                    🚪 Logout
                </button>
            </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;