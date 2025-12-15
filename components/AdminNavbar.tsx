// components/AdminNavbar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Menu, X, LogOut } from "lucide-react";

export default function AdminNavbar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/superadmin/login");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/80 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid h-16 grid-cols-[1fr_auto] items-center">
          
          {/* Brand (Clickable) */}
          <Link
            href="/superadmin/dashboard"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 group"
          >
            <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-slate-900 shadow-md group-hover:ring-2 group-hover:ring-emerald-500/60 transition">
              <Image
                src="/images/croplogobot.png"
                alt="Logo"
                fill
                className="object-cover"
              />
            </div>
            <span className="text-lg font-bold text-white group-hover:text-emerald-400 transition">
              Dompet<span className="text-emerald-400">Pintar</span>Bot
              <span className="ml-2 rounded bg-red-600 px-1 text-xs text-white">
                ADMIN
              </span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden items-center gap-6 md:flex">
            <Link
              href="/superadmin/verifikasi"
              className="text-sm text-emerald-400 transition hover:text-white"
            >
              Cek Transaksi
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-sm text-red-400 transition hover:text-white"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>

          {/* Mobile Burger */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-slate-300 hover:text-white"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {open && (
        <div className="border-t border-slate-800 bg-slate-900 md:hidden">
          <div className="flex flex-col gap-2 px-4 py-4">
            <Link
              href="/superadmin/verifikasi"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-sm text-emerald-400 hover:bg-slate-800 hover:text-white"
            >
              Cek Transaksi
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-slate-800 hover:text-white"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
