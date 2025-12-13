// components/Navbar.js
"use client"; // Wajib karena ada interaksi (klik menu)
import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <img 
              src="/images/croplogobot.png" 
              alt="Logo" 
              className="w-12 h-12 rounded-lg object-cover bg-slate-900 shadow-md shadow-emerald-500/20 group-hover:opacity-80 transition"
            />
            <span className="font-bold text-lg text-white group-hover:text-emerald-300 transition">
              Dompet<span className="text-emerald-400 group-hover:text-emerald-200">Pintar</span>Bot
            </span>
          </Link>

          {/* Menu Desktop */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/dashboard/laporan" className="text-sm font-medium text-white hover:text-amber-300 transition">
              Laporan Pengeluaran
            </Link>
            <div className="flex items-center gap-4 border-l border-slate-800 pl-6">
              <Link href="/dashboard/pengaturan" className="text-sm font-medium text-slate-400 hover:text-amber-300 transition">
                ⚙️ Pengaturan
              </Link>
              <button 
                onClick={() => {
                    localStorage.removeItem('jwt_token');
                    window.location.href = '/login';
                }}
                className="text-sm font-medium text-red-400 hover:text-red-300 transition flex items-center gap-4"
              >
                Logout
              </button>
            </div>
          </div>
          
          {/* Menu Mobile (Hamburger) bisa ditambahkan di sini sesuai logic HTML lama */}
        </div>
      </div>
    </nav>
  );
}