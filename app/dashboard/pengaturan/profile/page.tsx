// app/dashboard/pengaturan/profile/page.tsx
"use client";

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UpdateProfilePage() {
  const router = useRouter();
  
  const [form, setForm] = useState({ username: '', password: '', confirmPassword: '' });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setForm(prev => ({ ...prev, username: u.username || '' }));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    // Validasi Client
    if (form.password && form.password !== form.confirmPassword) {
      setIsError(true);
      setMessage("Konfirmasi password tidak cocok!");
      return;
    }
    if (form.password && form.password.length < 6) {
      setIsError(true);
      setMessage("Password minimal 6 karakter.");
      return;
    }

    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('jwt_token');
      const payload: any = { username: form.username };
      if (form.password) payload.password = form.password;

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
        localStorage.setItem('username', data.user.username);
        
        setMessage("✅ Data berhasil disimpan! Mengalihkan...");
        setTimeout(() => router.push('/dashboard/pengaturan'), 1500);
      } else {
        setIsError(true);
        setMessage(data.error || "Gagal update profile.");
      }
    } catch (e) {
      setIsError(true);
      setMessage("Terjadi kesalahan koneksi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 px-4">
      {/* Navbar Back Sederhana */}
      <div className="mb-6">
        <Link href="/dashboard/pengaturan" className="text-slate-400 hover:text-white flex items-center gap-2 text-sm">
            ← Kembali
        </Link>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
        <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-slate-800 mx-auto flex items-center justify-center text-3xl mb-3">
                🔐
            </div>
            <h2 className="text-lg font-bold text-white">Amankan Akunmu</h2>
            <p className="text-xs text-slate-400">Kosongkan password jika hanya ingin ganti username.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Username Baru</label>
                <input 
                    type="text" 
                    value={form.username}
                    onChange={(e) => setForm({...form, username: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 focus:border-emerald-500 outline-none transition text-sm text-white"
                />
            </div>

            <div className="border-t border-slate-800 my-4"></div>

            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password Baru (Opsional)</label>
                <input 
                    type="password" 
                    value={form.password}
                    onChange={(e) => setForm({...form, password: e.target.value})}
                    placeholder="Biarkan kosong jika tidak ubah"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 focus:border-emerald-500 outline-none transition text-sm text-white"
                />
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Konfirmasi Password</label>
                <input 
                    type="password" 
                    value={form.confirmPassword}
                    onChange={(e) => setForm({...form, confirmPassword: e.target.value})}
                    placeholder="Ulangi password baru"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 focus:border-emerald-500 outline-none transition text-sm text-white"
                />
            </div>

            <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-900/20 transition flex items-center justify-center gap-2"
            >
                {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
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