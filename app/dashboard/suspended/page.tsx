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

  useEffect(() => {
    // 1. Cek Token
    const token = localStorage.getItem('jwt_token');
    if (!token) {
        router.push('/login');
        return;
    }

    // 2. Cek Status User (Hanya 'suspended' yang boleh di sini)
    const userStr = localStorage.getItem('user');
    if (userStr) {
        const user = JSON.parse(userStr);
        setUsername(user.username || 'User');
        
        if (user.status !== 'suspended') {
            router.push('/dashboard'); // Balikin ke dashboard kalau akun sudah aktif
        }
    }
  }, [router]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        setFile(e.target.files[0]);
        setShowManualOption(false); // Reset opsi manual saat pilih file baru
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
            
            // Update status di localStorage agar bisa masuk dashboard
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                user.status = 'active';
                localStorage.setItem('user', JSON.stringify(user));
            }
            
            // Redirect ke Dashboard
            router.push('/dashboard');
        } else {
            // Gagal verify AI -> Munculkan opsi manual
            setShowManualOption(true);
        }

    } catch (e) {
        console.error(e);
        // Error koneksi -> Munculkan opsi manual
        setShowManualOption(true);
    } finally {
        setIsProcessing(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden relative">
            
            {/* Header Line Red */}
            <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-500/10 rounded-full blur-2xl"></div>

            <div className="p-8 text-center space-y-6 relative z-10">
                
                {/* Icon Alert */}
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto ring-1 ring-red-500/30">
                    <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                </div>

                {/* Pesan */}
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Masa Trial Habis!</h1>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Maaf <span className="text-white font-semibold capitalize">{username}</span>, akses Dashboard sementara dikunci. Silakan lakukan pembayaran untuk mengaktifkan akun permanen.
                    </p>
                </div>

                {/* QRIS Image */}
                <div className="bg-white p-4 rounded-xl shadow-inner mx-auto w-fit">
                    <div className="relative w-48 h-48">
                        <Image 
                            src="/images/qris.jpeg" 
                            alt="QRIS Pembayaran" 
                            fill 
                            className="object-contain"
                        />
                    </div>
                </div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Scan QRIS di atas</p>

                {/* Upload Section */}
                <div className="space-y-3 pt-4 border-t border-slate-800">
                    <label className="block text-xs font-medium text-slate-300 mb-2">Upload Bukti Transfer (Screenshot/Foto)</label>
                    
                    <input 
                        type="file" 
                        onChange={handleFileChange} 
                        accept="image/*"
                        className="block w-full text-sm text-slate-400
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-xs file:font-semibold
                        file:bg-slate-800 file:text-white
                        hover:file:bg-slate-700
                        cursor-pointer bg-slate-950 rounded-lg border border-slate-700 focus:outline-none focus:border-emerald-500"
                    />

                    <button 
                        onClick={handleVerify} 
                        disabled={!file || isProcessing}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
                    >
                        {!isProcessing ? (
                            "Kirim Bukti & Verifikasi Otomatis"
                        ) : (
                            <span className="animate-pulse">Memproses AI...</span>
                        )}
                    </button>

                    {/* MANUAL OPTION (Shown if AI fails) */}
                    {showManualOption && (
                        <div className="mt-4 p-4 bg-rose-900/20 border border-rose-500/30 rounded-xl text-left animate-in fade-in zoom-in duration-300">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-rose-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                    <span className="text-xs font-bold">Gagal Verifikasi Otomatis</span>
                                </div>
                                <p className="text-[11px] text-slate-400 leading-tight">
                                    AI tidak dapat membaca struk ini. Silakan coba upload gambar yang lebih jelas, atau gunakan tombol di bawah untuk verifikasi manual Admin.
                                </p>
                                
                                <Link 
                                    href="/dashboard/waiting" 
                                    className="mt-2 w-full flex items-center justify-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition gap-2"
                                >
                                    <span>📤</span> Upload Manual ke Admin
                                </Link>
                            </div>
                        </div>
                    )}

                </div>

                <button onClick={handleLogout} className="text-xs text-red-400 hover:text-red-300 font-medium mt-4">
                    Logout / Ganti Akun
                </button>

            </div>
        </div>
    </div>
  );
}