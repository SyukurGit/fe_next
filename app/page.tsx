// app/page.tsx
"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function LandingPage() {
  
  // Efek Scroll Reveal Sederhana
  useEffect(() => {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.scroll-reveal');
    revealElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans">
      
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-lg">
                <span>Dompet<span className="text-emerald-400">Pintar</span><span>Bot</span></span>
            </div>
            <div className="flex gap-3">
                {/* Menambahkan tombol Register di Navbar agar lebih mudah diakses */}
                {/* <Link 
                  href="/register" 
                  className="hidden md:block text-slate-300 hover:text-white px-4 py-2 text-sm font-medium transition"
                >
                    Daftar Akun
                </Link> */}
                <Link 
                  href="/login" 
                  className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2 rounded-full text-sm font-medium transition border border-slate-700"
                >
                    Login User &rarr;
                </Link>
            </div>
        </div>
      </nav>

      {/* HEADER HERO SECTION */}
      <header className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -z-10"></div>

        <div className="mb-6 relative group cursor-pointer">
            <div className="w-24 h-24 bg-gradient-100 from-slate-800 to-slate-900 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/10 border border-slate-700 group-hover:scale-105 transition duration-500 overflow-hidden relative">
                <Image 
                  src="/images/logobot.png" 
                  alt="Logo" 
                  fill
                  className="object-cover"
                />
            </div>

            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-900 relative flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-ping absolute"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 relative"></span>
                </span>
                Live Sync
            </div>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
            Kelola dan Pantau Arus Keuangan <br/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
              Tanpa Ribet
            </span>
        </h1>
        
        <p className="text-slate-400 max-w-lg text-lg mb-8 leading-relaxed">
            Catat pemasukan dan pengeluaran langsung dari Web atau Telegram. 
            Efisien, cepat, dan Mudah.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
            <a 
              href="https://t.me/DompetPintar_A76Labs_Bot" 
              target="_blank" 
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-8 py-3.5 rounded-xl font-bold transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.188-2.85 5.18-4.686c.223-.198-.054-.306-.346-.106l-6.4 4.022-2.76-.848c-.602-.187-.61-.6.125-.892l10.78-4.156c.5-.187.943.128.808.815z"/></svg>
                Chat Bot Sekarang
            </a>
            <Link 
              href="/register" 
              className="bg-slate-900 border border-slate-800 hover:border-slate-600 text-slate-300 px-8 py-3.5 rounded-xl font-semibold transition"
            >
                Ayo Daftar Sekarang
            </Link>
        </div>
      </header>

      {/* FEATURE SECTION - UPDATED */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12 scroll-reveal opacity-0 translate-y-8 transition-all duration-700 ease-out">
            <h2 className="text-2xl font-bold text-white">Cara Daftar dan Pakai</h2>
            <p className="text-sm text-slate-500 mt-2">3 Langkah mudah untuk mulai mengelola keuangan.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Step 1: Daftar Mandiri */}
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl hover:border-emerald-500/30 transition group scroll-reveal opacity-0 translate-y-8 duration-700 ease-out delay-100">
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-xl mb-4 group-hover:bg-emerald-500/20 group-hover:text-emerald-400 transition">
                    1️⃣
                </div>
                <h3 className="font-bold text-white mb-2">Registrasi Akun</h3>
                <p className="text-sm text-slate-400 mb-4">
                 Buat dan Daftar akun Anda sendiri langsung melalui website untuk mendapatkan akses dashboard seketika.
                </p>
                <Link href="/register" className="text-emerald-400 font-bold text-sm hover:underline flex items-center gap-1">
                    Daftar di sini &rarr;
                </Link>
            </div>

            {/* Step 2: Login & Monitoring */}
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl hover:border-purple-500/30 transition group scroll-reveal opacity-0 translate-y-8 duration-700 ease-out delay-200">
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-xl mb-4 group-hover:bg-purple-500/20 group-hover:text-purple-400 transition">
                    2️⃣
                </div>
                <h3 className="font-bold text-white mb-2">Login Dashboard</h3>
                <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                    Gunakan akun yang telah didaftarkan untuk login. Pantau grafik keuangan, sisa budget, dan laporan cashflow secara real-time.
                </p>
                <Link href="/login" className="inline-flex items-center gap-2 text-sm font-bold text-white hover:text-emerald-300 transition bg-purple-500/10 px-3 py-1.5 rounded-lg border border-purple-500/20">
                    Login Sekarang &rarr;
                </Link>
            </div>

            {/* Step 3: Integrasi Bot */}
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl hover:border-blue-500/30 transition group scroll-reveal opacity-0 translate-y-8 duration-700 ease-out delay-300">
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-xl mb-4 group-hover:bg-blue-500/20 group-hover:text-blue-400 transition">
                    3️⃣
                </div>
                <h3 className="font-bold text-white mb-2">Hubungkan Bot</h3>
                <p className="text-sm text-slate-400 mb-3">
                    Ingin input tanpa buka web? Hubungkan akun Telegram Anda untuk input transaksi super cepat.
                </p>
                <ul className="space-y-2">
                    <li className="text-xs text-slate-300 flex items-start gap-2">
                        <span className="text-blue-400">⚡</span> 
                        <span>Cukup chat bot: <code className="bg-slate-950 px-1 rounded border border-slate-700 text-[10px] text-emerald-400">/start</code></span>
                    </li>
                    <li className="text-xs text-slate-300 flex items-start gap-2">
                        <span className="text-blue-400">📝</span> 
                        <span>Ketik <code className="bg-slate-950 px-1 rounded border border-slate-700 text-[10px]">-20rb Makan</code>, data langsung masuk ke web!</span>
                    </li>
                </ul>
            </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 bg-slate-950 pt-12 pb-8 scroll-reveal opacity-0 translate-y-8 transition-all duration-700 ease-out">
        <div className="max-w-6xl mx-auto px-6 flex flex-col items-center text-center">
            
            <div className="mb-6">
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-4">
                    Developed By
                </p>

                <div className="flex items-center justify-center gap-4">
                    <div className="w-28 h-20 rounded-xl overflow-hidden shadow-lg relative">
                        <Image 
                          src="/images/a76.png" 
                          alt="A76 Labs Logo" 
                          fill
                          className="object-cover"
                        />
                    </div>

                    <div className="text-left">
                        <a href="https://www.a76labs.online/" 
                           target="_blank" 
                           className="text-base font-bold text-white leading-tight hover:underline hover:text-green-500">
                            A76 Labs.
                        </a>

                        <p className="text-sm text-slate-400 leading-tight mt-1">
                            Dev:
                            <a href="https://t.me/A76Labs" 
                               target="_blank" 
                               className="text-emerald-500 hover:underline ml-1">
                                @unxpctedd
                            </a>
                        </p>
                    </div>
                </div>
            </div>

            <div className="w-full h-px bg-slate-900 my-6"></div>

            <p className="text-xs text-slate-600">
                &copy; 2025 DompetPintarBot. All rights reserved. <br/>
                <span className="opacity-50">Hak Cipta dimiliki A76 Labs.</span>
            </p>
        </div>
      </footer>

      {/* Styles khusus untuk animasi reveal */}
      <style jsx global>{`
        .scroll-reveal.active {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>

    </div>
  );
}