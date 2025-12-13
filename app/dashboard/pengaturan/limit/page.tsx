// app/dashboard/pengaturan/limit/page.tsx
"use client";

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';

export default function LimitSettingsPage() {
  const [form, setForm] = useState({ daily_limit: '', alert_message: '' });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);

  useEffect(() => {
    fetchCurrentSettings();
  }, []);

  const fetchCurrentSettings = async () => {
    try {
      const token = localStorage.getItem('jwt_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/settings`, {
        headers: { 
            'Authorization': `Bearer ${token}`,
            'ngrok-skip-browser-warning': 'true'
        }
      });
      if (res.ok) {
        const data = await res.json();
        setForm({
            daily_limit: data.daily_limit || '',
            alert_message: data.alert_message || ''
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setIsError(false);

    const payload = {
      daily_limit: parseInt(form.daily_limit) || 0,
      alert_message: form.alert_message
    };

    try {
      const token = localStorage.getItem('jwt_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/settings`, {
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
        setMessage('✅ ' + data.message);
      } else {
        throw new Error(data.error || 'Gagal menyimpan');
      }
    } catch (e: any) {
      setIsError(true);
      setMessage('❌ ' + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4 space-y-8">
      <div className="mb-6">
        <Link href="/dashboard/pengaturan" className="text-slate-400 hover:text-white flex items-center gap-2 text-sm">
            ← Kembali
        </Link>
      </div>
        
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mx-auto text-2xl mb-4">🚨</div>
        <h2 className="text-xl font-bold text-white">Atur Pesan Limit Harian</h2>
        <p className="text-sm text-slate-400">Bot Telegram akan mengirim pesan Alert jika melebihi batas limit.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl"></div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Batas Pengeluaran Harian (Rp)</label>
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500 font-bold">Rp</span>
                    <input 
                        type="number" 
                        value={form.daily_limit}
                        onChange={(e) => setForm({...form, daily_limit: e.target.value})}
                        placeholder="Contoh: 100000" 
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition placeholder-slate-600 font-mono"
                    />
                </div>
                <p className="text-[10px] text-slate-500 mt-2">Set ke 0 untuk mematikan fitur ini.</p>
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Pesan Peringatan di Bot Telegram</label>
                <textarea 
                    value={form.alert_message}
                    onChange={(e) => setForm({...form, alert_message: e.target.value})}
                    rows={3} 
                    placeholder="Contoh: Woy boros!!" 
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition placeholder-slate-600 text-sm"
                ></textarea>
                <p className="text-[10px] text-slate-500 mt-2">Pesan ini muncul otomatis di Telegram ketika input pengeluaran tambahan melebihi limit.</p>
            </div>

            <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-amber-900/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </button>

            {message && (
                <div className={`text-center p-3 rounded-lg text-xs font-medium ${isError ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                    {message}
                </div>
            )}
        </form>
      </div>

      <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-4 flex gap-3 items-start">
        <span className="text-lg">💡</span>
        <div>
            <h4 className="text-sm font-semibold text-slate-200">Tips</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Gunakan kata-kata yang "tegas" di pesan alert agar Anda lebih sadar budget.
            </p>
        </div>
      </div>
    </div>
  );
}