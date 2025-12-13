// app/dashboard/pengaturan/telegram/page.tsx
"use client";

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function BindTelegramPage() {
  const router = useRouter();
  const [telegramId, setTelegramId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);

  useEffect(() => {
    // Pre-fill jika sudah ada di localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const u = JSON.parse(userStr);
      if(u.telegram_id) setTelegramId(u.telegram_id.toString());
    }
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    if (!telegramId) {
        setIsError(true);
        setMessage("ID Telegram wajib diisi!");
        return;
    }

    setIsLoading(true);
    
    // Kirim sebagai integer
    const payload = { telegram_id: parseInt(telegramId) };

    try {
      const token = localStorage.getItem('jwt_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/profile`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        // Update LocalStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setMessage("✅ Berhasil terhubung! Bot siap digunakan.");
        setTimeout(() => router.push('/dashboard/pengaturan'), 1500);
      } else {
        setIsError(true);
        setMessage(data.error || "Gagal bind telegram.");
      }
    } catch (e) {
      setIsError(true);
      setMessage("Koneksi error.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 px-4 space-y-6">
      <div className="mb-6">
        <Link href="/dashboard/pengaturan" className="text-slate-400 hover:text-white flex items-center gap-2 text-sm">
            ← Kembali
        </Link>
      </div>

      <div className="bg-blue-600/10 border border-blue-600/20 rounded-2xl p-5 relative overflow-hidden">
        <div className="absolute -right-4 -top-4 w-20 h-20 bg-blue-500/20 rounded-full blur-xl"></div>
        
        <h3 className="font-bold text-blue-400 mb-2">Langkah 1: Dapatkan ID</h3>
        <ol className="list-decimal list-inside text-sm text-slate-300 space-y-2">
            <li>Buka aplikasi Telegram.</li>
            <li>Cari bot: <a href="https://t.me/DompetPintar_A76Labs_Bot" target="_blank" className="text-white font-bold underline decoration-blue-500">@DompetPintar_A76Labs_Bot</a></li>
            <li>Klik <b>Start</b> atau ketik <code>/start</code>.</li>
            <li>Bot akan membalas dengan info ID Anda jika belum terdaftar.</li>
            <li>Salin ID tersebut (hanya angka).</li>
        </ol>
        
        <a href="https://t.me/DompetPintar_A76Labs_Bot" target="_blank" className="mt-4 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.188-2.85 5.18-4.686c.223-.198-.054-.306-.346-.106l-6.4 4.022-2.76-.848c-.602-.187-.61-.6.125-.892l10.78-4.156c.5-.187.943.128.808.815z"/></svg>
            Buka Bot Sekarang
        </a>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
        <h3 className="font-bold text-white mb-4">Langkah 2: Masukkan ID</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Telegram ID (Angka)</label>
                <input 
                    type="number" 
                    value={telegramId}
                    onChange={(e) => setTelegramId(e.target.value)}
                    placeholder="Contoh: 123456789"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition text-sm text-white font-mono"
                />
            </div>

            <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-900/20 transition flex items-center justify-center gap-2"
            >
                {isLoading ? 'Menghubungkan...' : 'Simpan & Hubungkan'}
            </button>

            {message && (
                <p className={`text-xs text-center p-3 rounded-lg border ${isError ? 'text-red-400 bg-red-400/10 border-red-400/20' : 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'}`}>
                    {message}
                </p>
            )}
        </form>
      </div>
    </div>
  );
}