// app/superadmin/verifikasi/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Payment {
  id: number;
  user_id: number;
  username: string;
  image_path: string;
  detected_bank: string;
  detected_amount: number;
  created_at: string;
}

// URL Cloudflare khusus gambar (Sesuai config project lama)
const CLOUDFLARE_IMAGE_URL = "https://dompetpintar.syukurapi.online";
export default function VerificationPage() {
  const [allPayments, setAllPayments] = useState<Payment[]>([]);
  const [activeTab, setActiveTab] = useState<'manual' | 'auto'>('manual');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState('');

  useEffect(() => {
    fetchPayments();
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

  const fetchPayments = async () => {
    const res = await fetchWithAuth('/api/admin/payments');
    if (res && res.ok) {
        const data = await res.json();
        setAllPayments(data.data || []);
    }
  };

  // Logic Tab
  const manualList = allPayments.filter(p => p.detected_bank === 'MANUAL_CHECK');
  const autoList = allPayments.filter(p => p.detected_bank !== 'MANUAL_CHECK');
  const currentList = activeTab === 'manual' ? manualList : autoList;

  // Logic Gambar
  const getImageUrl = (path: string) => {
    if (!path) return '';
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${CLOUDFLARE_IMAGE_URL}/${cleanPath}`;
  };

  const viewImage = (path: string) => {
    setModalImage(getImageUrl(path));
    setModalOpen(true);
  };

  // Actions
  const approveUser = async (userId: number, username: string) => {
    if(!confirm(`Aktifkan user ${username}?`)) return;
    await fetchWithAuth(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'active' })
    });
    alert("User Aktif!");
    fetchPayments();
  };

  const rejectUser = async (userId: number, username: string) => {
    if(!confirm(`Tolak verifikasi ${username}?`)) return;
    await fetchWithAuth(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'suspended' })
    });
    alert("User Ditolak.");
    fetchPayments();
  };

  const deleteOne = async (id: number) => {
    if(!confirm("Hapus log ini?")) return;
    await fetchWithAuth(`/api/admin/payments/${id}`, { method: 'DELETE' });
    fetchPayments();
  };

  const formatRupiah = (num: number) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num || 0);

  return (
    <div className="space-y-6">
        
        {/* HEADER CONTROLS */}
        <div className="flex flex-col md:flex-row justify-between items-end border-b border-slate-800 pb-4 gap-4">
            <div className="flex gap-2 bg-slate-900 p-1 rounded-xl">
                <button onClick={() => setActiveTab('manual')} 
                    className={`px-5 py-2.5 rounded-lg text-sm font-bold transition flex items-center gap-2 ${activeTab === 'manual' ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/20' : 'text-slate-400 hover:text-amber-400'}`}>
                    <span>⏳ Verifikasi Manual</span>
                    {manualList.length > 0 && <span className="bg-red-600 text-white px-2 py-0.5 rounded-full text-[10px]">{manualList.length}</span>}
                </button>

                <button onClick={() => setActiveTab('auto')} 
                    className={`px-5 py-2.5 rounded-lg text-sm font-bold transition flex items-center gap-2 ${activeTab === 'auto' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-slate-400 hover:text-emerald-400'}`}>
                    <span>✅ Riwayat Otomatis</span>
                    <span className="bg-slate-800 px-2 py-0.5 rounded-full text-[10px]">{autoList.length}</span>
                </button>
            </div>

            <button onClick={fetchPayments} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2">
                🔄 Refresh Data
            </button>
        </div>

        {/* LIST */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentList.length === 0 && (
                <div className="col-span-full text-center py-20 bg-slate-900/50 rounded-2xl border border-slate-800 border-dashed">
                    <p className="text-slate-500">Tidak ada data untuk ditampilkan.</p>
                </div>
            )}

            {currentList.map(pay => (
                <div key={pay.id} className={`bg-slate-900 border-2 rounded-xl overflow-hidden shadow-lg group relative ${activeTab === 'manual' ? 'border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'border-slate-800 opacity-75 hover:opacity-100'}`}>
                    
                    <div className="p-4 bg-slate-950/50 border-b border-slate-800 flex justify-between items-center">
                        <div>
                            <h3 className={`font-bold truncate w-40 ${activeTab === 'manual' ? 'text-amber-400' : 'text-slate-200'}`}>{pay.username}</h3>
                            <p className="text-[10px] text-slate-500">User ID: {pay.user_id}</p>
                        </div>
                        {activeTab === 'manual' && <span className="bg-amber-500 text-black text-[10px] font-bold px-2 py-1 rounded">PERLU CEK</span>}
                        {activeTab === 'auto' && (
                            <button onClick={() => deleteOne(pay.id)} className="text-slate-600 hover:text-red-500 transition" title="Hapus Riwayat">🗑</button>
                        )}
                    </div>

                    <div className="h-64 bg-black relative cursor-pointer" onClick={() => viewImage(pay.image_path)}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                            src={getImageUrl(pay.image_path)} 
                            className="w-full h-full object-contain"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement!.innerHTML += '<div class="absolute inset-0 flex items-center justify-center bg-black/80 text-red-500 text-xs">Gambar Rusak/Hilang</div>';
                            }}
                            alt="Bukti Transfer"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                            <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-white">🔍 Zoom</span>
                        </div>
                    </div>

                    {/* ACTION BUTTONS (Only Manual) */}
                    {activeTab === 'manual' ? (
                        <div className="p-4 grid grid-cols-2 gap-3">
                            <button onClick={() => approveUser(pay.user_id, pay.username)} className="bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg text-xs font-bold transition">
                                ✅ TERIMA (Aktif)
                            </button>
                            <button onClick={() => rejectUser(pay.user_id, pay.username)} className="bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white py-2 rounded-lg text-xs font-bold transition">
                                ❌ TOLAK
                            </button>
                        </div>
                    ) : (
                        <div className="p-3 bg-slate-950 text-xs text-slate-500 grid grid-cols-2 gap-2">
                            <div>
                                <span className="block text-[9px] uppercase">Bank</span>
                                <span className="font-mono text-emerald-400">{pay.detected_bank}</span>
                            </div>
                            <div>
                                <span className="block text-[9px] uppercase">Nominal</span>
                                <span className="font-mono text-white">{formatRupiah(pay.detected_amount)}</span>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>

        {/* MODAL ZOOM GAMBAR */}
        {modalOpen && (
            <div className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4 backdrop-blur animate-in fade-in duration-200" onClick={() => setModalOpen(false)}>
                <div className="relative max-w-5xl w-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={modalImage} className="max-w-full max-h-[85vh] rounded-lg shadow-2xl border border-slate-700" alt="Zoomed Bukti" />
                    <button onClick={() => setModalOpen(false)} className="mt-4 bg-slate-800 px-6 py-2 rounded-full text-white font-bold hover:bg-slate-700 border border-slate-600">
                        Tutup
                    </button>
                </div>
            </div>
        )}

    </div>
  );
}