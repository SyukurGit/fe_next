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
  const [newUser, setNewUser] = useState({ username: '', password: '', telegram_id: '' });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setIsLoading(true);
    const res = await fetchWithAuth('/api/admin/users');
    if (res && res.ok) {
        const data = await res.json();
        if (data.data) setUsers(data.data);
    }
    setIsLoading(false);
  };

  const createUser = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    setIsSubmitting(true);

    const payload = { 
        ...newUser, 
        telegram_id: newUser.telegram_id ? parseInt(newUser.telegram_id) : null 
    };
    
    const res = await fetchWithAuth('/api/admin/users', { 
        method: 'POST', 
        body: JSON.stringify(payload) 
    });

    setIsSubmitting(false);

    if (res && res.ok) {
        setMessage('User VIP berhasil dibuat!');
        setNewUser({ username: '', password: '', telegram_id: '' });
        fetchUsers();
    } else {
        setIsError(true);
        setMessage('Gagal membuat user');
    }
  };

  const deleteUser = async (id: number, username: string) => {
    if(!confirm(`Hapus user "${username}" secara permanen?`)) return;
    const res = await fetchWithAuth(`/api/admin/users/${id}`, { method: 'DELETE' });
    if (res && res.ok) {
      alert('User berhasil dihapus');
      fetchUsers();
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'trial': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      default: return 'bg-red-500/20 text-red-300 border-red-500/30';
    }
  };

  const getRoleColor = (role: string) => {
    return role === 'admin' 
      ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' 
      : 'bg-blue-500/20 text-blue-300 border-blue-500/30';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Dashboard Admin</h1>
          <p className="text-sm text-slate-400">Kelola pengguna dan akses sistem</p>
        </div>

        {/* Form Tambah User */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-700">
            <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            <h2 className="text-xl font-bold text-white">Tambah User Baru (VIP)</h2>
          </div>
          
          <form onSubmit={createUser} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Username <span className="text-red-400">*</span>
                </label>
                <input 
                  type="text" 
                  required
                  value={newUser.username}
                  onChange={e => setNewUser({...newUser, username: e.target.value})}
                  placeholder="Masukkan username"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition" 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Password <span className="text-red-400">*</span>
                </label>
                <input 
                  type="text" 
                  required
                  value={newUser.password}
                  onChange={e => setNewUser({...newUser, password: e.target.value})}
                  placeholder="Masukkan password"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition" 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Telegram ID <span className="text-slate-500 text-xs">(Opsional)</span>
                </label>
                <input 
                  type="number"
                  value={newUser.telegram_id}
                  onChange={e => setNewUser({...newUser, telegram_id: e.target.value})}
                  placeholder="ID Telegram"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition" 
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button 
                type="submit"
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:from-slate-700 disabled:to-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-xl text-sm transition-all shadow-lg shadow-emerald-900/30 hover:shadow-emerald-900/50 hover:scale-105 disabled:hover:scale-100"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Membuat...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Buat User
                  </>
                )}
              </button>

              {message && (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  isError 
                    ? 'bg-red-500/10 border border-red-500/30 text-red-400' 
                    : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                }`}>
                  {isError ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  <span className="text-sm font-medium">{message}</span>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* List User */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-4 sm:p-6 border-b border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">Daftar Pengguna</h2>
                <p className="text-xs text-slate-400 mt-0.5">{filteredUsers.length} pengguna terdaftar</p>
              </div>
            </div>
            
            <div className="relative w-full sm:w-auto">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text" 
                placeholder="Cari username..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 bg-slate-950 border border-slate-700 text-sm rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
              />
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-slate-400 text-sm">Memuat data...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-950 text-xs uppercase font-bold text-slate-400 border-b border-slate-700">
                    <tr>
                      <th className="px-6 py-4">Pengguna</th>
                      <th className="px-6 py-4">Role</th> 
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Telegram ID</th>
                      <th className="px-6 py-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-16 text-center">
                          <svg className="w-16 h-16 mx-auto text-slate-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <p className="text-slate-500 text-lg font-medium">Tidak ada pengguna</p>
                          <p className="text-slate-600 text-sm mt-1">Coba ubah kata kunci pencarian</p>
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map(user => (
                        <tr key={user.id} className="hover:bg-slate-800/50 transition-colors group">
                          <td className="px-6 py-4">
                            <Link 
                              href={`/superadmin/user/${user.id}`} 
                              className="flex items-center gap-2 w-fit group-hover:text-blue-400 transition-colors"
                            >
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                                {user.username.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-white group-hover:underline">{user.username}</p>
                                <p className="text-[10px] text-slate-500 font-mono">ID: {user.id}</p>
                              </div>
                            </Link>
                          </td>
                          
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getRoleColor(user.role)}`}>
                              {user.role}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(user.status)}`}>
                              {user.status}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <span className="font-mono text-slate-300">{user.telegram_id || '-'}</span>
                          </td>
                          
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <Link 
                                href={`/superadmin/user/${user.id}/status`} 
                                className="bg-slate-800 hover:bg-slate-700 text-white text-xs px-3 py-2 rounded-lg transition border border-slate-700 hover:border-slate-600 flex items-center gap-1.5"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Status
                              </Link>
                              <button 
                                onClick={() => deleteUser(user.id, user.username)} 
                                className="text-slate-600 hover:text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition" 
                                title="Hapus User"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden divide-y divide-slate-800">
                {filteredUsers.length === 0 ? (
                  <div className="px-6 py-16 text-center">
                    <svg className="w-16 h-16 mx-auto text-slate-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-slate-500 text-lg font-medium">Tidak ada pengguna</p>
                    <p className="text-slate-600 text-sm mt-1">Coba ubah kata kunci pencarian</p>
                  </div>
                ) : (
                  filteredUsers.map(user => (
                    <div key={user.id} className="p-4 hover:bg-slate-800/30 transition-colors">
                      <Link href={`/superadmin/user/${user.id}`} className="block mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-white truncate">{user.username}</p>
                            <p className="text-[10px] text-slate-500 font-mono">ID: {user.id}</p>
                          </div>
                        </div>
                      </Link>

                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Role</p>
                          <span className={`inline-block px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${getRoleColor(user.role)}`}>
                            {user.role}
                          </span>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Status</p>
                          <span className={`inline-block px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusColor(user.status)}`}>
                            {user.status}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Telegram ID</p>
                          <span className="font-mono text-sm text-slate-300">{user.telegram_id || '-'}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link 
                          href={`/superadmin/user/${user.id}/status`} 
                          className="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-xs px-3 py-2.5 rounded-lg transition border border-slate-700 text-center font-bold"
                        >
                          ⚙️ Kelola Status
                        </Link>
                        <button 
                          onClick={() => deleteUser(user.id, user.username)} 
                          className="bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white px-3 py-2.5 rounded-lg transition border border-slate-700 hover:border-red-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}