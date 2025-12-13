// app/dashboard/chart/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Registrasi Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// --- TYPES ---
interface ChartItem {
  date: string;
  income: number;
  expense: number;
}

interface SummaryStats {
  income: number;
  expense: number;
  balance: number;
}

// --- COMPONENT ---
export default function ChartPage() {
  const router = useRouter();

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [chartType, setChartType] = useState<'comparison' | 'income' | 'expense'>('comparison');
  const [rawData, setRawData] = useState<ChartItem[]>([]);
  const [summary, setSummary] = useState<SummaryStats>({ income: 0, expense: 0, balance: 0 });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [chartDataConfig, setChartDataConfig] = useState<ChartData<"bar"> | null>(null);

  // --- FETCH DATA ---
  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchData();
  }, [currentDate]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('jwt_token');
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chart/daily?month=${month}&year=${year}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (!res.ok) throw new Error('Failed to fetch data');

      const json = await res.json();
      const data: ChartItem[] = Array.isArray(json.data) ? json.data : [];

      const sorted = data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setRawData(sorted);
      calculateSummary(sorted);
    } catch (err) {
      console.error('Fetch error:', err);
      setRawData([]);
      setSummary({ income: 0, expense: 0, balance: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  // --- SUMMARY ---
  const calculateSummary = (data: ChartItem[]) => {
    const income = data.reduce((acc, d) => acc + (d.income || 0), 0);
    const expense = data.reduce((acc, d) => acc + (d.expense || 0), 0);
    setSummary({ income, expense, balance: income - expense });
  };

  // --- CHART DATA ---
  useEffect(() => {
    if (!rawData.length) {
      setChartDataConfig(null);
      return;
    }

    const labels = rawData.map(d => new Date(d.date).getDate());
    const incomeData = rawData.map(d => d.income || 0);
    const expenseData = rawData.map(d => d.expense || 0);

    const datasets = [];
    if (chartType === 'comparison' || chartType === 'income') {
      datasets.push({
        label: 'Pemasukan',
        data: incomeData,
        backgroundColor: '#10b981',
        borderRadius: 6,
        barPercentage: 0.7,
        categoryPercentage: 0.8
      });
    }
    if (chartType === 'comparison' || chartType === 'expense') {
      datasets.push({
        label: 'Pengeluaran',
        data: expenseData,
        backgroundColor: '#f43f5e',
        borderRadius: 6,
        barPercentage: 0.7,
        categoryPercentage: 0.8
      });
    }

    setChartDataConfig({ labels, datasets });
  }, [rawData, chartType]);

  // --- HELPERS ---
  const changeMonth = (delta: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setCurrentDate(newDate);
  };

  const formatMonthYear = (d: Date) => d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  const formatRupiah = (num: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);

  // --- RENDER ---
  return (
    <div className="space-y-6 pb-8">

      {/* HEADER & FILTER */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-2xl p-4 sm:p-5 shadow-2xl">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          
          {/* Month Selector */}
          <div className="flex items-center gap-2 sm:gap-3 bg-slate-950/80 p-1.5 rounded-xl border border-slate-700 shadow-inner w-full sm:w-auto justify-center">
            <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-all duration-200 active:scale-95">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <span className="w-36 sm:w-40 text-center font-semibold text-base sm:text-lg text-white">{formatMonthYear(currentDate)}</span>
            <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-all duration-200 active:scale-95">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>

          {/* Chart Type Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value as 'comparison' | 'income' | 'expense')}
              className="w-full sm:w-auto bg-slate-950/80 border border-slate-700 text-sm rounded-xl px-3 sm:px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none cursor-pointer transition-all duration-200 shadow-lg hover:bg-slate-900 text-white"
            >
              <option value="comparison">📊 Bandingkan (In/Out)</option>
              <option value="income">⬇️ Hanya Pemasukan</option>
              <option value="expense">⬆️ Hanya Pengeluaran</option>
            </select>
          </div>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Income */}
        <div className="bg-gradient-to-br from-emerald-900/30 to-emerald-800/20 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs sm:text-sm uppercase text-emerald-400 font-bold tracking-wider">Total Masuk</p>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-emerald-100 tracking-tight">{formatRupiah(summary.income)}</p>
          <div className="mt-2 h-1 bg-emerald-500/20 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Expense */}
        <div className="bg-gradient-to-br from-rose-900/30 to-rose-800/20 border border-rose-500/30 rounded-2xl p-4 sm:p-5 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs sm:text-sm uppercase text-rose-400 font-bold tracking-wider">Total Keluar</p>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-rose-500/20 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path></svg>
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-rose-100 tracking-tight">{formatRupiah(summary.expense)}</p>
          <div className="mt-2 h-1 bg-rose-500/20 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Balance */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/30 border border-slate-600/50 rounded-2xl p-4 sm:p-5 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs sm:text-sm uppercase text-slate-400 font-bold tracking-wider">Selisih</p>
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${summary.balance >= 0 ? 'bg-sky-500/20' : 'bg-orange-500/20'}`}>
              <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${summary.balance >= 0 ? 'text-sky-400' : 'text-orange-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
            </div>
          </div>
          <p className={`text-2xl sm:text-3xl font-bold tracking-tight ${summary.balance >= 0 ? 'text-sky-300' : 'text-orange-300'}`}>{formatRupiah(summary.balance)}</p>
          <div className={`mt-2 h-1 rounded-full overflow-hidden ${summary.balance >= 0 ? 'bg-sky-500/20' : 'bg-orange-500/20'}`}>
            <div className={`h-full rounded-full animate-pulse ${summary.balance >= 0 ? 'bg-gradient-to-r from-sky-500 to-sky-400' : 'bg-gradient-to-r from-orange-500 to-orange-400'}`}></div>
          </div>
        </div>
      </div>

      {/* CHART */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-2xl p-4 sm:p-6 shadow-2xl relative min-h-[350px]">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 z-10 backdrop-blur-sm rounded-2xl">
            <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-3"></div>
            <span className="text-slate-400 text-sm animate-pulse">Memuat grafik...</span>
          </div>
        )}

        {!isLoading && (!chartDataConfig || !rawData.length) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
            <svg className="w-16 h-16 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            <p className="text-sm">Tidak ada data untuk bulan ini</p>
          </div>
        )}

        <div className="relative h-80 w-full">
          {chartDataConfig && <Bar data={chartDataConfig} options={{
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 750, easing: 'easeInOutQuart' },
            plugins: {
              legend: {
                position: 'top',
                align: 'end',
                labels: {
                  color: '#cbd5e1',
                  font: { family: 'Inter', size: 11, weight: '600' },
                  padding: 12,
                  usePointStyle: true,
                  pointStyle: 'circle'
                }
              },
              tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(15,23,42,0.96)',
                titleColor: '#fff',
                bodyColor: '#cbd5e1',
                borderColor: '#334155',
                borderWidth: 1,
                padding: 12,
                displayColors: true
              }
            },
            scales: {
              x: {
                ticks: { color: '#64748b', font: { size: 10 } },
                grid: { display: false }
              },
              y: {
                ticks: {
                  color: '#64748b',
                  font: { size: 10 },
                  callback: (value) => {
                    if (typeof value === 'number') {
                      if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + 'jt';
                      if (value >= 1_000) return (value / 1_000).toFixed(0) + 'rb';
                    }
                    return value;
                  }
                },
                grid: { color: '#1e293b' },
                beginAtZero: true
              }
            }
          }} />}
        </div>
      </div>

    </div>
  );
}
