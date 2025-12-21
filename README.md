<div align="center">
  <a href="https://dompetpintar-demo.vercel.app">
    <img src="./public/images/croplogobot.png" alt="Logo Dompet Pintar" width="120" height="120" />
  </a>

  <h1 align="center">Dompet Pintar (Smart Wallet Bot)</h1>

  <p align="center">
    <strong>Ekosistem Manajemen Keuangan Pribadi Terintegrasi (Web & Telegram)</strong>
  </p>

  <p align="center">
    <a href="https://dompetpintar-demo.vercel.app">Live Demo</a>
    ·
    <a href="#-fitur-unggulan">Fitur Utama</a>
    ·
    <a href="#-teknologi">Teknologi</a>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" />
    <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
    <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
    <img src="https://img.shields.io/badge/TailwindCSS-3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  </p>
</div>

---

## 🚀 Tentang Project

**Dompet Pintar** adalah platform *financial tracking* modern yang dirancang untuk menyederhanakan pencatatan dan analisis keuangan pribadi. Aplikasi ini mengintegrasikan **Bot Telegram** sebagai media input transaksi yang cepat dan fleksibel, serta **Dashboard Web** berbasis **Next.js** untuk visualisasi dan analisis data yang komprehensif.

Dengan arsitektur *real-time oriented*, setiap transaksi yang dicatat melalui Telegram Bot akan langsung tersinkronisasi dan tampil pada dashboard web tanpa perlu melakukan *refresh* manual.

---

## ✨ Fitur Unggulan

### 1. ⚡ Hybrid Input System (Web & Telegram)

* **Telegram Bot Integration** – Input transaksi semudah chatting (contoh: `20rb makan siang`).
* **Web Dashboard** – Form input detail untuk pencatatan yang lebih lengkap.
* **Live Data Sync** – Sinkronisasi data otomatis antara Bot dan Web menggunakan *smart polling mechanism*.

### 2. 📊 Visualisasi & Analisis Data

* **Interactive Charts** – Grafik tren cashflow 30 hari terakhir.
* **Smart Summary** – Perhitungan otomatis pemasukan, pengeluaran, dan saldo akhir.
* **Export Laporan** – Unduh laporan keuangan bulanan dalam format **Excel (.xlsx)**.

### 3. 🛡️ Keamanan & Manajemen User

* **Role-Based Access Control (RBAC)** – Pemisahan akses antara **User** dan **Superadmin**.
* **JWT Authentication** – Sistem autentikasi aman dengan proteksi rute (*middleware*).
* **Account Status System** – Dukungan status akun: Active, Suspended, Pending, Trial.

### 4. 📱 UI Modern & Responsif

* **Mobile-First Design** – Optimal di desktop, tablet, dan perangkat mobile.
* **Dark Mode Native** – Tampilan modern dengan palet warna slate & emerald.

---

## 🛠️ Teknologi

| Kategori      | Teknologi                  |
| ------------- | -------------------------- |
| Framework     | Next.js 16 (App Router)    |
| Core Library  | React 19                   |
| Language      | TypeScript                 |
| Styling       | Tailwind CSS               |
| Icons         | Lucide React               |
| Visualization | Chart.js & react-chartjs-2 |
| HTTP Client   | Axios & Fetch API          |

---

## 📂 Struktur Project

Struktur folder dirancang dengan pendekatan *clean architecture* agar mudah dikembangkan dan dipelihara:

```bash
fe_next/
├── app/
│   ├── dashboard/          # Protected user area
│   │   ├── chart/          # Detail grafik
│   │   ├── laporan/        # Export & analisis laporan
│   │   ├── pengaturan/     # Profil & limit user
│   │   └── page.tsx        # Dashboard core
│   ├── login/              # Autentikasi
│   ├── superadmin/         # Admin area
│   └── page.tsx            # Landing page
├── components/             # Reusable UI components
├── public/                 # Static assets
└── config files
```

---

## 📸 Pratinjau Aplikasi

> Tambahkan screenshot aplikasi untuk meningkatkan daya tarik dokumentasi.

* **Dashboard Utama (Desktop)**
* **Tampilan Mobile**

---

## 🚀 Cara Menjalankan (Local Development)

### 1. Clone Repository

```bash
git clone https://github.com/username/dompet-pintar.git
cd dompet-pintar
```

### 2. Install Dependencies

```bash
npm install
# atau
yarn install
```

### 3. Konfigurasi Environment

Buat file `.env.local` di root project:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### 4. Jalankan Development Server

```bash
npm run dev
```

### 5. Akses Aplikasi

Buka browser dan akses:

```
http://localhost:3000
```

---

## 🤝 Kontribusi & Credits

Project ini dikembangkan dengan ❤️ oleh **A76 Labs**.

Kontribusi, ide fitur baru, dan diskusi sangat terbuka melalui *Pull Request* atau *Issue* pada repository ini.
