// app/dashboard/page.tsx
"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ScriptableContext
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Registrasi komponen Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// --- INTERFACE TYPES ---
interface SummaryData {
  saldo: number;
  income: number;
  expense: number;
}

interface ChartItem {
  date: string;
  income: number;
  expense: number;
}

export default function DashboardPage() {
  const router = useRouter();
  
  // State User & Auth
  const [username, setUsername] = useState<string>('User');
  const [userStatus, setUserStatus] = useState<string>('');
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null);
  const [telegramId, setTelegramId] = useState<number | null>(null); // State untuk cek binding
  const [trialCountdown, setTrialCountdown] = useState<string>('');

  // State Limit
  const [dailyLimit, setDailyLimit] = useState<number>(0);
  const [todayExpense, setTodayExpense] = useState<number>(0);
  const [isLimitDismissed, setIsLimitDismissed] = useState(false);

  // State Data
  const [summary, setSummary] = useState<SummaryData>({ saldo: 0, income: 0, expense: 0 });
  const [chartData, setChartData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Ref untuk Polling
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // --- INIT & AUTH CHECK ---
  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Load User Data Local
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUsername(user.username || 'User');
        setUserStatus(user.status || '');
        setTrialEndsAt(user.trial_ends_at || null);
        
        // Simpan data penting untuk validasi
        setTelegramId(user.telegram_id || null);
        setDailyLimit(Number(user.daily_limit) || 0);

        // Redirect logic (Middleware Frontend)
        if (user.status === 'suspended') router.push('/dashboard/suspended');
        if (user.status === 'pending') router.push('/dashboard/waiting');

      } catch (e) {
        console.error("Error parse user", e);
      }
    }

    // Initial Fetch
    fetchAllData();

    // Start Polling (Live Sync setiap 3 detik)
    pollingRef.current = setInterval(() => {
      fetchSummary(true); 
      fetchChart(true);
    }, 3000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  // --- COUNTDOWN LOGIC ---
  useEffect(() => {
    if (userStatus === 'active' || !trialEndsAt) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const end = new Date(trialEndsAt).getTime();
      const distance = end - now;

      if (distance < 0) {
        setTrialCountdown("00:00:00");
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTrialCountdown(`${days} hari ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    updateCountdown(); 
    countdownRef.current = setInterval(updateCountdown, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [trialEndsAt, userStatus]);


  // --- API CALLS ---
  const fetchAllData = async () => {
    setIsLoading(true);
    await Promise.all([fetchSummary(), fetchChart()]);
    setIsLoading(false);
  };

  const fetchSummary = async (isBackground = false) => {
    try {
      const token = localStorage.getItem('jwt_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/summary`, {
        headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' }
      });
      
      if (res.status === 401) {
        localStorage.clear();
        router.push('/login');
        return;
      }
      
      const data = await res.json();
      setSummary({
        saldo: data.balance ?? data.saldo ?? 0,
        income: data.total_income ?? 0,
        expense: data.total_expense ?? 0
      });
    } catch (e) {
      if (!isBackground) console.error("Error fetching summary");
    }
  };

  const fetchChart = async (isBackground = false) => {
    try {
      const token = localStorage.getItem('jwt_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chart/daily`, {
        headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' }
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          processChartData(json.data);
        }
      }
    } catch (e) {
      if (!isBackground) console.error("Error fetching chart");
    }
  };

  // --- CHART PROCESSING & EXPENSE CALCULATION ---
  const processChartData = (rawData: ChartItem[]) => {
    // 1. Sort data
    const sorted = rawData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // 2. Hitung Pengeluaran HARI INI (FIXED TIMEZONE & SPEED)
    // Menggunakan waktu lokal browser untuk mencocokkan dengan data
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`; // Format YYYY-MM-DD Lokal

    const todayData = sorted.find(d => d.date === todayStr);
    
    // Update state expense instan
    if (todayData) {
        setTodayExpense(todayData.expense);
    } else {
        setTodayExpense(0);
    }

    // 3. Siapkan data chart (kode lama tetap sama)
    const labels = sorted.map(d => new Date(d.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }));
    const incomeData = sorted.map(d => d.income || 0);
    const expenseData = sorted.map(d => d.expense || 0);

    setChartData({
      labels,
      datasets: [
        {
          label: 'Pemasukan',
          data: incomeData,
          borderColor: '#10b981', 
          backgroundColor: (context: ScriptableContext<"line">) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
            gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
            return gradient;
          },
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 6,
          borderWidth: 2
        },
        {
          label: 'Pengeluaran',
          data: expenseData,
          borderColor: '#f43f5e', 
          backgroundColor: 'transparent',
          borderDash: [4, 4],
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 6,
          borderWidth: 2
        }
      ]
    });
  };

  // --- HANDLER TELEGRAM CLICK ---
  const handleTeleClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Cegah link default
    
    // Cek Bind
    if (!telegramId || telegramId === 0) {
        const confirmBind = confirm("⚠️ Akun Telegram Belum Terhubung!\n\nAnda perlu menghubungkan akun Telegram terlebih dahulu untuk menggunakan fitur Bot. Buka halaman pengaturan?");
        if (confirmBind) {
            router.push('/dashboard/pengaturan/telegram');
        }
    } else {
        // Jika sudah bind, buka link di tab baru
        window.open('https://t.me/DompetPintar_A76Labs_Bot', '_blank');
    }
  };

  const formatRupiah = (num: number) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num || 0);

  // --- RENDER ---
  if (isLoading) {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400 gap-3">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm animate-pulse">Menghubungkan ke server...</p>
        </div>
    );
  }

  // Cek apakah melebihi limit (Hanya tampil jika limit diset > 0)
const isOverLimit = dailyLimit > 0 && todayExpense > dailyLimit && !isLimitDismissed;
  return (
    <div className="space-y-6">
      
      {/* --- ALERT OVER LIMIT (STICKY / TOP BANNER) --- */}
      {isOverLimit && (
        <div className="bg-rose-950/40 border border-rose-500/50 rounded-xl p-4 animate-in slide-in-from-top-4 duration-300 shadow-lg shadow-rose-900/20 backdrop-blur-sm">
            <div className="flex justify-between items-start gap-4">
                
                {/* Kiri: Icon & Teks */}
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-rose-500/20 text-rose-400 rounded-full shrink-0 mt-0.5">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    </div>
                    <div>
                        <h3 className="text-rose-400 font-bold text-sm">Peringatan Limit Harian!</h3>
                        <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                            Pengeluaran hari ini (<span className="font-mono font-bold text-white notranslate">{formatRupiah(todayExpense)}</span>) telah melewati batas (<span className="font-mono text-slate-400 notranslate">{formatRupiah(dailyLimit)}</span>).
                        </p>
                    </div>
                </div>

                {/* Kanan: Tombol Close (X) */}
                <button 
                    onClick={() => setIsLimitDismissed(true)}
                    className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition shrink-0"
                    title="Tutup Notifikasi"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
        </div>
      )}

      {/* SECTION 1: HEADER & WELCOME */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
            <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-white tracking-tight">
                    {/* DITAMBAHKAN KELAS NOTRANSLATE DISINI */}
                    Hallo, <span className="text-emerald-400 capitalize notranslate"> {username}</span> 👋
                </h1>
                
                {userStatus === 'active' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                        Akun Active
                    </span>
                )}

                {userStatus === 'trial' && (
                    <span className="px-2 py-0.5 rounded text-[15px] font-bold font-mono tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                        {trialCountdown} sisa trial
                    </span>
                )}
            </div>
            <p className="text-slate-400 text-sm mt-1">Ini ringkasan keuangan Bos muda hari ini.</p>
        </div>
        
        {/* Mobile Live Indicator */}
        <div className="md:hidden flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs text-slate-500">Live Updating...</span>
        </div>
      </div>

      {/* SECTION 2: QUICK ACTION & INFO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mt-2">
        <p className="text-sm text-slate-400 leading-relaxed">
            Input <span className="text-emerald-400 font-semibold">pemasukan</span> atau 
            <span className="text-rose-400 font-semibold"> pengeluaran</span>? 
            Bisa via web atau via Bot Telegram di 
            {/* UPDATED LINK LOGIC */}
            <button 
                onClick={handleTeleClick} 
                className="text-emerald-400 font-semibold hover:text-emerald-200 hover:underline ml-1 bg-transparent border-none cursor-pointer focus:outline-none"
            >
                @DompetPintar_A76Labs_Bot
            </button>.
        </p>

        <Link href="/dashboard/input" className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-900 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 w-full md:w-auto transition">
            <span className="mr-2 text-base">＋</span> Input Pemasukan / Pengeluaran
        </Link>
      </div>

      {/* SECTION 3: SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        
        {/* Income Card */}
        <Link href="/dashboard/detail?mode=income" className="group relative overflow-hidden bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 transition-all hover:shadow-2xl hover:shadow-emerald-900/10 cursor-pointer">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition duration-500">
                <svg className="w-16 h-16 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
            </div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Total Pemasukan</p>
            {/* KELAS NOTRANSLATE UNTUK ANGKA */}
            <h3 className="text-3xl font-bold text-white mt-2 group-hover:text-emerald-400 transition notranslate">{formatRupiah(summary.income)}</h3>
            <div className="mt-4 flex items-center gap-2 text-emerald-500 text-xs font-medium bg-emerald-500/10 w-fit px-2 py-1 rounded-full">
                <span>↘ Rincian Masuk</span>
            </div>
        </Link>

        {/* Expense Card */}
        <Link href="/dashboard/detail?mode=expense" className="group relative overflow-hidden bg-slate-900 border border-slate-800 hover:border-rose-500/50 rounded-2xl p-6 transition-all hover:shadow-2xl hover:shadow-rose-900/10 cursor-pointer">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition duration-500">
                <svg className="w-16 h-16 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path></svg>
            </div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Total Pengeluaran</p>
            {/* KELAS NOTRANSLATE UNTUK ANGKA */}
            <h3 className="text-3xl font-bold text-white mt-2 group-hover:text-rose-400 transition notranslate">{formatRupiah(summary.expense)}</h3>
            <div className="mt-4 flex items-center gap-2 text-rose-500 text-xs font-medium bg-rose-500/10 w-fit px-2 py-1 rounded-full">
                <span>↘ Rincian Keluar</span>
            </div>
        </Link>

        {/* Balance Card */}
        <Link href="/dashboard/detail?mode=all" className="group relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 hover:border-sky-500/50 rounded-2xl p-6 shadow-lg transition-all hover:shadow-sky-900/20">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                <svg className="w-16 h-16 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
            </div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Selisih Saldo (Cashflow)</p>
            {/* KELAS NOTRANSLATE UNTUK ANGKA */}
            <h3 className="text-3xl font-bold text-white mt-2 group-hover:text-sky-400 transition notranslate">{formatRupiah(summary.saldo)}</h3>
            <div className="mt-4 flex items-center gap-2 text-sky-500 text-xs font-medium bg-sky-500/10 w-fit px-2 py-1 rounded-full">
                <span>↔ Mutasi Rekening</span>
            </div>
        </Link>
      </div>

      {/* SECTION 4: CHART */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Tren Cashflow 30 Hari</h3>
            <div className="flex items-center gap-3 text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>Masuk</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span>Keluar</span>
            </div>
        </div>

        <div className="relative h-72 w-full">
            {chartData ? (
                <Line 
                    data={chartData} 
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        interaction: { mode: 'index', intersect: false },
                        plugins: { 
                            legend: { display: false },
                            tooltip: {
                                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                titleColor: '#f8fafc',
                                bodyColor: '#e2e8f0',
                                borderColor: '#334155',
                                borderWidth: 1,
                                padding: 10,
                                displayColors: true,
                                callbacks: {
                                    label: function(context) {
                                        let label = context.dataset.label || '';
                                        if (label) label += ': ';
                                        if (context.parsed.y !== null) {
                                            label += new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits:0 }).format(context.parsed.y);
                                        }
                                        return label;
                                    }
                                }
                            }
                        },
                        scales: {
                            x: { grid: { display: false }, ticks: { color: '#64748b', font: {size: 10} } },
                            y: { 
                                grid: { color: '#1e293b' }, 
                                ticks: { 
                                    color: '#64748b', font: {size: 10},
                                    callback: function(value) {
                                        if(typeof value === 'number') {
                                            if(value >= 1000000) return (value/1000000) + 'jt';
                                            if(value >= 1000) return (value/1000) + 'rb';
                                        }
                                        return value;
                                    }
                                }, 
                                beginAtZero: true 
                            }
                        }
                    }} 
                />
            ) : (
                <div className="h-full flex items-center justify-center text-slate-600 text-sm">
                    Memuat grafik...
                </div>
            )}
        </div>

        <div className="mt-4 flex justify-end md:justify-center">
            <Link href="/dashboard/chart" className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full border border-blue-100/40 text-white hover:bg-blue-100/10 hover:border-blue-400 transition">
                <span>Lihat chart lengkap…</span>
                <span className="text-sm">↗</span>
            </Link>
        </div>
      </div>

      {/* FOOTER AREA */}
      <footer className="border-t border-slate-900 bg-slate-950 pt-12 pb-8 mt-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col items-center text-center space-y-6">
            <div className="w-full h-px bg-slate-900"></div>
            <p className="text-xs text-slate-600">
                &copy; 2025 DompetPintarBot. All rights reserved. <br/>
                <span className="opacity-50">Hak Cipta dimiliki A76 Labs.</span>
            </p>
        </div>
      </footer>

    </div>
  );
}