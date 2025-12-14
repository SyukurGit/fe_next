// components/AdminNavbar.tsx
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function AdminNavbar() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.clear();
    router.push('/superadmin/login');
  };

  return (
    <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
           <div className="flex items-center gap-3">
                <div className="w-10 h-10 relative rounded-lg overflow-hidden bg-slate-900 shadow-md">
                    <Image src="/images/croplogobot.png" alt="Logo" fill className="object-cover" />
                </div>
                <span className="font-bold text-lg text-white">
                    Dompet<span className="text-emerald-400">Pintar</span>Bot <span className="text-xs bg-red-600 text-white px-1 rounded ml-1">ADMIN</span>
                </span>
            </div>

             <div className="flex items-center gap-4">
                <Link href="/superadmin/verifikasi" className="text-sm text-emerald-400 hover:text-white transition">
                    Cek Transaksi
                </Link>
                <button onClick={handleLogout} className="text-sm text-red-400 hover:text-white transition">
                    Logout
                </button>
            </div>
        </div>
    </nav>
  );
}