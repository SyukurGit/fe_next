// app/dashboard/waiting/page.tsx
"use client";

import { useState, useEffect, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function WaitingPage() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

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
    setAlertMessage(null); // Reset alert

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
            // Tampilkan pesan sukses sesuai request
            setAlertMessage("Gambar berhasil di upload, silakan tunggu admin.");
            
            // Opsional: Clear input file (di React ini butuh trik ref, tapi karena kita reload tidak masalah)
            // window.location.reload(); // Kita ganti reload dengan pesan alert saja agar UX lebih halus
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
        
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-2xl relative">
            
            {/* Notifikasi Alert Sukses */}
            {alertMessage && (
                <div className="absolute top-0 left-0 right-0 -mt-16 animate-in slide-in-from-top-4 fade-in duration-300 px-4">
                    <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3">
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        <span className="text-sm font-bold text-left">{alertMessage}</span>
                        <button onClick={() => setAlertMessage(null)} className="ml-auto text-emerald-200 hover:text-white">✕</button>
                    </div>
                </div>
            )}

            <div className="w-20 h-20 bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl animate-pulse">
                ⏳
            </div>

            <h1 className="text-2xl font-bold mb-2">Verifikasi Admin</h1>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                Status Anda saat ini: <span className="text-amber-400 font-bold uppercase">Pending</span>.<br/>
                Bukti pembayaran Anda sedang dalam antrian pengecekan manual oleh Admin. Mohon tunggu sebentar ya!
            </p>

            <div className="border-t border-slate-800 pt-6">
                <p className="text-xs text-slate-500 mb-3">Jika salah kirim gambar, Bisa Upload ulang lagi di sini:</p>
                
                <label className={`w-full bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {isUploading ? (
                        <>
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Mengirim...</span>
                        </>
                    ) : (
                        <>
                            <span>🔄 Silahkan Upload Ulang Bukti</span>
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