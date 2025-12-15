// app/superadmin/user/[id]/page.tsx
"use client";

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface UserDetail {
  user: {
    id: number;
    username: string;
    role: string;
    status: string;
    telegram_id?: number | null;
  };
  stats: {
    income: number;
    expense: number;
    balance: number;
  };
  last_transaction?: {
    created_at: string;
  } | null;
}

export default function AdminUserDetailPage() {
  const router = useRouter();
  const params = useParams(); 
  const userId = params.id;

  const [data, setData] = useState<UserDetail | null>(null);
  
  // State form edit
  const [form, setForm] = useState({ 
    username: '', 
    password: '', 
    telegram_id: '' 
  });
  
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    fetchDetails();
  }, []);

  // Update form state ketika data user berhasil diambil
  useEffect(() => {
    if (data?.user) {
        setForm(prev => ({
            ...prev,
            telegram_id: data.user.telegram_id ? data.user.telegram_id.toString() : ''
        }));
    }
  }, [data]);

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('jwt_token');
    const headers = { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${token}`, 
        'ngrok-skip-browser-warning': 'true' 
    };
    return await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, { ...options, headers });
  };

  const fetchDetails = async () => {
    const res = await fetchWithAuth(`/api/admin/users/${userId}/stats`);
    if (res.ok) {
        const json = await res.json();
        setData(json);
    } else {
        alert('Gagal mengambil data user');
        router.push('/superadmin/dashboard');
    }
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('Menyimpan...'); setIsError(false);
    
    const payload: any = {};
    if(form.username && form.username !== data?.user.username) payload.username = form.username;
    if(form.password) payload.password = form.password;
    
    // Konversi Telegram ID: string kosong -> null, angka -> integer
    if(form.telegram_id !== '') {
        payload.telegram_id = parseInt(form.telegram_id);
    } else {
        // Jika dikosongkan, kirim null untuk unbind (opsional, tergantung backend)
        // payload.telegram_id = null; 
    }

    if(Object.keys(payload).length === 0) {
        setMessage('Tidak ada perubahan data.');
        return;
    }

    const res = await fetchWithAuth(`/api/admin/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
    });

    const result = await res.json();
    if(res.ok) {
        setMessage('✅ Berhasil disimpan!');
        // Reset password field saja, username & tele biarkan terisi
        setForm(prev => ({ ...prev, password: '' })); 
        fetchDetails(); // Refresh data
    } else {
        setIsError(true);
        setMessage(`❌ ${result.error || 'Gagal update'}`);
    }
  };

  const formatRupiah = (num: number) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num || 0);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
  };

  if (!data) return <div className="text-center py-20 text-slate-500">Memuat data user...</div>;

  return (
    <div className="space-y-6">
        <div className="flex items-center gap-4 mb-4">
            <Link href="/superadmin/dashboard" className="text-slate-400 hover:text-white text-sm">
                &larr; Kembali
            </Link>
            <h1 className="font-bold text-xl">Detail Pengguna</h1>
        </div>

        {/* INFO CARD UTAMA */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start gap-6">
            <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-3xl font-bold text-white capitalize">{data.user.username}</h2>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                        data.user.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        data.user.status === 'trial' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                        {data.user.status}
                    </span>
                </div>
                
                <div className="space-y-1 text-sm text-slate-400">
                    <p>Role: <span className="text-slate-200 font-semibold uppercase">{data.user.role}</span></p>
                    <p>ID Telegram: <span className="font-mono text-emerald-400">{data.user.telegram_id || 'Belum Bind'}</span></p>
                    <p>Terakhir Input: <span className="text-orange-400 font-semibold">{formatDate(data.last_transaction?.created_at)}</span></p>
                </div>
            </div>
            
            <Link href={`/superadmin/user/${userId}/status`} 
               className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg border border-slate-700 shadow-sm transition flex items-center gap-2">
                <span>⚙</span> Kelola Subscription
            </Link>
        </div>

        {/* STATISTIK KEUANGAN */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900/50 border border-emerald-500/20 rounded-xl p-4">
                <p className="text-[10px] uppercase tracking-widest text-emerald-400">Total Masuk</p>
                <p className="text-xl font-bold text-white mt-1">{formatRupiah(data.stats.income)}</p>
            </div>
            <div className="bg-slate-900/50 border border-rose-500/20 rounded-xl p-4">
                <p className="text-[10px] uppercase tracking-widest text-rose-400">Total Keluar</p>
                <p className="text-xl font-bold text-white mt-1">{formatRupiah(data.stats.expense)}</p>
            </div>
            <div className="bg-slate-900/50 border border-sky-500/20 rounded-xl p-4">
                <p className="text-[10px] uppercase tracking-widest text-sky-400">Sisa Saldo</p>
                <p className="text-xl font-bold text-white mt-1">{formatRupiah(data.stats.balance)}</p>
            </div>
        </div>

        {/* EDIT FORM */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-6 text-orange-400 border-b border-slate-800 pb-2">
                Edit Data Akun
            </h3>
            
            <form onSubmit={handleUpdate} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Username Baru</label>
                        <input 
                            type="text" 
                            value={form.username}
                            onChange={e => setForm({...form, username: e.target.value})}
                            placeholder={data.user.username} 
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:border-orange-500 outline-none transition placeholder-slate-600" 
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Telegram ID</label>
                        <input 
                            type="number" 
                            value={form.telegram_id}
                            onChange={e => setForm({...form, telegram_id: e.target.value})}
                            placeholder="Contoh: 123456789" 
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:border-orange-500 outline-none transition placeholder-slate-600 font-mono" 
                        />
                        <p className="text-[10px] text-slate-500 mt-1">
                            Current ID: {data.user.telegram_id || 'Kosong'}
                        </p>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Password Baru</label>
                    <input 
                        type="text" 
                        value={form.password}
                        onChange={e => setForm({...form, password: e.target.value})}
                        placeholder="Isi hanya jika ingin ganti password..." 
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:border-orange-500 outline-none transition placeholder-slate-600" 
                    />
                </div>
                
                <div className="pt-4 flex items-center justify-between border-t border-slate-800">
                    <button type="submit" className="bg-orange-600 hover:bg-orange-500 text-white font-bold py-2.5 px-6 rounded-lg text-sm transition shadow-lg shadow-orange-900/20">
                        Simpan Perubahan
                    </button>
                    {message && <span className={`text-xs font-medium px-3 py-1 rounded ${isError ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>{message}</span>}
                </div>
            </form>
        </div>
    </div>
  );
}