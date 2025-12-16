// app/dashboard/suspended/page.tsx
"use client";

import { useState, useEffect, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function SuspendedPage() {
  const router = useRouter();
  const [username, setUsername] = useState('User');
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showManualOption, setShowManualOption] = useState(false);
  
  // State untuk Zoom QRIS
  const [isQrisZoomed, setIsQrisZoomed] = useState(false);

  useEffect(() => {
    // 1. Cek Token
    const token = localStorage.getItem('jwt_token');
    if (!token) {
        router.push('/login');
        return;
    }

    // 2. Cek Status User
    const userStr = localStorage.getItem('user');
    if (userStr) {
        const user = JSON.parse(userStr);
        setUsername(user.username || 'User');
        
        // Jika status active, tendang balik ke dashboard utama
        if (user.status !== 'suspended') {
            router.push('/dashboard'); 
        }
    }
  }, [router]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        setFile(e.target.files[0]);
        setShowManualOption(false);
    }
  };

  const handleVerify = async () => {
    if (!file) return alert("Pilih file bukti transfer dulu!");

    setIsProcessing(true);
    setShowManualOption(false);

    const formData = new FormData();
    formData.append('file', file);

    try {
        const token = localStorage.getItem('jwt_token');
        const API_URL = process.env.NEXT_PUBLIC_API_URL;

        const res = await fetch(`${API_URL}/api/verify-payment`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'true'
            },
            body: formData
        });

        const json = await res.json();

        if (res.ok) {
            alert("✅ " + json.message);
            
            // Update status di localStorage
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                user.status = 'active';
                localStorage.setItem('user', JSON.stringify(user));
            }
            
            // Refresh halaman/redirect
            router.push('/dashboard');
            setTimeout(() => window.location.reload(), 500); // Reload untuk memastikan state navbar terupdate
        } else {
            setShowManualOption(true);
        }

    } catch (e) {
        console.error(e);
        setShowManualOption(true);
    } finally {
        setIsProcessing(false);
    }
  };

  // Fungsi Download QRIS
  const downloadQris = () => {
    const link = document.createElement('a');
    link.href = '/images/qris.jpeg';
    link.download = 'QRIS_DompetPintar.jpeg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
        
        {/* Header Section */}
        <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                Status Akun: <span className="text-red-500">Non-Aktif</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
                Halo <span className="text-emerald-400 font-bold capitalize">{username}</span>, masa trial Anda telah habis. 
                <br/>Silakan lakukan pembayaran untuk mengaktifkan kembali akses penuh.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            
            {/* Left Column: QRIS & Payment Info */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                     <svg className="w-40 h-40 text-emerald-500" fill="currentColor" viewBox="0 0 24 24"><path d="M4 4h16v16H4V4zm2 2v12h12V6H6zm2 2h8v8H8V8z"/></svg>
                </div>

                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 relative z-10">
                    <span className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-lg">1</span>
                    Scan QRIS
                </h2>

                {/* QRIS Container */}
                <div className="flex flex-col items-center relative z-10">
                    <div 
                        className="bg-white p-4 rounded-xl shadow-inner mb-4 cursor-zoom-in hover:scale-105 transition duration-300 relative group/img"
                        onClick={() => setIsQrisZoomed(true)}
                        title="Klik untuk memperbesar"
                    >
                        <div className="relative w-64 h-64">
                            <Image 
                                src="/images/qris.jpeg" 
                                alt="QRIS Pembayaran" 
                                fill 
                                className="object-contain"
                            />
                        </div>
                        {/* Overlay Hint */}
                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/img:opacity-100 flex items-center justify-center rounded-xl transition">
                            <span className="bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">🔍 Perbesar</span>
                        </div>
                    </div>

                    {/* Tombol Download */}
                    <button 
                        onClick={downloadQris}
                        className="flex items-center gap-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 px-4 py-2 rounded-lg transition"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        Simpan Gambar QRIS
                    </button>
                    
                    <div className="text-center space-y-1 mt-4">
                        <p className="text-sm font-bold text-slate-300">A76 LABS - DOMPET PINTAR</p>
                        <p className="text-xs text-slate-500">Menerima Semua E-Wallet & Mobile Banking</p>
                    </div>
                </div>
            </div>

            {/* Right Column: Upload Proof */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative">
                 <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-lg">2</span>
                    Konfirmasi Pembayaran
                </h2>

                <div className="space-y-6">
                    {/* File Input Area */}
                    <div className="bg-slate-950 rounded-xl border border-dashed border-slate-700 p-8 text-center hover:border-emerald-500/50 transition cursor-pointer relative group">
                        <input 
                            type="file" 
                            onChange={handleFileChange} 
                            accept="image/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-14 h-14 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 group-hover:scale-110 transition shadow-lg">
                                <svg className="w-7 h-7 text-slate-400 group-hover:text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-300">
                                    {file ? (
                                        <span className="text-emerald-400 font-bold">{file.name}</span>
                                    ) : (
                                        "Klik area ini untuk upload bukti"
                                    )}
                                </p>
                                <p className="text-xs text-slate-500 mt-2">Format: JPG, PNG, atau Screenshot</p>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button 
                        onClick={handleVerify} 
                        disabled={!file || isProcessing}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 group"
                    >
                        {!isProcessing ? (
                            <>
                                <span>Kirim & Verifikasi Otomatis</span>
                                <svg className="w-5 h-5 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
                            </>
                        ) : (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Memproses dengan AI...</span>
                            </>
                        )}
                    </button>

                    {/* Manual Option (Shown if AI fails) */}
                    {showManualOption && (
                        <div className="p-4 bg-rose-900/10 border border-rose-500/20 rounded-xl animate-in fade-in slide-in-from-top-4 duration-300">
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">⚠️</span>
                                <div>
                                    <h3 className="text-sm font-bold text-rose-400">Verifikasi Otomatis Gagal</h3>
                                    <p className="text-xs text-slate-400 mt-1 mb-3">
                                        Sistem AI kesulitan membaca bukti transfer Anda. Jangan khawatir, Anda bisa kirim manual ke admin.
                                    </p>
                                    <Link 
                                        href="/dashboard/waiting" 
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition border border-slate-700"
                                    >
                                        📤 Upload Manual ke Admin
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Modal Zoom QRIS */}
        {isQrisZoomed && (
            <div 
                className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={() => setIsQrisZoomed(false)}
            >
                <div 
                    className="relative max-w-lg w-full bg-white rounded-2xl p-2 overflow-hidden shadow-2xl scale-100 animate-in zoom-in-95 duration-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button 
                        onClick={() => setIsQrisZoomed(false)}
                        className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-black/10 hover:bg-black/20 rounded-full text-black/60 transition"
                    >
                        ✕
                    </button>

                    <div className="relative w-full aspect-square">
                        <Image 
                            src="/images/qris.jpeg" 
                            alt="QRIS Fullscreen" 
                            fill 
                            className="object-contain"
                        />
                    </div>
                    
                    <div className="p-4 text-center border-t border-slate-100">
                        <p className="font-bold text-slate-800 text-lg">Scan QRIS</p>
                        <p className="text-sm text-slate-500 mb-4">Pastikan nominal transfer sesuai tagihan.</p>
                        <button 
                            onClick={downloadQris}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                            Download Gambar
                        </button>
                    </div>
                </div>
            </div>
        )}

    </div>
  );
}