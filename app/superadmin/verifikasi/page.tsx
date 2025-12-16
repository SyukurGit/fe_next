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

const CLOUDFLARE_IMAGE_URL = "https://dompetpintar.syukurapi.online";

export default function VerificationPage() {
  const [allPayments, setAllPayments] = useState<Payment[]>([]);
  const [activeTab, setActiveTab] = useState<'manual' | 'auto'>('manual');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

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
    setIsLoading(true);
    const res = await fetchWithAuth('/api/admin/payments');
    if (res && res.ok) {
        const data = await res.json();
        setAllPayments(data.data || []);
    }
    setIsLoading(false);
  };

  const manualList = allPayments.filter(p => p.detected_bank === 'MANUAL_CHECK');
  const autoList = allPayments.filter(p => p.detected_bank !== 'MANUAL_CHECK');
  const currentList = activeTab === 'manual' ? manualList : autoList;

  const getImageUrl = (path: string) => {
    if (!path) return '';
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${CLOUDFLARE_IMAGE_URL}/${cleanPath}`;
  };

  const viewImage = (path: string) => {
    setModalImage(getImageUrl(path));
    setModalOpen(true);
  };

  // --- LOGIC BARU UNTUK TERIMA & TOLAK ---

  const approveUser = async (paymentId: number, userId: number, username: string) => {
    if(!confirm(`Aktifkan user ${username}?`)) return;

    try {
        // 1. Set User jadi Active
        await fetchWithAuth(`/api/admin/users/${userId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status: 'active' })
        });

        // 2. Hapus Log Pembayaran & Gambar (sesuai API deleteOne)
        await fetchWithAuth(`/api/admin/payments/${paymentId}`, { method: 'DELETE' });

        alert(`Username ${username} berhasil di aktifkan`);
        fetchPayments();
    } catch (error) {
        console.error("Gagal approve user:", error);
        alert("Terjadi kesalahan sistem saat mengaktifkan user.");
    }
  };

  const rejectUser = async (paymentId: number, userId: number, username: string) => {
    if(!confirm("Apa benar anda tolak bukti ini?")) return;

    try {
        // 1. Set User jadi Suspended (memastikan tetap suspend)
        await fetchWithAuth(`/api/admin/users/${userId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status: 'suspended' })
        });

        // 2. Hapus Log Pembayaran & Gambar
        await fetchWithAuth(`/api/admin/payments/${paymentId}`, { method: 'DELETE' });

        alert(`Username ${username} tetap dalam suspend`);
        fetchPayments();
    } catch (error) {
        console.error("Gagal reject user:", error);
        alert("Terjadi kesalahan sistem saat menolak user.");
    }
  };

  // ----------------------------------------

  const deleteOne = async (id: number) => {
    if(!confirm("Hapus log ini?")) return;
    await fetchWithAuth(`/api/admin/payments/${id}`, { method: 'DELETE' });
    fetchPayments();
  };

  const deleteAllLogs = async () => {
    const msg = "⚠️ PERINGATAN BAHAYA!\n\n" +
                "Anda akan menghapus SEMUA riwayat verifikasi otomatis.\n" +
                "Semua FOTO BUKTI TRANSFER di server juga akan dihapus permanen.\n\n" +
                "Apakah Anda yakin?";
    
    if(!confirm(msg)) return;

    setIsDeleting(true);
    try {
        const res = await fetchWithAuth('/api/admin/payments', { method: 'DELETE' });
        if (res && res.ok) {
            alert("✅ Sukses! Folder uploads dibersihkan dan riwayat dikosongkan.");
            fetchPayments();
        } else {
            alert("Gagal menghapus data.");
        }
    } catch (error) {
        console.error(error);
        alert("Terjadi kesalahan koneksi.");
    } finally {
        setIsDeleting(false);
    }
  };

  const formatRupiah = (num: number) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num || 0);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Verifikasi Pembayaran</h1>
            <p className="text-sm text-slate-400">Kelola verifikasi transfer dan riwayat pembayaran</p>
          </div>
        </div>

        {/* Tabs & Actions */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-4 sm:p-6 shadow-2xl">
          <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
            
            {/* Tab Buttons */}
            <div className="flex gap-2 bg-slate-950 p-1.5 rounded-xl w-full lg:w-auto">
              <button 
                onClick={() => setActiveTab('manual')} 
                className={`flex-1 lg:flex-none px-4 sm:px-6 py-3 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'manual' 
                    ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-lg shadow-amber-500/30 scale-105' 
                    : 'text-slate-400 hover:text-amber-400 hover:bg-slate-900'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="hidden sm:inline">Verifikasi Manual</span>
                <span className="sm:hidden">Manual</span>
                {manualList.length > 0 && (
                  <span className="bg-red-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold animate-pulse">
                    {manualList.length}
                  </span>
                )}
              </button>

              <button 
                onClick={() => setActiveTab('auto')} 
                className={`flex-1 lg:flex-none px-4 sm:px-6 py-3 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'auto' 
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105' 
                    : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-900'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="hidden sm:inline">Riwayat Otomatis</span>
                <span className="sm:hidden">Otomatis</span>
                <span className="bg-slate-800 px-2 py-0.5 rounded-full text-[10px]">
                  {autoList.length}
                </span>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 sm:gap-3">
              {activeTab === 'auto' && autoList.length > 0 && (
                <button 
                  onClick={deleteAllLogs}
                  disabled={isDeleting}
                  className="flex-1 sm:flex-none bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 disabled:from-slate-700 disabled:to-slate-600 text-white px-3 sm:px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-red-900/30 hover:shadow-red-900/50 hover:scale-105 disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="hidden sm:inline">Menghapus...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span className="hidden sm:inline">Kosongkan Semua</span>
                      <span className="sm:hidden">Hapus</span>
                    </>
                  )}
                </button>
              )}

              <button 
                onClick={fetchPayments}
                disabled={isLoading}
                className="flex-1 sm:flex-none bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 text-white px-3 sm:px-5 py-2.5 rounded-xl text-xs font-bold transition-all border border-slate-700 hover:border-slate-600 flex items-center justify-center gap-2"
              >
                <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
              <p className="text-slate-400 text-sm">Memuat data...</p>
            </div>
          </div>
        )}

        {/* Payment Cards Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {currentList.length === 0 && (
              <div className="col-span-full">
                <div className="bg-slate-900/50 border-2 border-dashed border-slate-700 rounded-2xl p-12 text-center">
                  <svg className="w-16 h-16 mx-auto text-slate-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-slate-500 text-lg font-medium mb-2">Tidak ada data</p>
                  <p className="text-slate-600 text-sm">
                    {activeTab === 'manual' ? 'Belum ada pembayaran yang perlu diverifikasi' : 'Belum ada riwayat verifikasi otomatis'}
                  </p>
                </div>
              </div>
            )}

            {currentList.map(pay => (
              <div 
                key={pay.id} 
                className={`bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl overflow-hidden shadow-xl border-2 transition-all hover:scale-[1.02] hover:shadow-2xl ${
                  activeTab === 'manual' 
                    ? 'border-amber-500/50 shadow-amber-500/10' 
                    : 'border-slate-700 hover:border-slate-600'
                }`}
              >
                
                {/* Header */}
                <div className="p-4 bg-slate-950/50 border-b border-slate-700 flex justify-between items-start">
                  <div className="flex-1 min-w-0 mr-2">
                    <h3 className={`font-bold text-base truncate ${
                      activeTab === 'manual' ? 'text-amber-400' : 'text-white'
                    }`}>
                      {pay.username}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-[10px] text-slate-500 font-mono">ID: {pay.user_id}</p>
                      <span className="text-slate-700">•</span>
                      <p className="text-[10px] text-slate-500">{formatDate(pay.created_at)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    {activeTab === 'manual' && (
                      <span className="bg-amber-500 text-slate-900 text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap animate-pulse">
                        PERLU CEK
                      </span>
                    )}
                    {activeTab === 'auto' && (
                      <button 
                        onClick={() => deleteOne(pay.id)} 
                        className="text-slate-600 hover:text-red-500 transition-colors p-1.5 hover:bg-red-500/10 rounded-lg" 
                        title="Hapus Riwayat"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Image */}
                <div 
                  className="h-56 sm:h-64 bg-black relative cursor-pointer group" 
                  onClick={() => viewImage(pay.image_path)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={getImageUrl(pay.image_path)} 
                    className="w-full h-full object-contain transition-transform group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML += '<div class="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-red-400"><svg class="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg><span class="text-sm font-medium">Gambar Tidak Tersedia</span></div>';
                    }}
                    alt="Bukti Transfer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6">
                    <span className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-sm font-bold text-white border border-white/30 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                      Zoom Gambar
                    </span>
                  </div>
                </div>

                {/* Footer Actions */}
                {activeTab === 'manual' ? (
                  <div className="p-4 grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => approveUser(pay.id, pay.user_id, pay.username)} 
                      className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white py-3 rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-900/30 hover:shadow-emerald-900/50 hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      TERIMA
                    </button>
                    <button 
                      onClick={() => rejectUser(pay.id, pay.user_id, pay.username)} 
                      className="bg-slate-800 hover:bg-gradient-to-r hover:from-red-600 hover:to-red-500 text-slate-300 hover:text-white py-3 rounded-xl text-xs font-bold transition-all border border-slate-700 hover:border-red-500 hover:shadow-lg hover:shadow-red-900/30 hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      TOLAK
                    </button>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-950/70 grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[9px] uppercase text-slate-500 font-bold tracking-wider">Bank Terdeteksi</p>
                      <p className="font-mono text-sm text-emerald-400 font-semibold">{pay.detected_bank}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] uppercase text-slate-500 font-bold tracking-wider">Nominal</p>
                      <p className="font-mono text-sm text-white font-semibold">{formatRupiah(pay.detected_amount)}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Modal Zoom Image */}
        {modalOpen && (
          <div 
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200" 
            onClick={() => setModalOpen(false)}
          >
            <div className="relative max-w-6xl w-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
              <div className="relative bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={modalImage} 
                  className="max-w-full max-h-[80vh] w-auto h-auto object-contain" 
                  alt="Zoomed Bukti" 
                />
              </div>
              <button 
                onClick={() => setModalOpen(false)} 
                className="mt-6 bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 px-8 py-3 rounded-full text-white font-bold border border-slate-600 hover:border-slate-500 transition-all shadow-lg hover:scale-105 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Tutup
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}