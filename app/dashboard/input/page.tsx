// app/dashboard/input/page.tsx
"use client";

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

// Tipe data untuk Transaksi
interface Transaction {
  id: number;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  note: string;
  created_at: string;
}

export default function InputPage() {
  const router = useRouter();
  
  // State Form
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [displayAmount, setDisplayAmount] = useState<string>(''); // Untuk tampilan (ada titik)
  const [realAmount, setRealAmount] = useState<number>(0);        // Untuk dikirim ke API (angka murni)
  const [category, setCategory] = useState<string>('');
  const [note, setNote] = useState<string>('');

  // State Data & UI
  const [todayTransactions, setTodayTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [alertMessage, setAlertMessage] = useState<string>('');

  // Update saran kategori saat tipe berubah
  useEffect(() => {
    if (type === 'income') {
      setSuggestions(['Gaji', 'Bonus', 'Cairr', 'Hadiah']);
    } else {
      setSuggestions(['Makan', 'Ngopi',  'Belanja','Surya', 'Tagihan']);
    }
  }, [type]);

  // Load data hari ini saat pertama buka
  useEffect(() => {
    fetchTodayTransactions();
  }, []);

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
      console.error("Gagal load transaksi:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (realAmount <= 0) return alert("Jumlah uang wajib diisi!");
    if (!category) return alert("Kategori wajib diisi!");

    setIsSubmitting(true);
    setAlertMessage('');

    try {
      const token = localStorage.getItem('jwt_token');
      const payload = {
        type,
        amount: realAmount.toString(), // API butuh string angka
        category,
        note
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
        
        // Refresh Data
        fetchTodayTransactions();

        // Cek Alert dari Bot (misal over budget)
        if (json.alert) {
            setAlertMessage(json.alert.replace("\n\n🚨 ", ""));
            setTimeout(() => setAlertMessage(''), 5000);
        }
      } else {
        alert("Gagal: " + (json.error || "Error server"));
      }
    } catch (e) {
      alert("Error koneksi server");
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
      } else {
        alert("Gagal menghapus");
      }
    } catch (e) {
      alert("Error koneksi");
    }
  };

  // --- HELPERS ---

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, ''); // Hapus non-angka
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
  
  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 pb-10">
      
      {/* Tombol Back Mobile (Opsional, karena sudah ada Navbar desktop) */}
      <div className="md:hidden">
          <button onClick={() => router.back()} className="text-slate-400 hover:text-white flex items-center gap-2 text-sm">
            ← Kembali
          </button>
      </div>

      {/* CARD INPUT */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        {/* Efek Blur Background */}
        <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20 transition-colors duration-500 ${type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            
            {/* Switch Type */}
            <div className="grid grid-cols-2 gap-3 p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button type="button" onClick={() => setType('income')}
                    className={`py-2.5 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 ${type === 'income' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50' : 'text-slate-500 hover:text-slate-300'}`}>
                    <span>⬇️ Pemasukan</span>
                </button>
                <button type="button" onClick={() => setType('expense')}
                    className={`py-2.5 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 ${type === 'expense' ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/50' : 'text-slate-500 hover:text-slate-300'}`}>
                    <span>⬆️ Pengeluaran</span>
                </button>
            </div>

            {/* Input Amount */}
            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Jumlah (Rp)</label>
                <div className="relative group">
                    <span className={`absolute inset-y-0 left-0 flex items-center pl-4 font-bold text-lg transition-colors ${type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>Rp</span>
                    <input 
                        type="text" 
                        value={displayAmount} 
                        onChange={handleAmountChange} 
                        placeholder="0" 
                        className={`w-full bg-slate-950 border border-slate-700 rounded-xl py-4 pl-12 pr-4 text-2xl font-bold text-white outline-none transition focus:border-opacity-100 placeholder-slate-700 font-mono tracking-wide ${type === 'income' ? 'focus:border-emerald-500' : 'focus:border-rose-500'}`}
                    />
                </div>
            </div>

            {/* Input Kategori & Suggestion */}
            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Kategori</label>
                <input 
                    type="text" 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)} 
                    placeholder="Contoh: Gaji, Makan, Bensin..." 
                    className={`w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 text-white outline-none transition text-sm focus:ring-1 ${type === 'income' ? 'focus:border-emerald-500 focus:ring-emerald-500' : 'focus:border-rose-500 focus:ring-rose-500'}`}
                    required
                />
                
                <div className="flex gap-2 mt-2 overflow-x-auto pb-1 no-scrollbar">
                    {suggestions.map(sug => (
                        <button key={sug} type="button" onClick={() => setCategory(sug)} 
                            className="text-[10px] px-3 py-1 rounded-full border border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition whitespace-nowrap">
                            {sug}
                        </button>
                    ))}
                </div>
            </div>

            {/* Input Note */}
            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Catatan (Opsional)</label>
                <textarea 
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2} 
                    placeholder="Keterangan tambahan..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 text-white focus:ring-1 focus:border-slate-500 focus:ring-slate-500 outline-none transition text-sm resize-none"
                ></textarea>
            </div>

            {/* Submit Button */}
            <button type="submit" disabled={isSubmitting}
                className={`w-full font-bold py-4 rounded-xl transition shadow-lg flex items-center justify-center gap-2 text-white disabled:opacity-50 disabled:cursor-not-allowed mt-2 ${type === 'income' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20' : 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/20'}`}>
                {!isSubmitting ? 'Simpan Transaksi' : 'Menyimpan...'}
            </button>

        </form>
      </div>

      {/* LIST DATA HARI INI */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-bold text-slate-300">Riwayat Hari Ini</h3>
            {todayTransactions.length > 0 && (
                <span className="text-xs text-slate-500">{todayTransactions.length} item</span>
            )}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden min-h-[100px]">
            {isLoading && (
                <div className="p-8 text-center text-slate-500 animate-pulse text-sm">Memuat data hari ini...</div>
            )}

            {!isLoading && todayTransactions.length === 0 && (
                <div className="p-8 text-center text-slate-600">
                    <p className="text-2xl mb-2">📝</p>
                    <p className="text-sm">Belum ada transaksi hari ini.</p>
                </div>
            )}

            {!isLoading && todayTransactions.length > 0 && (
                <div className="divide-y divide-slate-800">
                    {todayTransactions.map(trx => (
                        <div key={trx.id} className="p-4 flex items-center justify-between hover:bg-slate-800/50 transition group">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 border border-slate-800 ${trx.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                    {trx.category.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-white truncate">{trx.category}</p>
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <span>{formatTime(trx.created_at)}</span>
                                        {trx.note && <span className="truncate max-w-[100px] border-l border-slate-700 pl-2">{trx.note}</span>}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="text-right shrink-0 flex flex-col items-end">
                                <p className={`text-sm font-mono font-bold ${trx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {trx.type === 'expense' ? '- ' : '+ '}{formatRupiah(trx.amount)}
                                </p>
                                <button onClick={() => handleDelete(trx.id)} className="text-[10px] text-red-500 hover:text-red-400 hover:underline mt-1 opacity-60 group-hover:opacity-100 transition">
                                    Hapus
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>

      {/* Toast / Alert */}
      {alertMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-sm animate-bounce-in">
            <div className="bg-slate-800 border border-amber-500/50 text-amber-100 px-4 py-3 rounded-xl shadow-2xl flex gap-3 items-start relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>
                <span className="text-xl">⚠️</span>
                <div>
                    <p className="text-xs font-bold uppercase text-amber-500 mb-0.5">Daily Budget Alert</p>
                    <p className="text-sm">{alertMessage}</p>
                </div>
                <button onClick={() => setAlertMessage('')} className="ml-auto text-amber-500/50 hover:text-amber-500">✕</button>
            </div>
        </div>
      )}

    </div>
  );
}