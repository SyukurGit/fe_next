// app/login/page.tsx
"use client";

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface LoginResponse {
  token: string;
  user: {
    username: string;
    status: string;
    // tambahkan field lain jika perlu
  };
  error?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) throw new Error("API URL belum disetting");

      const res = await fetch(`${apiUrl}/login`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true' 
        },
        body: JSON.stringify(form)
      });

      const data: LoginResponse = await res.json();

      if (res.ok) {
        localStorage.setItem('jwt_token', data.token);
        localStorage.setItem('username', data.user.username);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Logic redirect pintar
        if (data.user.status === 'suspended') {
          router.push('dashboard/suspended');
        } else {
          router.push('/dashboard');
        }
      } else {
        setError(data.error || 'Login gagal, periksa username/password.');
      }
    } catch (err) {
      setError("Gagal terhubung ke server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-100">
      <div className="w-full max-w-sm p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl">
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
            <p className="text-xs text-slate-500 mt-1">Silakan login untuk akses dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Username</label>
                <input 
                    type="text" 
                    value={form.username}
                    onChange={(e) => setForm({...form, username: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 focus:border-emerald-500 outline-none transition text-sm"
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
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 focus:border-emerald-500 outline-none transition text-sm"
                    placeholder="••••••••" 
                    required 
                />
            </div>

            <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg transition shadow-lg shadow-emerald-900/20 text-sm flex justify-center items-center"
            >
                {isLoading ? <span className="animate-pulse">Memproses...</span> : "Masuk Dashboard"}
            </button>

            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-center">
                    <p className="text-red-400 text-xs font-medium">{error}</p>
                </div>
            )}
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
            Belum punya akun? <Link href="/register" className="text-emerald-400 hover:text-emerald-300 font-medium hover:underline">Daftar Trial Gratis</Link>
        </p>
      </div>
    </div>
  );
}