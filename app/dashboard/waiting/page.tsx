// app/dashboard/waiting/page.tsx
"use client";

import { useState, useEffect, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function WaitingPage() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    // 1. Cek Token
    const token = localStorage.getItem('jwt_token');
    if (!token) {
        router.push('/login');
        return;
    }

    // 2. Cek Status (Hanya 'pending' yang boleh di sini)
    // Jika sudah 'active', langsung lempar ke dashboard utama
    const checkStatus = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/profile`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true' 
                }
            });
            if (res.ok) {
                const data = await res.json();
                // Update LocalStorage agar sinkron
                const freshUser = data.data || data.user || data;
                localStorage.setItem('user', JSON.stringify(freshUser));

                if (freshUser.status === 'active') {
                    router.push('/dashboard');
                } else if (freshUser.status === 'suspended') {
                    router.push('/dashboard/suspended');
                }
            }
        } catch (e) {
            console.error(e);
        }
    };

    checkStatus();
    // Bisa tambahkan interval polling untuk cek status tiap 5-10 detik jika mau real-time
    const interval = setInterval(checkStatus, 10000); 
    return () => clearInterval(interval);

  }, [router]);

  const handleUploadManual = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
        const token = localStorage.getItem('jwt_token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/manual-payment`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'true'
            },
            body: formData
        });

        const data = await res.json();

        if (res.ok) {
            alert("✅ Upload berhasil! Bukti baru telah dikirim ke Admin.");
            window.location.reload(); // Refresh halaman
        } else {
            alert("Gagal upload: " + (data.error || "Unknown error"));
        }
    } catch (err) {
        alert("Error koneksi ke server");
    } finally {
        setIsUploading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  return (
    <div className="bg-slate-950 text-white flex items-center justify-center min-h-screen p-4">
        
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-2xl">
            
            <div className="w-20 h-20 bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl animate-pulse">
                ⏳
            </div>

            <h1 className="text-2xl font-bold mb-2">Verifikasi Admin</h1>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                Status Anda saat ini: <span className="text-amber-400 font-bold uppercase">Pending</span>.<br/>
                Bukti pembayaran Anda sedang dalam antrian pengecekan manual oleh Admin. Mohon tunggu sebentar ya!
            </p>

            <div className="border-t border-slate-800 pt-6">
                <p className="text-xs text-slate-500 mb-3">Salah kirim gambar? Upload ulang di sini:</p>
                
                <label className={`w-full bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {isUploading ? (
                        <span>Mengirim...</span>
                    ) : (
                        <>
                            <span>🔄 Upload Ulang Bukti</span>
                            <input 
                                type="file" 
                                onChange={handleUploadManual} 
                                className="hidden" 
                                accept="image/*"
                                disabled={isUploading}
                            />
                        </>
                    )}
                </label>
            </div>

            <button onClick={handleLogout} className="mt-6 text-xs text-red-400 hover:text-red-300 underline">
                Logout / Ganti Akun
            </button>

        </div>
    </div>
  );
}