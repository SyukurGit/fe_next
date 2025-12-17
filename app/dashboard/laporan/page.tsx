// app/dashboard/laporan/page.tsx
"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// --- Tipe Data ---
interface Transaction {
  id: number;
  type: 'income' | 'expense';
  amount: number;
  created_at: string;
  category: string;
}

interface Stats {
  totalIncome: number;
  totalExpense: number;
  net: number;
  maxIncomeDay: string | null;
  maxIncomeAmount: number;
  maxExpenseDay: string | null;
  maxExpenseAmount: number;
}

export default function LaporanPage() {
  const router = useRouter();
  
  // State
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  
  // Statistik default
  const [stats, setStats] = useState<Stats>({
    totalIncome: 0,
    totalExpense: 0,
    net: 0,
    maxIncomeDay: null,
    maxIncomeAmount: 0,
    maxExpenseDay: null,
    maxExpenseAmount: 0,
  });
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // --- Initial Load ---
  useEffect(() => {
    // Pastikan token ada (Security Check)
    const token = localStorage.getItem('jwt_token');
    if (!token) {
        router.push('/login');
        return;
    }
    fetchTransactions();
  }, []);

  // --- Recalculate Stats saat data / bulan berubah ---
  useEffect(() => {
    calculateStats();
  }, [selectedDate, allTransactions]);

  // --- API CALLS ---
  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('jwt_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      const res = await fetch(`${apiUrl}/api/transactions`, {
        headers: { 
            'Authorization': `Bearer ${token}`, 
            'ngrok-skip-browser-warning': 'true' 
        }
      });

      if (res.status === 401) {
        localStorage.removeItem('jwt_token');
        router.push('/login');
        return;
      }

      const json = await res.json();
      // Handle jika respon berupa array langsung atau objek { data: [] }
      const data = Array.isArray(json) ? json : (json.data || []);
      setAllTransactions(data);
    } catch (e) {
      console.error("Error fetching data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadExcel = async () => {
    setIsExporting(true);
    try {
      const token = localStorage.getItem('jwt_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      
      const month = selectedDate.getMonth() + 1;
      const year = selectedDate.getFullYear();
      
      const res = await fetch(`${apiUrl}/api/export?month=${month}&year=${year}`, {
        headers: { 
            'Authorization': `Bearer ${token}`, 
            'ngrok-skip-browser-warning': 'true' 
        }
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Laporan_Syukur_${year}-${month}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        alert("Gagal download excel");
      }
    } catch (e) {
      alert("Error koneksi saat download");
    } finally {
      setIsExporting(false);
    }
  };

  // --- LOGIC PERHITUNGAN ---
  const calculateStats = () => {
    const targetMonth = selectedDate.getMonth();
    const targetYear = selectedDate.getFullYear();

    // 1. Filter transaksi sesuai bulan yang dipilih
    // Menggunakan helper getLocalDateKey agar konsisten dengan halaman Detail
    const filtered = allTransactions.filter(t => {
        const d = new Date(t.created_at);
        return d.getMonth() === targetMonth && d.getFullYear() === targetYear;
    });

    let inc = 0, exp = 0;
    const dailyIncome: Record<string, number> = {};
    const dailyExpense: Record<string, number> = {};

    // 2. Loop & Summing
    filtered.forEach(t => {
        // Ambil tanggal YYYY-MM-DD Lokal (Penting!)
        const d = new Date(t.created_at);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dateKey = `${year}-${month}-${day}`;
        
        if (t.type === 'income') {
            inc += t.amount;
            dailyIncome[dateKey] = (dailyIncome[dateKey] || 0) + t.amount;
        } else {
            exp += t.amount;
            dailyExpense[dateKey] = (dailyExpense[dateKey] || 0) + t.amount;
        }
    });

    // 3. Cari Max Income & Expense Day
    const maxIncEntry = Object.entries(dailyIncome).sort((a,b) => b[1] - a[1])[0];
    const maxExpEntry = Object.entries(dailyExpense).sort((a,b) => b[1] - a[1])[0];

    // 4. Update State
    setStats({
        totalIncome: inc,
        totalExpense: exp,
        net: inc - exp,
        maxIncomeDay: maxIncEntry ? maxIncEntry[0] : null,
        maxIncomeAmount: maxIncEntry ? maxIncEntry[1] : 0,
        maxExpenseDay: maxExpEntry ? maxExpEntry[0] : null,
        maxExpenseAmount: maxExpEntry ? maxExpEntry[1] : 0
    });
  };

  const changeMonth = (delta: number) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setSelectedDate(newDate);
  };

  // --- FORMATTERS ---
  const formatRupiah = (num: number) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num || 0);
  
  const formatMonthYear = (d: Date) => 
    d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  const formatDateFull = (dateStr: string | null) => {
    if(!dateStr) return "-";
    // dateStr sudah dalam format YYYY-MM-DD dari calculateStats
    const d = new Date(dateStr); 
    return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  // --- NAVIGASI KE DETAIL DENGAN FORMAT BENAR ---
 const navigateToDetail = (type: 'income' | 'expense', dateStr: string | null) => {
    if (!dateStr) return;
    // dateStr should be YYYY-MM-DD from your logic
    router.push(`/dashboard/detail?mode=${type}&date=${dateStr}`);
  };

  return (
    <div className="space-y-8 pb-10">
        
        {/* --- HEADER NAVIGATION --- */}
        <div className="flex items-center gap-4 mb-2">
            <button 
                onClick={() => router.back()} 
                className="group flex items-center justify-center w-10 h-10 rounded-full bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 transition"
                title="Kembali"
            >
                <svg className="w-5 h-5 text-slate-400 group-hover:text-white transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                </svg>
            </button>
            <div>
                <h1 className="text-xl font-bold text-white">Analisis Laporan</h1>
                <p className="text-xs text-slate-500">Ringkasan keuangan bulanan</p>
            </div>
        </div>
        
        {/* HEADER & FILTER PERIODE */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="w-full sm:w-auto">
                <h2 className="text-lg font-semibold text-white">Periode Laporan</h2>
                <p className="text-xs text-slate-400">Pilih bulan untuk melihat analisis</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                
                {/* Tombol Export Excel */}
                <button 
                    onClick={downloadExcel} 
                    disabled={isExporting}
                    className={`flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-lg text-xs font-bold transition shadow-lg shadow-emerald-900/20 w-full sm:w-auto ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {!isExporting ? (
                        <>
                            {/* Icon Excel */}
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <path d="M7 3h7l5 5v13H7V3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
                                <path d="M9 11h8M9 14h8M9 17h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                                <path d="M5.5 10l3 3m0-3l-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                            </svg>
                            <span>Download Laporan Excel</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" opacity="0.25" />
                                <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            <span>Mengekspor...</span>
                        </>
                    )}
                </button>

                {/* Picker Bulan */}
                <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800 w-full sm:w-auto justify-between sm:justify-normal">
                    <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                        </svg>
                    </button>
                    <span className="flex-1 text-center font-mono font-medium text-xs sm:text-sm text-white min-w-[120px]">
                        {formatMonthYear(selectedDate)}
                    </span>
                    <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>

        {/* LOADING STATE */}
        {isLoading && (
            <div className="py-20 text-center text-slate-500 animate-pulse">
                Sedang menghitung data...
            </div>
        )}

        {/* DATA KONTEN */}
        {!isLoading && (
            <div className="space-y-8 animate-fade-in-up">
                
                {/* 3 SUMMARY CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-slate-900/50 border border-emerald-500/30 rounded-xl p-5">
                        <p className="text-[10px] uppercase tracking-widest text-emerald-400 mb-1">Total Pemasukan (Bulan Ini)</p>
                        <p className="text-2xl font-bold text-white">{formatRupiah(stats.totalIncome)}</p>
                    </div>
                    <div className="bg-slate-900/50 border border-rose-500/30 rounded-xl p-5">
                        <p className="text-[10px] uppercase tracking-widest text-rose-400 mb-1">Total Pengeluaran (Bulan Ini)</p>
                        <p className="text-2xl font-bold text-white">{formatRupiah(stats.totalExpense)}</p>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-5">
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Cashflow Bersih (Bulan Ini)</p>
                        <p className={`text-2xl font-bold ${stats.net >= 0 ? 'text-sky-400' : 'text-orange-400'}`}>
                            {formatRupiah(stats.net)}
                        </p>
                    </div>
                </div>

                {/* HIGHEST DAY ANALYSIS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Hari Pemasukan Tertinggi */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <svg className="w-24 h-24 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path>
                                <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path>
                            </svg>
                        </div>
                        <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                            <span>🤑 Hari Paling Tinggi Pemasukan (Bulan ini)</span>
                        </h3>
                        {stats.maxIncomeDay ? (
                            <div className="mt-4">
                                <p className="text-3xl font-bold text-white">{formatRupiah(stats.maxIncomeAmount)}</p>
                                <p className="text-sm text-slate-400 mt-1">{formatDateFull(stats.maxIncomeDay)}</p>
                                
                                {/* Tombol Link ke Detail (Diperbaiki) */}
                                <button 
                                  onClick={() => navigateToDetail('income', stats.maxIncomeDay)} 
                                  className="inline-flex items-center gap-2 mt-4 text-xs font-medium text-emerald-500 hover:text-emerald-400 transition"
                                >
                                    Lihat Rinciannya &rarr;
                                </button>
                            </div>
                        ) : (
                            <div className="mt-4 text-sm text-slate-500">Tidak ada pemasukan bulan ini.</div>
                        )}
                    </div>

                    {/* Hari Pengeluaran Tertinggi */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <svg className="w-24 h-24 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
                            </svg>
                        </div>
                        <h3 className="text-sm font-semibold text-rose-400 flex items-center gap-2">
                            <span>📉 Hari Paling Tinggi Pengeluaran (Bulan ini)</span>
                        </h3>
                        {stats.maxExpenseDay ? (
                            <div className="mt-4">
                                <p className="text-3xl font-bold text-white">{formatRupiah(stats.maxExpenseAmount)}</p>
                                <p className="text-sm text-slate-400 mt-1">{formatDateFull(stats.maxExpenseDay)}</p>
                                
                                {/* Tombol Link ke Detail (Diperbaiki) */}
                                <button 
                                  onClick={() => navigateToDetail('expense', stats.maxExpenseDay)} 
                                  className="inline-flex items-center gap-2 mt-4 text-xs font-medium text-rose-500 hover:text-rose-400 transition"
                                >
                                    Lihat Rinciannya &rarr;
                                </button>
                            </div>
                        ) : (
                            <div className="mt-4 text-sm text-slate-500">Tidak ada pengeluaran bulan ini.</div>
                        )}
                    </div>

                </div>

            </div>
        )}
    </div>
  );
}