// app/dashboard/detail/page.tsx
"use client";

import { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// --- Tipe Data ---
interface Transaction {
  id: number;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  note: string;
  created_at: string;
}

export default function DetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">Loading...</div>}>
      <DetailContent />
    </Suspense>
  );
}

function DetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Mode: 'income', 'expense', atau 'all'
  const viewMode = searchParams.get('mode') || 'all';
  const dateParam = searchParams.get('date'); // YYYY-MM-DD

  const parseDateParam = (str: string) => {
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  // State Utama
  const [allData, setAllData] = useState<Transaction[]>([]);
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    return dateParam ? parseDateParam(dateParam) : new Date();
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Ref untuk scroll otomatis tanggal
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sinkronisasi kalau datang dari halaman laporan
  useEffect(() => {
    if (dateParam) {
      setCurrentDate(parseDateParam(dateParam));
    }
  }, [dateParam]);

  // --- 1. Fetch Data Sekali Saja (Optimasi) ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('jwt_token');
        if (!token) {
           router.push('/login');
           return;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        // Kita fetch semua data tipe terkait, nanti difilter di client agar navigasi tanggal cepat
        let endpoint = `/api/transactions`;
        if (viewMode !== 'all') endpoint += `?type=${viewMode}`;

        const res = await fetch(`${apiUrl}${endpoint}`, {
          headers: { 
            'Authorization': `Bearer ${token}`, 
            'ngrok-skip-browser-warning': 'true' 
          }
        });

        if (res.ok) {
          const json = await res.json();
          setAllData(json.data || []);
        }
      } catch (e) {
        console.error("Gagal load data", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [viewMode, router]);

  // --- 2. Helper Timezone Fix (Anti Nimbrung) ---
  // Mengubah ISO String dari API menjadi YYYY-MM-DD Lokal Browser
  const getLocalDateKey = (isoString: string) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // --- 3. Logika Kalender Dinamis ---
  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days = new Date(year, month + 1, 0).getDate(); // Jumlah hari dalam bulan tsb
    return Array.from({ length: days }, (_, i) => i + 1);
  }, [currentDate]);

  const activeDateKey = getLocalDateKey(currentDate.toISOString()); // YYYY-MM-DD hari yang dipilih

  // Filter Data Berdasarkan Tanggal yang Dipilih
  const dailyTransactions = useMemo(() => {
    return allData.filter(t => getLocalDateKey(t.created_at) === activeDateKey).sort((a, b) => 
       new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [allData, activeDateKey]);

  // Hitung Total Harian
  const dailyTotal = useMemo(() => {
    return dailyTransactions.reduce((acc, curr) => {
      if (viewMode === 'all') {
        return acc + (curr.type === 'income' ? curr.amount : -curr.amount);
      }
      return acc + curr.amount;
    }, 0);
  }, [dailyTransactions, viewMode]);


  // --- 4. Navigasi & Scroll ---
  const changeMonth = (delta: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + delta);
    newDate.setDate(1); // Reset ke tanggal 1 setiap ganti bulan
    setCurrentDate(newDate);
  };

  const selectDay = (day: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(day);
    setCurrentDate(newDate);
  };

  const jumpToToday = () => {
    setCurrentDate(new Date());
  };

  // Auto Scroll ke Tanggal Aktif
  useEffect(() => {
    if (scrollRef.current) {
      const activeBtn = document.getElementById(`day-btn-${currentDate.getDate()}`);
      if (activeBtn) {
        activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [currentDate]);

  // --- 5. Formatting & Style ---
  const formatRupiah = (num: number) => {
    const absNum = Math.abs(num);
    const str = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(absNum);
    return num < 0 ? `- ${str}` : str;
  };

  const getThemeColor = () => {
    if (viewMode === 'income') return 'emerald';
    if (viewMode === 'expense') return 'rose';
    return 'blue';
  };
  const theme = getThemeColor();

  const deleteTransaction = async (id: number) => {
    if(!confirm("Yakin hapus data ini?")) return;
    try {
        const token = localStorage.getItem('jwt_token');
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/transactions/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' }
        });
        // Hapus dari state lokal biar responsif (tanpa fetch ulang)
        setAllData(prev => prev.filter(item => item.id !== id));
    } catch (e) {
        alert("Gagal menghapus");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      
      {/* --- HEADER STICKY --- */}
      <div className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 shadow-sm">
        
        {/* Top Bar: Back & Title */}
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
            <button 
                onClick={() => router.back()} 
                className="flex items-center gap-2 text-slate-400 hover:text-white transition group"
            >
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-slate-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                </div>
            </button>

            <div className="flex flex-col items-center">
                <h1 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                    {viewMode === 'all' ? 'Mutasi' : viewMode}
                </h1>
                <p className="text-xs text-slate-600">
                    {currentDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric'})}
                </p>
            </div>

            <button 
                onClick={jumpToToday}
                className={`text-[10px] font-bold px-3 py-1.5 rounded-full border bg-slate-900 border-slate-700 hover:bg-${theme}-500/10 hover:border-${theme}-500 hover:text-${theme}-400 transition`}
            >
                Hari Ini
            </button>
        </div>

        {/* Month Navigator */}
        <div className="max-w-3xl mx-auto py-2 border-t border-slate-800/50">
            <div className="flex items-center justify-center gap-6 mb-3">
                <button onClick={() => changeMonth(-1)} className="p-1 text-slate-500 hover:text-white hover:bg-slate-800 rounded-full transition">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                </button>
                <span className="text-lg font-bold text-white min-w-[140px] text-center">
                    {currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                </span>
                <button onClick={() => changeMonth(1)} className="p-1 text-slate-500 hover:text-white hover:bg-slate-800 rounded-full transition">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </button>
            </div>

            {/* Horizontal Day Scroll (1-31) */}
            <div 
                ref={scrollRef}
                className="flex overflow-x-auto gap-2 px-4 pb-2 no-scrollbar mask-gradient select-none"
            >
                {daysInMonth.map((day) => {
                    const isSelected = day === currentDate.getDate();
                    
                    // Style Dinamis
                    const activeClass = `bg-${theme}-600 text-white shadow-lg shadow-${theme}-900/50 scale-105 border-${theme}-500`;
                    const inactiveClass = `bg-slate-900 border-slate-800 text-slate-400 hover:border-${theme}-500/50 hover:text-white`;

                    return (
                        <button
                            key={day}
                            id={`day-btn-${day}`}
                            onClick={() => selectDay(day)}
                            className={`
                                flex-shrink-0 w-12 h-16 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all duration-200
                                ${isSelected ? activeClass : inactiveClass}
                            `}
                        >
                            <span className="text-[9px] uppercase font-bold opacity-60">
                                {new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toLocaleDateString('id-ID', { weekday: 'short' }).replace('.', '')}
                            </span>
                            <span className="text-xl font-bold leading-none">{day}</span>
                        </button>
                    );
                })}
            </div>
        </div>
      </div>

      {/* --- KONTEN LIST --- */}
      <div className="max-w-3xl mx-auto px-4 mt-6 space-y-4">
        
        {/* Total Harian Info */}
        <div className="flex items-center justify-between px-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                Ringkasan Tanggal {currentDate.getDate()}
            </span>
            <div className={`text-sm font-bold font-mono ${dailyTotal >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
               {viewMode === 'all' ? 'Net: ' : 'Total: '} {formatRupiah(dailyTotal)}
            </div>
        </div>

        {/* Loading State */}
        {isLoading && (
            <div className="py-20 text-center text-slate-500 animate-pulse">
                <div className={`w-8 h-8 border-2 border-${theme}-500 border-t-transparent rounded-full animate-spin mx-auto mb-2`}></div>
                Memuat data...
            </div>
        )}

        {/* Empty State (Sesuai Request: Kosongkan jika tidak ada input) */}
        {!isLoading && dailyTransactions.length === 0 && (
            <div className="py-12 bg-slate-900/30 rounded-2xl border border-dashed border-slate-800 text-center">
                <p className="text-3xl mb-2 opacity-50">📝</p>
                <p className="text-slate-400 text-sm font-medium">Belum ada catatan</p>
                <p className="text-slate-600 text-xs mt-1">Tidak ada transaksi pada tanggal ini.</p>
            </div>
        )}

        {/* Transaction List */}
        <div className="space-y-3">
            {!isLoading && dailyTransactions.map((trx) => (
                <div 
                    key={trx.id} 
                    className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between hover:border-slate-700 transition group relative overflow-hidden"
                >
                    {/* Decor Line */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${trx.type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>

                    <div className="flex items-center gap-4 pl-2 overflow-hidden">
                        {/* Icon */}
                        <div className={`
                            w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shrink-0
                            ${trx.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}
                        `}>
                            {trx.category.charAt(0).toUpperCase()}
                        </div>

                        {/* Details */}
                        <div className="min-w-0">
                            <h3 className="font-bold text-white text-sm truncate">{trx.category}</h3>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span className="bg-slate-950 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border border-slate-800">
                                    {trx.type === 'income' ? 'Masuk' : 'Keluar'}
                                </span>
                                {trx.note && <span className="truncate max-w-[150px] border-l border-slate-700 pl-2">{trx.note}</span>}
                            </div>
                        </div>
                    </div>

                    {/* Amount & Action */}
                    <div className="text-right shrink-0 z-10">
                        <p className={`font-mono font-bold text-sm ${trx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {trx.type === 'income' ? '+' : '-'}{formatRupiah(trx.amount)}
                        </p>
                        <p className="text-[10px] text-slate-600 mb-1">
                            {new Date(trx.created_at).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}
                        </p>
                        <button 
                            onClick={() => deleteTransaction(trx.id)}
                            className="text-[10px] text-red-500/40 hover:text-red-500 transition font-medium"
                        >
                            Hapus
                        </button>
                    </div>
                </div>
            ))}
        </div>

      </div>

      {/* Hide Scrollbar Style */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .mask-gradient {
            mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
            -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }
      `}</style>

    </div>
  );
}