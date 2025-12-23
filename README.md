<div align="center">
  <a href="https://dompetpintar-demo.vercel.app">
    <img src="./public/images/croplogobot.png" alt="Dompet Pintar Logo" width="120" height="120" />
  </a>

  <h1 align="center">Dompet Pintar (Smart Wallet Bot)</h1>

  <p align="center">
    <strong>Integrated Personal Finance Management Ecosystem (Web & Telegram)</strong>
  </p>

  <p align="center">
    <a href="https://dompetpintar.a76labs.online">Live Website</a>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" />
    <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
    <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
    <img src="https://img.shields.io/badge/TailwindCSS-3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  </p>
</div>

---

## 🚀 About the Project

**Dompet Pintar** is a modern *financial tracking* platform designed to simplify personal finance recording and analysis. The application integrates a **Telegram Bot** for fast, on-the-go transaction input with a **Next.js-based Web Dashboard** for comprehensive visualization and financial insights.

Built with a *real-time oriented architecture*, every transaction recorded via the Telegram Bot is automatically synchronized and instantly reflected on the web dashboard without requiring manual page refreshes.

---

## ✨ Key Features

### 1. ⚡ Hybrid Input System (Web & Telegram)

* **Telegram Bot Integration** – Record transactions as easily as sending a chat message (e.g., `20k lunch`).
* **Web Dashboard** – Detailed input forms for more structured and comprehensive data entry.
* **Live Data Synchronization** – Automatic data sync between the Bot and Web Dashboard using a *smart polling mechanism*.

### 2. 📊 Data Visualization & Analytics

* **Interactive Charts** – Cashflow trend visualization for the last 30 days.
* **Smart Summary** – Automatic calculation of income, expenses, and remaining balance.
* **Report Export** – Download monthly financial reports in **Excel (.xlsx)** format.

### 3. 🛡️ Security & User Management

* **Role-Based Access Control (RBAC)** – Clear access separation between **User** and **Superadmin** roles.
* **JWT Authentication** – Secure authentication system with protected routes via middleware logic.
* **Account Status Management** – Support for multiple account states: Active, Suspended, Pending, and Trial.

### 4. 📱 Modern & Responsive UI

* **Mobile-First Design** – Optimized for desktop, tablet, and mobile devices.
* **Native Dark Mode** – Modern interface with a comfortable slate and emerald color palette.

---

## 🛠️ Technology

| Category      | Technology                 |
| ------------- | -------------------------- |
| Framework     | Next.js 16 (App Router)    |
| Core Library  | React 19                   |
| Language      | TypeScript                 |
| Styling       | Tailwind CSS               |
| Icons         | Lucide React               |
| Visualization | Chart.js & react-chartjs-2 |
| HTTP Client   | Axios & Fetch API          |

---

## 📂 Project Structure

The folder structure follows a *clean architecture* approach to ensure scalability and maintainability:

```bash
fe_next/
├── app/
│   ├── dashboard/          # Protected user area
│   │   ├── chart/          # Chart details
│   │   ├── laporan/        # Report export & analysis
│   │   ├── pengaturan/     # User profile & limits
│   │   └── page.tsx        # Dashboard core logic
│   ├── login/              # Authentication pages
│   ├── superadmin/         # Admin-only area
│   └── page.tsx            # Landing page
├── components/             # Reusable UI components
├── public/                 # Static assets
└── configuration files
```

---

## 🚀 Getting Started (Local Development)

### 1. Clone the Repository

```bash
git clone https://github.com/username/dompet-pintar.git
cd dompet-pintar
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Configuration

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### 4. Run the Development Server

```bash
npm run dev
```

### 5. Access the Application

Open your browser and navigate to:

```
http://localhost:3000
```

---

## 🤝 Contribution & Credits

This project is developed with ❤️ by **A76 Labs**.

Contributions, feature ideas, and technical discussions are highly welcome through *Pull Requests* or *Issues* on the repository.
