// app/superadmin/dashboard/page.tsx
"use client";

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';

interface User {
  id: number;
  username: string;
  role: string;
  status: string;
  telegram_id?: number;
}

export default function AdminPanelPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form Tambah User
  const [newUser, setNewUser] = useState({ username: '', password: '', telegram_id: '' });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('jwt_token');
    const headers = { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${token}`, 
        'ngrok-skip-browser-warning': 'true' 
    };
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, { ...options, headers });
        if (res.status === 401) {
            window.location.href = '/superadmin/login';
            return null;
        }
        return res;
    } catch (e) {
        return null;
    }
  };

  const fetchUsers = async () => {
    const res = await fetchWithAuth('/api/admin/users');
    if (res && res.ok) {
        const data = await res.json();
        if (data.data) setUsers(data.data);
    }
  };

  const createUser = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('Memproses...');
    setIsError(false);

    const payload = { 
        ...newUser, 
        telegram_id: newUser.telegram_id ? parseInt(newUser.telegram_id) : null 
    };
    
    const res = await fetchWithAuth('/api/admin/users', { 
        method: 'POST', 
        body: JSON.stringify(payload) 
    });

    if (res && res.ok) {
        setMessage('✅ User VIP dibuat!');
        setNewUser({ username: '', password: '', telegram_id: '' });
        fetchUsers();
    } else {
        setIsError(true);
        setMessage('❌ Gagal membuat user');
    }
  };

  const deleteUser = async (id: number) => {
    if(!confirm('Hapus user ini permanen?')) return;
    const res = await fetchWithAuth(`/api/admin/users/${id}`, { method: 'DELETE' });
    if (res && res.ok) fetchUsers();
  };

  // Filter User
  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
        {/* FORM TAMBAH USER */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
            <h2 className="text-lg font-semibold mb-4 text-emerald-400">Tambah User Baru (VIP)</h2>
            <form onSubmit={createUser} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                    <label className="text-xs text-slate-500 uppercase font-bold">Username</label>
                    <input 
                        type="text" required
                        value={newUser.username}
                        onChange={e => setNewUser({...newUser, username: e.target.value})}
                        className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 outline-none" 
                    />
                </div>
                <div>
                    <label className="text-xs text-slate-500 uppercase font-bold">Password</label>
                    <input 
                        type="text" required
                        value={newUser.password}
                        onChange={e => setNewUser({...newUser, password: e.target.value})}
                        className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 outline-none" 
                    />
                </div>
                <div>
                    <label className="text-xs text-slate-500 uppercase font-bold">Telegram ID (Opsional)</label>
                    <input 
                        type="number"
                        value={newUser.telegram_id}
                        onChange={e => setNewUser({...newUser, telegram_id: e.target.value})}
                        className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 outline-none" 
                    />
                </div>
                <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg text-sm transition h-[38px] shadow-lg shadow-emerald-500/20">
                    + Buat User
                </button>
            </form>
            {message && <p className={`text-xs mt-3 ${isError ? 'text-red-400' : 'text-emerald-400'}`}>{message}</p>}
        </div>

        {/* LIST USER */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-lg font-semibold">Daftar Pengguna</h2>
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">🔍</span>
                    <input 
                        type="text" 
                        placeholder="Cari username..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="bg-slate-950 border border-slate-700 text-sm rounded-lg pl-9 pr-4 py-2 focus:border-emerald-500 outline-none w-full sm:w-64"
                    />
                </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-400">
                    <thead className="bg-slate-950 text-xs uppercase font-medium text-slate-500 border-b border-slate-800">
                        <tr>
                            <th className="px-6 py-3">User (Klik Detail)</th>
                            <th className="px-6 py-3">Role</th> 
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Telegram ID</th>
                            <th className="px-6 py-3 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="hover:bg-slate-800/50 transition group">
                                <td className="px-6 py-3">
                                    <Link href={`/superadmin/user/${user.id}`} 
                                       className="font-bold text-white group-hover:text-emerald-400 group-hover:underline transition flex items-center gap-2 w-fit">
                                        <span>{user.username}</span>
                                        <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                                    </Link>
                                    <div className="text-[10px] text-slate-500 font-mono">ID: {user.id}</div>
                                </td>
                                
                                <td className="px-6 py-3">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                                        user.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                    }`}>
                                        {user.role}
                                    </span>
                                </td>

                                <td className="px-6 py-3">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                                        user.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                        user.status === 'trial' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                        'bg-red-500/10 text-red-400 border-red-500/20'
                                    }`}>
                                        {user.status}
                                    </span>
                                </td>

                                <td className="px-6 py-3 font-mono text-slate-300">{user.telegram_id || '-'}</td>
                                
                                <td className="px-6 py-3 text-right flex items-center justify-end gap-2">
                                    <Link href={`/superadmin/user/${user.id}/status`} 
                                       className="bg-slate-800 hover:bg-slate-700 text-white text-xs px-3 py-1.5 rounded transition border border-slate-700">
                                       ⚙ Status
                                    </Link>
                                    <button onClick={() => deleteUser(user.id)} className="text-red-500 hover:text-red-400 p-2" title="Hapus User">🗑</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </>
  );
}