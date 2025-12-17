// app/register/page.tsx
"use client";

import { useState, FormEvent, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function RegisterPage() {
  const router = useRouter();
  
  // State Form
  const [form, setForm] = useState({ 
    username: '', 
    password: '', 
    confirm_password: '' 
  });
  
  // State UI
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  
  // State Modal Terms
  const [showTerms, setShowTerms] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Handle Validasi Awal (Sebelum muncul modal)
  const handleInitialSubmit = (e: FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    // Validasi Dasar
    if (!form.username || !form.password) {
      setIsError(true);
      setMessage("Username dan password wajib diisi.");
      return;
    }
    
    if (form.password !== form.confirm_password) {
      setIsError(true);
      setMessage("Password dan konfirmasi tidak cocok.");
      return;
    }

    // Jika valid, buka modal persetujuan
    setShowTerms(true);
  };

  // 2. Handle Final Register (Setelah setuju terms)
  const handleFinalRegister = async () => {
    if (!agreed) return;

    setIsLoading(true);
    setMessage('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          username: form.username.trim(),
          password: form.password,
          confirm_password: form.confirm_password
        })
      });

      const data = await res.json();

      if (res.ok) {
        // Sukses
        setIsError(false);
        setMessage("✅ Akun berhasil dibuat! Mengalihkan ke halaman login...");
        
        // Tutup modal agar user lihat pesan sukses
        setShowTerms(false); 
        
        // Redirect
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        // Gagal dari API
        setIsError(true);
        setMessage(data.error || data.message || "Gagal mendaftar. Username mungkin sudah dipakai.");
        setShowTerms(false); // Tutup modal biar user bisa edit form
      }

    } catch (err) {
      console.error(err);
      setIsError(true);
      setMessage("Gagal koneksi ke server Backend!");
      setShowTerms(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-100 p-4 relative">
      
      {/* Container Utama */}
      <div className="w-full max-w-sm p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl relative z-10">
        
        {/* Header Logo */}
        <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-xl overflow-hidden mx-auto mb-4 shadow-lg shadow-emerald-500/20 relative">
                <Image 
                  src="/images/croplogobot.png" 
                  alt="Logo" 
                  fill
                  className="object-cover"
                />
            </div>
            <h1 className="font-bold text-xl text-white">
                Dompet<span className="text-emerald-400">Pintar</span>Bot
            </h1>
            <p className="text-xs text-slate-500 mt-1">Daftar untuk mendapatkan Trial Gratis 1 Hari.</p>
        </div>

        {/* Form Register */}
        <form onSubmit={handleInitialSubmit} className="space-y-5">
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Username</label>
                <input 
                    type="text" 
                    value={form.username}
                    onChange={(e) => setForm({...form, username: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition text-sm text-white"
                    placeholder="Buat username unik..." 
                    required 
                />
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
                <input 
                    type="password" 
                    value={form.password}
                    onChange={(e) => setForm({...form, password: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition text-sm text-white"
                    placeholder="••••••••" 
                    required 
                />
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Konfirmasi Password</label>
                <input 
                    type="password" 
                    value={form.confirm_password}
                    onChange={(e) => setForm({...form, confirm_password: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition text-sm text-white"
                    placeholder="••••••••" 
                    required 
                />
            </div>

            <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg transition shadow-lg shadow-emerald-900/20 text-sm flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <span className="animate-pulse">Memproses...</span>
                ) : (
                    "Lanjut Daftar & Baca Syarat"
                )}
            </button>

            {/* Pesan Error / Sukses */}
            {message && (
                <div className={`p-3 rounded-lg text-center border animate-in fade-in slide-in-from-top-2 ${
                    isError 
                    ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                }`}>
                    <p className="text-xs font-medium">{message}</p>
                </div>
            )}
        </form>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-500 mt-6">
            Sudah punya akun? <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-medium hover:underline">Login di sini</Link>
        </p>
      </div>

      {/* --- MODAL PERSETUJUAN (TERMS OF SERVICE) --- */}
      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
                
                {/* Modal Header */}
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900 rounded-t-2xl">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        📜 Syarat & Ketentuan Pengguna
                    </h3>
                    <button onClick={() => setShowTerms(false)} className="text-slate-500 hover:text-white transition">✕</button>
                </div>

                {/* Modal Body (Scrollable) */}
                <div 
                    ref={scrollRef}
                    className="p-6 overflow-y-auto space-y-4 text-sm text-slate-300 leading-relaxed custom-scrollbar bg-slate-950/50"
                >
                    <p className="font-bold text-white">Harap baca dengan teliti sebelum melanjutkan.</p>
                    
                    <div className="space-y-3">
                        <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                            <strong className="text-emerald-400 block mb-1">1. Layanan "Sebagaimana Adanya"</strong>
                            Layanan DompetPintarBot disediakan dalam kondisi "as is". Kami terus mengembangkan fitur, namun bug atau kesalahan sistem mungkin terjadi.
                        </div>

                        <div className="p-3 bg-red-900/10 rounded-lg border border-red-500/20">
                            <strong className="text-red-400 block mb-1">2. Hak Mematikan Sistem (Termination)</strong>
                            <span className="text-slate-200">
                                Penyedia layanan (A76 Labs) berhak sepenuhnya untuk <u>mematikan, menghentikan, atau menangguhkan sistem ini sewaktu-waktu tanpa pemberitahuan sebelumnya</u> kepada pengguna. 
                                Pengguna menyetujui bahwa tidak ada tuntutan ganti rugi atas data atau akses yang hilang akibat penghentian layanan ini.
                            </span>
                        </div>

                        <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                            <strong className="text-emerald-400 block mb-1">3. Privasi Data</strong>
                            Kami menjaga privasi data keuangan Anda dan tidak akan memperjualbelikannya. Namun, keamanan internet tidak 100% terjamin. Gunakan password yang kuat.
                        </div>

                        <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                            <strong className="text-emerald-400 block mb-1">4. Penyalahgunaan</strong>
                            Akun yang terindikasi melakukan spam, aktivitas ilegal, atau merusak sistem akan di-banned permanen tanpa peringatan.
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-slate-800 bg-slate-900 rounded-b-2xl">
                    <label className="flex items-start gap-3 cursor-pointer group mb-4">
                        <div className="relative flex items-center">
                            <input 
                                type="checkbox" 
                                checked={agreed} 
                                onChange={(e) => setAgreed(e.target.checked)}
                                className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-600 bg-slate-800 checked:border-emerald-500 checked:bg-emerald-500 transition-all"
                            />
                            <svg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none opacity-0 peer-checked:opacity-100 text-white transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <span className="text-xs text-slate-400 group-hover:text-slate-200 transition select-none">
                            Saya telah membaca, memahami, dan menyetujui seluruh Syarat & Ketentuan di atas, termasuk poin mengenai penghentian layanan.
                        </span>
                    </label>

                    <div className="flex gap-3">
                        <button 
                            onClick={() => setShowTerms(false)}
                            className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-semibold text-sm transition"
                        >
                            Batal
                        </button>
                        <button 
                            onClick={handleFinalRegister}
                            disabled={!agreed || isLoading}
                            className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold text-sm transition shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Memproses...
                                </>
                            ) : (
                                "Setuju & Buat Akun"
                            )}
                        </button>
                    </div>
                </div>

            </div>
        </div>
      )}

    </div>
  );
}