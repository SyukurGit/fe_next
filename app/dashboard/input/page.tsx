// app/dashboard/input/page.tsx
"use client";

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react'; // Pastikan install lucide-react jika belum

// Tipe data
interface Transaction {
  id: number;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  note: string;
  created_at: string;
}

// Tipe Notifikasi
type NotificationType = 'success' | 'warning' | 'error';
interface NotificationState {
  show: boolean;
  type: NotificationType;
  message: string;
  title?: string;
}

export default function InputPage() {
  const router = useRouter();
  
  // --- STATE ---
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [displayAmount, setDisplayAmount] = useState<string>('');
  const [realAmount, setRealAmount] = useState<number>(0);
  const [category, setCategory] = useState<string>('');
  const [note, setNote] = useState<string>('');

  const [todayTransactions, setTodayTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // State Notifikasi Baru (Professional Toast)
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    type: 'success',
    message: ''
  });

  // --- EFFECT ---
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    fetchTodayTransactions();
  }, []);

  useEffect(() => {
    if (type === 'income') {
      setSuggestions(['Gaji', 'Bonus', 'Cairr']);
    } else {
      setSuggestions(['Makan', 'Ngopi', 'Belanja']);
    }
  }, [type]);

  // Auto-hide notifikasi setelah 5 detik
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  // --- API CALLS ---
  const fetchTodayTransactions = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('jwt_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/transactions/today`, {
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
      setTodayTransactions(json.data || []);
    } catch (e) {
      console.error("Gagal load:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (realAmount <= 0) return showToast('error', "Jumlah uang wajib diisi!");
    if (!category) return showToast('error', "Kategori wajib diisi!");
    if (!selectedDate) return showToast('error', "Tanggal wajib diisi!");

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('jwt_token');
      const payload = {
        type,
        amount: realAmount.toString(),
        category,
        note,
        date: selectedDate
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/transactions`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(payload)
      });

      const json = await res.json();

      if (res.ok) {
        // Reset Form
        setDisplayAmount('');
        setRealAmount(0);
        setCategory('');
        setNote('');
        
        fetchTodayTransactions();

        // LOGIC NOTIFIKASI BARU
        if (json.alert) {
            // Jika ada Warning (Over Budget)
            showToast('warning', json.alert.replace("\n\n🚨 ", ""), "Daily Budget Alert");
        } else {
            // Jika Sukses Normal
            const today = new Date().toISOString().split('T')[0];
            if (selectedDate !== today) {
                // Backdate Success
                showToast('success', `Data tanggal ${formatDateIndo(selectedDate)} berhasil disimpan! Pengeluaran untuk melihatnya.`);
            } else {
                // Today Success
                showToast('success', 'Transaksi berhasil disimpan!');
            }
        }
      } else {
        showToast('error', json.error || "Gagal menyimpan data");
      }
    } catch (e) {
      showToast('error', "Terjadi kesalahan koneksi server");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin hapus data ini?")) return;
    try {
      const token = localStorage.getItem('jwt_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/transactions/${id}`, {
        method: 'DELETE',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'ngrok-skip-browser-warning': 'true'
        }
      });
      if (res.ok) {
        fetchTodayTransactions();
        showToast('success', "Data berhasil dihapus");
      } else {
        showToast('error', "Gagal menghapus data");
      }
    } catch (e) {
      showToast('error', "Error koneksi");
    }
  };

  // --- HELPERS ---
  const showToast = (type: NotificationType, message: string, title?: string) => {
    setNotification({ show: true, type, message, title });
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (val === '') {
      setDisplayAmount('');
      setRealAmount(0);
    } else {
      const num = parseInt(val);
      setRealAmount(num);
      setDisplayAmount(new Intl.NumberFormat('id-ID').format(num));
    }
  };

  const formatRupiah = (num: number) => new Intl.NumberFormat('id-ID').format(num);
  const formatTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  
  const formatDateIndo = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    if (dateStr === today) return "Hari Ini";
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getMinDate = () => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  };

  const getMaxDate = () => new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-20 relative">
      
      {/* --- TOAST NOTIFICATION COMPONENT --- */}
      <div className={`fixed top-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-md z-[100] transition-all duration-500 transform ${notification.show ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0 pointer-events-none'}`}>
        <div className={`border shadow-2xl rounded-2xl p-4 flex gap-3 items-start relative overflow-hidden backdrop-blur-md ${
            notification.type === 'success' ? 'bg-slate-900/95 border-emerald-500/30 shadow-emerald-900/20' : 
            notification.type === 'warning' ? 'bg-slate-900/95 border-amber-500/30 shadow-amber-900/20' : 
            'bg-slate-900/95 border-rose-500/30 shadow-rose-900/20'
        }`}>
            {/* Side Color Bar */}
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                notification.type === 'success' ? 'bg-emerald-500' : 
                notification.type === 'warning' ? 'bg-amber-500' : 
                'bg-rose-500'
            }`}></div>

            {/* Icon */}
            <div className={`shrink-0 mt-0.5 ${
                notification.type === 'success' ? 'text-emerald-500' : 
                notification.type === 'warning' ? 'text-amber-500' : 
                'text-rose-500'
            }`}>
                {notification.type === 'success' ? <CheckCircle size={20} /> : 
                 notification.type === 'warning' ? <AlertTriangle size={20} /> : 
                 <Info size={20} />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <h4 className={`text-xs font-bold uppercase tracking-wider mb-0.5 ${
                    notification.type === 'success' ? 'text-emerald-500' : 
                    notification.type === 'warning' ? 'text-amber-500' : 
                    'text-rose-500'
                }`}>
                    {notification.title || (notification.type === 'success' ? 'Berhasil' : notification.type === 'warning' ? 'Peringatan' : 'Error')}
                </h4>
                <p className="text-sm text-slate-200 leading-snug">{notification.message}</p>
            </div>

            {/* Close Button */}
            <button onClick={() => setNotification(prev => ({ ...prev, show: false }))} 
                className="shrink-0 text-slate-500 hover:text-white transition p-1">
                <X size={16} />
            </button>
        </div>
      </div>


      {/* HEADER & BACK BUTTON */}
      <div className="flex items-center justify-between pt-2">
          <button onClick={() => router.back()} className="text-slate-400 hover:text-white flex items-center gap-2 text-sm font-medium transition group">
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Kembali
          </button>
          <h1 className="text-lg font-bold text-white hidden md:block">Input Transaksi</h1>
      </div>

      {/* CARD INPUT */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20 transition-colors duration-500 ${type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            {/* TIPE & TANGGAL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
                    <button type="button" onClick={() => setType('income')}
                        className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${type === 'income' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50' : 'text-slate-500 hover:text-slate-300'}`}>
                        <span>⬇️ Pemasukan</span>
                    </button>
                    <button type="button" onClick={() => setType('expense')}
                        className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${type === 'expense' ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/50' : 'text-slate-500 hover:text-slate-300'}`}>
                        <span>⬆️ Pengeluaran</span>
                    </button>
                </div>

                <div className="relative bg-slate-950 rounded-xl border border-slate-700 group hover:border-slate-500 transition">
                    <label className="absolute -top-2 left-3 bg-slate-950 px-1 text-[10px] font-bold text-slate-400 uppercase">Tanggal</label>
                    <input type="date" required value={selectedDate} min={getMinDate()} max={getMaxDate()} onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full h-full bg-transparent text-white text-sm font-medium px-4 py-2.5 rounded-xl outline-none appearance-none [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:cursor-pointer" />
                    <div className="absolute right-10 top-2.5 text-xs text-slate-500 pointer-events-none hidden sm:block">{formatDateIndo(selectedDate)}</div>
                </div>
            </div>

            {/* Input Amount */}
            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Jumlah (Rp)</label>
                <div className="relative group">
                    <span className={`absolute inset-y-0 left-0 flex items-center pl-4 font-bold text-lg transition-colors ${type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>Rp</span>
                    <input type="text" value={displayAmount} onChange={handleAmountChange} placeholder="0" 
                        className={`w-full bg-slate-950 border border-slate-700 rounded-xl py-4 pl-12 pr-4 text-2xl font-bold text-white outline-none transition focus:border-opacity-100 placeholder-slate-700 font-mono tracking-wide ${type === 'income' ? 'focus:border-emerald-500' : 'focus:border-rose-500'}`} />
                </div>
            </div>

            {/* Input Kategori */}
            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Kategori</label>
                <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Contoh: Gaji, Makan..." 
                    className={`w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 text-white outline-none transition text-sm focus:ring-1 ${type === 'income' ? 'focus:border-emerald-500 focus:ring-emerald-500' : 'focus:border-rose-500 focus:ring-rose-500'}`} required />
                <div className="flex gap-2 mt-2 overflow-x-auto pb-1 no-scrollbar">
                    {suggestions.map(sug => (
                        <button key={sug} type="button" onClick={() => setCategory(sug)} className="text-[10px] px-3 py-1 rounded-full border border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition whitespace-nowrap">{sug}</button>
                    ))}
                </div>
            </div>

            {/* Input Note */}
            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Catatan (Opsional)</label>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Cash or Transfer..." className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 text-white focus:ring-1 focus:border-slate-500 focus:ring-slate-500 outline-none transition text-sm resize-none"></textarea>
            </div>

            {/* Submit Button */}
            <button type="submit" disabled={isSubmitting} className={`w-full font-bold py-4 rounded-xl transition shadow-lg flex items-center justify-center gap-2 text-white disabled:opacity-50 disabled:cursor-not-allowed mt-2 ${type === 'income' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20' : 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/20'}`}>
                {!isSubmitting ? 'Simpan Transaksi' : 'Menyimpan...'}
            </button>
        </form>
      </div>

      {/* LIST DATA */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-bold text-slate-300">Riwayat Input (Hari Ini)</h3>
            {todayTransactions.length > 0 && <span className="text-xs text-slate-500">{todayTransactions.length} item</span>}
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden min-h-[100px]">
            {isLoading && <div className="p-8 text-center text-slate-500 animate-pulse text-sm">Memuat data hari ini...</div>}
            {!isLoading && todayTransactions.length === 0 && <div className="p-8 text-center text-slate-600"><p className="text-2xl mb-2">📝</p><p className="text-sm">Belum ada transaksi hari ini.</p></div>}
            {!isLoading && todayTransactions.length > 0 && (
                <div className="divide-y divide-slate-800 ">
                    {todayTransactions.map(trx => (
                        <div key={trx.id} className="p-4 flex items-center justify-between hover:bg-slate-800/50 transition group ">
                            <div className="flex items-center gap-3 overflow-hidden notranslate">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 border border-slate-800 ${trx.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>{trx.category.charAt(0).toUpperCase()}</div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-white truncate">{trx.category}</p>
                                    <div className="flex items-center gap-2 text-xs text-slate-500"><span>{formatTime(trx.created_at)}</span>{trx.note && <span className="truncate max-w-[100px] border-l border-slate-700 pl-2">{trx.note}</span>}</div>
                                </div>
                            </div>
                            <div className="text-right shrink-0 flex flex-col items-end">
                                <p className={`text-sm font-mono font-bold ${trx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>{trx.type === 'expense' ? '- ' : '+ '}{formatRupiah(trx.amount)}</p>
                                <button onClick={() => handleDelete(trx.id)} className="text-[10px] text-red-500 hover:text-red-400 hover:underline mt-1 opacity-60 group-hover:opacity-100 transition">Hapus</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}