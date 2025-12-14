// app/dashboard/detail/page.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

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
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Ambil mode dari URL (?mode=income|expense|all)
  const viewMode = searchParams.get('mode') || 'all';
  const dateParam = searchParams.get('date');

  // State
  const [allData, setAllData] = useState<Transaction[]>([]);
  const [currentDateContext, setCurrentDateContext] = useState<Date>(new Date());
  const [activeDateKey, setActiveDateKey] = useState<string>(''); // YYYY-MM-DD
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // --- Initial Load ---
  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
        router.push('/login');
        return;
    }

    // Jika ada param tanggal (dari Laporan), set context ke sana
    if (dateParam) {
        const target = new Date(dateParam);
        if (!isNaN(target.getTime())) {
            setCurrentDateContext(target);
            setActiveDateKey(dateParam);
        }
    }

    fetchData();
  }, [viewMode]);

  // --- Fetch API ---
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('jwt_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      
      let endpoint = `/api/transactions`;
      if (viewMode !== 'all') endpoint += `?type=${viewMode}`;

      const res = await fetch(`${apiUrl}${endpoint}`, {
        headers: { 
            'Authorization': `Bearer ${token}`, 
            'ngrok-skip-browser-warning': 'true' 
        }
      });

      if (res.status === 401) {
        router.push('/login');
        return;
      }

      const json = await res.json();
      
      if (json.data) {
        // Sort dari terbaru ke terlama
        const sorted = json.data.sort((a: Transaction, b: Transaction) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setAllData(sorted);

        // Jika belum ada tanggal aktif, set ke tanggal terbaru yg ada datanya
        if (!activeDateKey && sorted.length > 0) {
            // Cari data di bulan ini dulu
            const thisMonthData = sorted.filter((t: Transaction) => {
                const d = new Date(t.created_at);
                return d.getMonth() === currentDateContext.getMonth();
            });
            
            if (thisMonthData.length > 0) {
                setActiveDateKey(thisMonthData[0].created_at.split('T')[0]);
            }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Computed Data (Menggunakan useMemo agar performa bagus) ---
  
  // 1. List Tanggal Unik di Bulan Terpilih (Sorted Ascending: 1, 2, 3...)
  const availableDatesInMonth = useMemo(() => {
    const targetMonth = currentDateContext.getMonth();
    const targetYear = currentDateContext.getFullYear();
    
    const dates = new Set<string>();
    allData.forEach(item => {
        const d = new Date(item.created_at);
        if (d.getMonth() === targetMonth && d.getFullYear() === targetYear) {
            dates.add(item.created_at.substring(0, 10)); // Ambil YYYY-MM-DD
        }
    });
    
    // Sort Ascending (Kecil ke Besar) agar navigasi Next/Prev logis
    return Array.from(dates).sort();
  }, [allData, currentDateContext]);

  // 2. Transaksi di Tanggal Aktif
  const activeTransactions = useMemo(() => {
    if (!activeDateKey) return [];
    return allData.filter(item => item.created_at.startsWith(activeDateKey));
  }, [allData, activeDateKey]);

  // 3. Total Harian
  const dailyTotal = useMemo(() => {
    return activeTransactions.reduce((acc, curr) => {
        if (viewMode === 'all') {
            return acc + (curr.type === 'income' ? curr.amount : -curr.amount);
        }
        return acc + curr.amount;
    }, 0);
  }, [activeTransactions, viewMode]);

  // 4. Total Bulanan
  const monthlyTotal = useMemo(() => {
    const targetMonth = currentDateContext.getMonth();
    const targetYear = currentDateContext.getFullYear();
    
    return allData.reduce((acc, curr) => {
        const d = new Date(curr.created_at);
        if (d.getMonth() === targetMonth && d.getFullYear() === targetYear) {
            if (viewMode === 'all') {
                return acc + (curr.type === 'income' ? curr.amount : -curr.amount);
            }
            return acc + curr.amount;
        }
        return acc;
    }, 0);
  }, [allData, currentDateContext, viewMode]);

  // --- Navigasi Logic ---

  const changeMonth = (delta: number) => {
    const newDate = new Date(currentDateContext);
    newDate.setMonth(newDate.getMonth() + delta);
    setCurrentDateContext(newDate);
    
    // Reset tanggal aktif jika bulan berubah
    setActiveDateKey('');
  };

  const navigateDate = (direction: number) => {
    // direction: -1 (Mundur), 1 (Maju)
    const currentIndex = availableDatesInMonth.indexOf(activeDateKey);
    if (currentIndex === -1 && availableDatesInMonth.length > 0) {
        // Jika belum pilih, pilih yg pertama
        setActiveDateKey(availableDatesInMonth[0]);
        return;
    }

    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < availableDatesInMonth.length) {
        setActiveDateKey(availableDatesInMonth[newIndex]);
    }
  };

  const resetToToday = () => {
    const today = new Date();
    setCurrentDateContext(today);
    const todayStr = today.toISOString().split('T')[0];
    
    // Cek ada data hari ini gak
    const hasToday = allData.some(d => d.created_at.startsWith(todayStr));
    if (hasToday) {
        setActiveDateKey(todayStr);
    } else {
        // Kalau gak ada, refresh data (siapa tau baru input)
        fetchData();
    }
  };

  // --- Formatters ---
  const formatMonthYear = (d: Date) => d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  const formatRupiah = (num: number) => {
    const absNum = Math.abs(num);
    const str = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(absNum);
    return num < 0 ? `- ${str}` : str;
  };
  const formatDateShort = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
  };
  const formatTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const getCategoryIcon = (cat: string) => cat ? cat.charAt(0).toUpperCase() : '?';

  const getViewTitle = () => {
    if (viewMode === 'income') return 'Rincian Pemasukan';
    if (viewMode === 'expense') return 'Rincian Pengeluaran';
    return 'Mutasi Rekening';
  };

  const isFirstDate = availableDatesInMonth.indexOf(activeDateKey) <= 0;
  const isLastDate = availableDatesInMonth.indexOf(activeDateKey) >= availableDatesInMonth.length - 1;

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-10">
        
        {/* HEADER MINI (Dalam Konten) */}
        <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-white capitalize">{getViewTitle()}</h1>
            <button onClick={resetToToday} className="text-xs font-medium text-emerald-500 hover:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Hari Ini
            </button>
        </div>

        {/* MONTH NAVIGATOR & TOTAL */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-lg">
            <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            </button>
            
            <div className="text-center">
                <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Periode</p>
                <p className="text-lg font-bold text-white">{formatMonthYear(currentDateContext)}</p>
                <p className={`text-xs ${viewMode === 'income' ? 'text-emerald-400' : (viewMode === 'expense' ? 'text-rose-400' : 'text-sky-400')}`}>
                    Total: <span className="font-mono">{formatRupiah(monthlyTotal)}</span>
                </p>
            </div>

            <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </button>
        </div>

        {/* DAY NAVIGATOR */}
        {!isLoading && availableDatesInMonth.length > 0 && (
            <div className="flex items-center justify-between gap-4">
                <button 
                    onClick={() => navigateDate(-1)} 
                    disabled={isFirstDate}
                    className="flex-1 py-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition group"
                >
                    <svg className="w-4 h-4 text-slate-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                    <span className="text-xs font-medium text-slate-300">Tgl Sblmnya</span>
                </button>

                <div className="flex flex-col items-center min-w-[120px]">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Sedang Dilihat</span>
                    <span className="text-sm font-bold text-white whitespace-nowrap">{formatDateShort(activeDateKey)}</span>
                </div>

                <button 
                    onClick={() => navigateDate(1)} 
                    disabled={isLastDate}
                    className="flex-1 py-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition group"
                >
                    <span className="text-xs font-medium text-slate-300">Tgl Berikut</span>
                    <svg className="w-4 h-4 text-slate-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </button>
            </div>
        )}

        {/* CONTENT LIST */}
        <div className="min-h-[300px]">
            {isLoading && (
                <div className="py-10 text-center animate-pulse">
                    <p className="text-slate-500 text-sm">Memuat data...</p>
                </div>
            )}

            {!isLoading && availableDatesInMonth.length === 0 && (
                <div className="py-12 text-center bg-slate-900/50 rounded-2xl border border-dashed border-slate-800">
                    <p className="text-4xl mb-2">💤</p>
                    <p className="text-slate-400 text-sm">Tidak ada transaksi di bulan ini.</p>
                </div>
            )}

            {!isLoading && activeTransactions.length > 0 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    
                    <div className="flex items-center justify-between px-2">
                        <span className="text-xs text-slate-400">Total Hari Ini</span>
                        <span className={`text-lg font-bold ${viewMode === 'income' ? 'text-emerald-400' : (viewMode === 'expense' ? 'text-rose-400' : 'text-sky-400')}`}>
                            {formatRupiah(dailyTotal)}
                        </span>
                    </div>

                    <div className="space-y-3">
                        {activeTransactions.map((item) => (
                            <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between hover:bg-slate-800/80 transition shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg bg-slate-950 border border-slate-800 shrink-0 text-white font-bold">
                                        {getCategoryIcon(item.category)}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-white truncate">{item.category}</p>
                                        <p className="text-xs text-slate-400 truncate w-32 sm:w-48">{item.note || 'Tanpa catatan'}</p>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className={`text-sm font-semibold whitespace-nowrap ${item.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {viewMode === 'all' ? (item.type === 'expense' ? '- ' : '+ ') : ''}
                                        {formatRupiah(item.amount)}
                                    </p>
                                    <p className="text-[10px] text-slate-500">{formatTime(item.created_at)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>

    </div>
  );
}