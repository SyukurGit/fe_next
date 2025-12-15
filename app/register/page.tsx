// app/register/page.tsx
"use client";

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function RegisterPage() {
  const router = useRouter();
  
  const [form, setForm] = useState({ 
    username: '', 
    password: '', 
    confirm_password: '' 
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    // Validasi Client Side
    if (!form.username || !form.password) {
      setIsError(true);
      setMessage("Username dan password wajib diisi.");
      return;
    }
    
    if (form.password !== form.confirm_password) {
      setIsError(true);
      setMessage("Password dan konfirmasi tidak cocok.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          username: form.username.trim(),
          password: form.password,
          confirm_password: form.confirm_password
        })
      });

      const data = await res.json();

      if (res.ok) {
        // Sukses
        setIsError(false);
        setMessage(data.message || "Registrasi berhasil! Mengalihkan ke Login...");
        
        // Redirect setelah 1.5 detik
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      } else {
        // Gagal dari API
        setIsError(true);
        setMessage(data.error || data.message || "Gagal mendaftar. Username mungkin sudah dipakai.");
      }

    } catch (err) {
      console.error(err);
      setIsError(true);
      setMessage("Gagal koneksi ke server Backend!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-100">
      <div className="w-full max-w-sm p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl m-4">
        
        {/* Header Logo */}
        <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-xl overflow-hidden mx-auto mb-4 shadow-lg shadow-emerald-500/20 relative">
                <Image 
                  src="/images/croplogobot.png" 
                  alt="Logo" 
                  fill
                  className="object-cover"
                />
            </div>
            <h1 className="font-bold text-xl text-white">
                Dompet<span className="text-emerald-400">Pintar</span>Bot
            </h1>
            <p className="text-xs text-slate-500 mt-1">Daftar untuk mendapatkan Trial Gratis 1 Hari.</p>
        </div>

        {/* Form Register */}
        <form onSubmit={handleRegister} className="space-y-5">
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Username</label>
                <input 
                    type="text" 
                    value={form.username}
                    onChange={(e) => setForm({...form, username: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition text-sm text-white"
                    placeholder="Masukkan username..." 
                    required 
                />
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
                <input 
                    type="password" 
                    value={form.password}
                    onChange={(e) => setForm({...form, password: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition text-sm text-white"
                    placeholder="••••••••" 
                    required 
                />
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Konfirmasi Password</label>
                <input 
                    type="password" 
                    value={form.confirm_password}
                    onChange={(e) => setForm({...form, confirm_password: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition text-sm text-white"
                    placeholder="••••••••" 
                    required 
                />
            </div>

            <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg transition shadow-lg shadow-emerald-900/20 text-sm flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <span className="animate-pulse">Memproses...</span>
                ) : (
                    "Daftar Sekarang"
                )}
            </button>

            {/* Pesan Error / Sukses */}
            {message && (
                <div className={`p-3 rounded-lg text-center border ${
                    isError 
                    ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                }`}>
                    <p className="text-xs font-medium">{message}</p>
                </div>
            )}
        </form>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-500 mt-6">
            Sudah punya akun? <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-medium hover:underline">Login di sini</Link>
        </p>
        <p className="text-center text-xs text-slate-400 mt-2">
            Login Superadmin? <Link href="/superadmin/login" className="text-emerald-400 hover:text-emerald-300 underline">klik di sini</Link>
        </p>
      </div>
    </div>
  );
}