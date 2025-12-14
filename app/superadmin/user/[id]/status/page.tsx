// app/superadmin/user/[id]/status/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function UserStatusPage() {
  const params = useParams();
  const userId = params.id;
  const router = useRouter();

  const [user, setUser] = useState<any>({});
  const [addDays, setAddDays] = useState<number>(0);
  const [newStatus, setNewStatus] = useState<string>('');
  const [daysRemaining, setDaysRemaining] = useState<number>(0);

  useEffect(() => {
    fetchUserDetail();
  }, []);

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('jwt_token');
    const headers = { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${token}`, 
        'ngrok-skip-browser-warning': 'true' 
    };
    return await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, { ...options, headers });
  };

  const fetchUserDetail = async () => {
    const res = await fetchWithAuth(`/api/admin/users/${userId}/stats`);
    if(res.ok) {
        const data = await res.json();
        setUser(data.user);
        
        // Hitung sisa hari
        const now = new Date();
        const end = new Date(data.user.trial_ends_at);
        const diffTime = end.getTime() - now.getTime();
        setDaysRemaining(Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }
  };

  const saveChanges = async () => {
    const payload = {
        add_trial_days: Number(addDays),
        status: newStatus
    };

    try {
        const res = await fetchWithAuth(`/api/admin/users/${userId}/status`, {
            method: 'PATCH',
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if(res.ok) {
            alert("✅ Berhasil! Data diperbarui.");
            setAddDays(0);
            setNewStatus('');
            fetchUserDetail(); // Refresh data
        } else {
            alert("Gagal: " + (data.error || "Unknown Error"));
        }
    } catch(e) {
        alert("Error koneksi");
    }
  };

  const formatDate = (dateStr: string) => {
    if(!dateStr) return '-';
    return new Date(dateStr).toLocaleString('id-ID', { 
        day: 'numeric', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
  };

  if (!user.username) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            
            <div className="bg-slate-950 p-6 border-b border-slate-800 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold text-white">Edit Status User</h1>
                    <p className="text-xs text-slate-500 mt-1">Atur masa aktif dan status langganan.</p>
                </div>
                <Link href={`/superadmin/user/${userId}`} className="text-slate-400 hover:text-white text-sm">✕ Tutup</Link>
            </div>

            <div className="p-6 space-y-6">
                
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                    <div className="flex justify-between mb-2">
                        <span className="text-xs text-slate-400">Username</span>
                        <span className="text-sm font-bold text-emerald-400">{user.username}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                        <span className="text-xs text-slate-400">Status Saat Ini</span>
                        <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${
                            user.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                            user.status === 'trial' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-red-500/20 text-red-400'
                        }`}>
                            {user.status}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-xs text-slate-400">Expired Pada</span>
                        <span className="text-sm font-mono text-white">{formatDate(user.trial_ends_at)}</span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-700 text-center">
                        <span className="text-xs text-slate-500">Sisa Waktu: </span>
                        <span className={`font-bold ${daysRemaining > 0 ? 'text-blue-400' : 'text-red-400'}`}>
                            {daysRemaining} Hari
                        </span>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2">Tambah / Kurangi Durasi</label>
                    <div className="flex gap-2 mb-2">
                        <input 
                            type="number" 
                            value={addDays}
                            onChange={(e) => setAddDays(parseInt(e.target.value) || 0)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 focus:border-emerald-500 outline-none text-white font-mono"
                        />
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        <button onClick={() => setAddDays(3)} className="bg-slate-800 hover:bg-slate-700 text-xs py-1.5 rounded border border-slate-700 transition">+3 Hari</button>
                        <button onClick={() => setAddDays(30)} className="bg-slate-800 hover:bg-slate-700 text-xs py-1.5 rounded border border-slate-700 transition">+30 Hari</button>
                        <button onClick={() => setAddDays(-1)} className="bg-red-900/20 hover:bg-red-900/40 text-red-400 text-xs py-1.5 rounded border border-red-900/30 transition">-1 Hari</button>
                        <button onClick={() => setAddDays(-7)} className="bg-red-900/20 hover:bg-red-900/40 text-red-400 text-xs py-1.5 rounded border border-red-900/30 transition">-7 Hari</button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2">Paksa Ganti Status (Opsional)</label>
                    <select 
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 focus:border-emerald-500 outline-none text-sm"
                    >
                        <option value="">-- Biarkan Otomatis --</option>
                        <option value="active">Active (Premium)</option>
                        <option value="trial">Trial (Percobaan)</option>
                        <option value="suspended">Suspended (Bekukan)</option>
                    </select>
                </div>

                <button onClick={saveChanges} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-emerald-900/20 transition">
                    💾 Simpan Perubahan
                </button>

            </div>
        </div>
    </div>
  );
}