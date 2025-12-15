// app/dashboard/pengaturan/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface User {
  username: string;
  status: string;
  telegram_id?: number;
  telegram_username?: string;
}

export default function PengaturanAkunPage() {
  const router = useRouter();
  const [user, setUser] = useState<User>({
    username: '',
    status: '',
  });
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    // 1. Cek token
    const token = localStorage.getItem('jwt_token');
    if (!token) {
        router.push('/login');
        return;
    }

    // 2. Load LocalStorage (Biar UI cepat muncul dulu)
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const userData = JSON.parse(userStr);
            setUser(userData);
        } catch (e) {
            console.error("Gagal load user local", e);
        }
    }

    // 3. AMBIL DATA TERBARU DARI SERVER (Live Sync)
    fetchLatestProfile(token);

  }, [router]);

  const fetchLatestProfile = async (token: string) => {
    setIsChecking(true);
    try {
        // --- PERBAIKAN DISINI ---
        // Tambahkan timestamp (?t=...) agar browser tidak pakai cache lama
        // Tambahkan cache: 'no-store' agar Next.js selalu minta data baru
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/profile?t=${new Date().getTime()}`, {
            method: 'GET',
            headers: { 
                'Authorization': `Bearer ${token}`, 
                'ngrok-skip-browser-warning': 'true' 
            },
            cache: 'no-store', // Paksa ambil fresh data
            next: { revalidate: 0 } // Tambahan untuk Next.js App Router
        });

        if (res.ok) {
            const json = await res.json();
            // Ambil data user dari respon (bisa json.data, json.user, atau root json)
            const freshUser = json.data || json.user || json; 

            console.log("🔥 Data Segar dari Server:", freshUser); // Cek console browser untuk memastikan data masuk

            // Update State UI
            setUser(freshUser);

            // Update LocalStorage agar halaman lain juga tahu
            localStorage.setItem('user', JSON.stringify(freshUser));
            if (freshUser.username) {
                localStorage.setItem('username', freshUser.username);
            }
        }
    } catch (e) {
        console.error("Gagal cek profil terbaru:", e);
    } finally {
        setIsChecking(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-10">
      
      {/* --- HEADER USER INFO --- */}
      <div className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-800 relative overflow-hidden">
          {/* Indikator Loading saat sync data */}
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
                  {user.status || '...'}
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
              
              {user.telegram_id ? (
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
              
              {user.telegram_id ? (
                  /* KONDISI: SUDAH TERHUBUNG */
                  <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
                          <p className="text-xs text-blue-300 uppercase font-bold mb-1">Telegram ID</p>
                          <p className="text-xl font-mono font-bold text-white tracking-wider">{user.telegram_id}</p>
                          
                          {user.telegram_username && (
                              <div className="mt-2 pt-2 border-t border-blue-500/20">
                                  <p className="text-[10px] text-blue-300">Username: <span className="text-white font-bold">@{user.telegram_username}</span></p>
                              </div>
                          )}
                      </div>
                      <p className="text-xs text-slate-500 text-center">
                          Akun Anda sudah terhubung. Anda bisa input transaksi lewat bot.
                      </p>
                      <Link href="/dashboard/pengaturan/telegram" className="block w-full text-center text-sm text-slate-400 hover:text-white py-2 transition">
                          Ganti Akun Telegram?
                      </Link>
                  </div>
              ) : (
                  /* KONDISI: BELUM TERHUBUNG */
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

    </div>
  );
}