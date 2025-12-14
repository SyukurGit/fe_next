// app/superadmin/login/page.tsx
"use client";

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true' 
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (res.ok) {
        // Cek Role Admin
        if (data.user.role !== 'admin') {
            setError("Anda bukan SuperAdmin! Akses ditolak.");
            setIsLoading(false);
            return;
        }

        // Simpan token
        localStorage.setItem('jwt_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirect ke Panel Admin
        router.push('/superadmin/dashboard');
      } else {
        setError(data.error || 'Login gagal');
      }
    } catch (err) {
      setError("Gagal koneksi ke server");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-100">
      <div className="w-full max-w-sm p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl">
        <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl overflow-hidden mx-auto mb-3 shadow-md relative">
                <Image src="/images/logobot.png" alt="Logo" fill className="object-cover" />
            </div>
            <span className="font-bold text-lg text-white block">
                Dompet<span className="text-emerald-400">Pintar</span>Bot
            </span>
            <p className="text-xs text-slate-500">Area terlarang. Khusus pemilik sistem.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
            <div>
                <label className="text-xs uppercase font-bold text-slate-500">Username</label>
                <input 
                    type="text" 
                    value={form.username}
                    onChange={e => setForm({...form, username: e.target.value})}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 focus:border-red-500 outline-none transition text-sm"
                />
            </div>
            <div>
                <label className="text-xs uppercase font-bold text-slate-500">Password</label>
                <input 
                    type="password" 
                    value={form.password}
                    onChange={e => setForm({...form, password: e.target.value})}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 focus:border-red-500 outline-none transition text-sm"
                />
            </div>

            <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-lg transition shadow-lg shadow-red-900/20"
            >
                {isLoading ? 'Memproses...' : 'Masuk Panel'}
            </button>
            
            {error && <p className="text-red-400 text-xs text-center mt-2">{error}</p>}
        </form>
      </div>
    </div>
  );
}