// app/superadmin/dashboard/layout.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminNavbar from '../../../components/AdminNavbar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
        router.push('/superadmin/login');
        return;
    }
    // Opsional: Cek role lagi dari localStorage biar lebih aman di sisi client
    const userStr = localStorage.getItem('user');
    if (userStr) {
        const user = JSON.parse(userStr);
        if (user.role !== 'admin') {
            router.push('/login'); // Tendang user biasa
            return;
        }
    }
    setIsAuthorized(true);
  }, [router]);

  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <AdminNavbar />
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {children}
      </main>
    </div>
  );
}