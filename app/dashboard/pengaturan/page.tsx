// app/dashboard/pengaturan/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Interface sesuai dengan respon API Backend yang baru
interface UserProfile {
  username: string;
  status: string;
  telegram_id?: number | null; // Bisa null atau number
}

export default function PengaturanAkunPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile>({
    username: '',
    status: '',
    telegram_id: null,
  });
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('jwt_token'); 
    if (!token) {
        router.push('/login');
        return;
    }

    const localUserStr = localStorage.getItem('user');
    if (localUserStr) {
        try {
            const localUser = JSON.parse(localUserStr);
            setUser(prev => ({ ...prev, ...localUser }));
        } catch (e) {
            console.error("Error parsing local user", e);
        }
    }

    fetchLatestProfile(token);
  }, [router]);

  const fetchLatestProfile = async (token: string) => {
    setIsChecking(true);
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/settings?t=${Date.now()}`, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'true' 
            },
            cache: 'no-store'
        });

        if (res.ok) {
            const data = await res.json();
            console.log("🔥 Data Profile Server:", data);
            setUser(data);

            const localUserStr = localStorage.getItem('user');
            if (localUserStr) {
                const updatedLocal = { ...JSON.parse(localUserStr), ...data };
                localStorage.setItem('user', JSON.stringify(updatedLocal));
            }
        }
    } catch (error) {
        console.error("Gagal ambil profile:", error);
    } finally {
        setIsChecking(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-10">

       <button 
          onClick={() => router.push('/dashboard')} 
          className="group flex items-center justify-center w-10 h-10 rounded-full bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 transition"
          title="Kembali"
        >
          <svg className="w-5 h-5 text-slate-400 group-hover:text-white transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
      
      {/* --- HEADER USER INFO --- */}
      <div className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-800 relative overflow-hidden">
          {isChecking && (
            <div className="absolute top-0 left-0 w-full h-0.5 bg-slate-800 overflow-hidden">
                <div className="w-full h-full bg-emerald-500 animate-progress origin-left-right"></div>
            </div>
          )}

          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-2xl font-bold text-white shadow-lg shrink-0">
              <span>{user.username ? user.username.charAt(0).toUpperCase() : 'U'}</span>
          </div>
          <div>
              <h2 className="text-lg font-bold text-white capitalize">{user.username || 'User'}</h2>
              <span 
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                    user.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    user.status === 'trial' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    'bg-red-500/10 text-red-400 border-red-500/20'
                }`}
              >
                  {user.status || 'Checking...'}
              </span>
          </div>
      </div>

      {/* --- MENU 1: DATA LOGIN --- */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-800">
              <h3 className="font-bold text-white flex items-center gap-2">
                  <span>👤</span> Data Login
              </h3>
          </div>
          <div className="p-6 text-center space-y-4">
              <p className="text-sm text-slate-400">
                  Ganti username atau password akun Anda untuk keamanan.
              </p>
              <Link 
                href="/dashboard/pengaturan/profile" 
                className="block w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 rounded-xl border border-slate-700 transition"
              >
                  Update Username & Password
              </Link>
          </div>
      </div>

      {/* --- MENU 2: PENGATURAN LIMIT --- */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-800">
              <h3 className="font-bold text-white flex items-center gap-2">
                  <span>💳</span> Pengaturan limit
              </h3>
          </div>
          <div className="p-6 text-center space-y-4">
              <p className="text-sm text-slate-400">
                  Pasang Limit Pemberitahuan Pengeluaran Harian Anda
              </p>
              <Link 
                href="/dashboard/pengaturan/limit" 
                className="block w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 rounded-xl border border-slate-700 transition"
              >
                  Atur Limit Pengeluaran Harian
              </Link>
          </div>
      </div>

      {/* --- MENU 3: INTEGRASI TELEGRAM --- */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden relative">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-white flex items-center gap-2">
                  <span>🔗</span> Integrasi Telegram
              </h3>
              
              {user.telegram_id && user.telegram_id !== 0 ? (
                  <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full border border-blue-500/20 font-bold animate-pulse">
                      TERHUBUNG
                  </span>
              ) : (
                  <span className="text-[10px] bg-slate-700 text-slate-400 px-2 py-1 rounded-full border border-slate-600 font-bold">
                      BELUM CONNECT
                  </span>
              )}
          </div>

          <div className="p-6 space-y-4">
              {user.telegram_id && user.telegram_id !== 0 ? (
                  <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
                          <p className="text-xs text-blue-300 uppercase font-bold mb-1">Telegram ID Anda</p>
                          <p className="text-xl font-mono font-bold text-white tracking-wider">{user.telegram_id}</p>
                      </div>
                      <p className="text-xs text-slate-500 text-center">
                          Akun Anda sudah terhubung. Anda bisa input transaksi lewat bot.
                      </p>
                      <Link href="/dashboard/pengaturan/telegram" className="block w-full text-center text-sm text-slate-400 hover:text-white py-2 transition underline decoration-slate-700 underline-offset-4">
                          Ingin Ganti Akun Telegram?
                      </Link>
                  </div>
              ) : (
                  <div className="text-center space-y-4 animate-in fade-in zoom-in duration-300">
                      <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-3xl opacity-50">
                          ✈️
                      </div>
                      <p className="text-sm text-slate-400">
                          Hubungkan akun Telegram agar bisa mencatat keuangan lewat chat bot secara cepat.
                      </p>
                      <Link href="/dashboard/pengaturan/telegram" className="block w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-900/20 transition">
                          🔗 Bind ID Telegram Sekarang
                      </Link>
                  </div>
              )}
          </div>
      </div>

      {/* --- MENU 4: ABOUT / TENTANG --- */}
<div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 text-center space-y-4">
  
  {/* Logo clickable */}
  <a
    href="https://www.a76labs.online"
    target="_blank"
    rel="noopener noreferrer"
    className="relative w-20 h-14 mx-auto block opacity-80 hover:opacity-100 transition duration-300"
  >
    <Image 
      src="/images/a76.png" 
      alt="A76 Labs" 
      fill 
      className="object-contain"
    />
  </a>

  <div className="space-y-2">
    {/* Text clickable */}
    <a
      href="https://www.a76labs.online"
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm text-slate-300 font-medium hover:text-white transition"
    >
      Developed by A76 Labs
    </a>

    <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
      Butuh bantuan, ada pertanyaan, atau ingin melaporkan masalah? Hubungi admin kami langsung via Telegram.
    </p>
  </div>

  {/* Telegram Button */}
  <a 
    href="https://t.me/A76Labs" 
    target="_blank" 
    rel="noopener noreferrer"
    className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold px-4 py-2 rounded-full border border-slate-700 transition shadow-sm hover:shadow-md"
  >
    <svg
      className="w-4 h-4"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.188-2.85 5.18-4.686c.223-.198-.054-.306-.346-.106l-6.4 4.022-2.76-.848c-.602-.187-.61-.6.125-.892l10.78-4.156c.5-.187.943.128.808.815z"/>
    </svg>
    Hubungi Admin Support
  </a>
</div>


    </div>
  );
}