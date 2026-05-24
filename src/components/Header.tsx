import React, { useEffect, useState } from "react";
import { Gamepad2, Search, FileText, Settings, Clock, Flame, ShieldCheck, User, Wallet, LogOut, LogIn } from "lucide-react";
import { useAppStore } from "../store/useStore";
import AuthModal from "./AuthModal";

interface HeaderProps {
  activeTab: "games" | "tracker" | "admin" | "profile";
  setActiveTab: (tab: "games" | "tracker" | "admin" | "profile") => void;
  selectedSearch: string;
  setSelectedSearch: (v: string) => void;
  onRefreshData?: () => void;
}

const RECENT_PURCHASES_MOCK = [
  { user: "Riyan***", game: "Mobile Legends", item: "85 Diamonds", time: "1 detik lalu", status: "SUKSES" },
  { user: "Gamer99***", game: "Free Fire", item: "140 Diamonds", time: "2 menit lalu", status: "SUKSES" },
  { user: "Yasin***", game: "Genshin Impact", item: "Welkin Moon", time: "5 menit lalu", status: "SUKSES" },
  { user: "Dandi***", game: "PUBG Mobile", item: "660 UC", time: "8 menit lalu", status: "SUKSES" },
  { user: "Sari***", game: "Honor of Kings", item: "240 Tokens", time: "11 menit lalu", status: "SUKSES" },
  { user: "Wawan***", game: "Roblox", item: "800 Robux", time: "15 menit lalu", status: "SUKSES" }
];

export default function Header({ activeTab, setActiveTab, selectedSearch, setSelectedSearch, onRefreshData }: HeaderProps) {
  const [tickerIndex, setTickerIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState("2026-05-25 00:00:00 UTC");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  const { currentUser, setCurrentUser } = useAppStore();

  useEffect(() => {
    // Ticker timer for dynamic purchase feed
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % RECENT_PURCHASES_MOCK.length);
    }, 4000);

    // Dynamic clock formatted as requested
    const timeInterval = setInterval(() => {
      const now = new Date();
      const pad = (num: number) => String(num).padStart(2, '0');
      const yyyy = now.getUTCFullYear();
      const mm = pad(now.getUTCMonth() + 1);
      const dd = pad(now.getUTCDate());
      const hh = pad(now.getUTCHours());
      const min = pad(now.getUTCMinutes());
      const ss = pad(now.getUTCSeconds());
      setCurrentTime(`${yyyy}-${mm}-${dd} ${hh}:${min}:${ss} UTC`);
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timeInterval);
    };
  }, []);

  const currentTicker = RECENT_PURCHASES_MOCK[tickerIndex];

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      {/* Dynamic Scrolling Transaction Feed Bar */}
      <div className="bg-gradient-to-r from-violet-900 via-indigo-950 to-emerald-950 text-slate-100 text-xs py-2 px-4 flex justify-between items-center border-b border-indigo-900 overflow-hidden">
        <div className="flex items-center gap-2 max-w-full truncate">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-mono text-[10px] tracking-wider bg-slate-950/40 text-emerald-400 px-1.5 py-0.5 rounded font-bold">LIVE STATUS FEED:</span>
          <span className="animate-fade-in text-slate-300 font-medium text-[11px] truncate">
            {currentTicker.user} telah membayarkan <strong className="text-amber-400">{currentTicker.item}</strong> untuk <strong className="text-violet-300">{currentTicker.game}</strong> ({currentTicker.time}) • Status: 
            <span className="ml-1 bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-bold text-[10px]">{currentTicker.status}</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-slate-400">
          <Clock className="h-3 w-3 text-emerald-400" />
          <span>{currentTime}</span>
        </div>
      </div>

      {/* Primary Brand Navigation */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3 cursor-pointer select-none" onClick={() => { setActiveTab("games"); setSelectedSearch(""); }}>
          <div className="bg-gradient-to-br from-indigo-500 to-violet-600 p-2 sm:p-2.5 rounded-xl text-white shadow-lg shadow-indigo-500/20 flex items-center justify-center">
            <Gamepad2 className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="font-sans font-black text-sm sm:text-xl tracking-tight text-white bg-gradient-to-r from-white via-indigo-200 to-violet-400 bg-clip-text text-transparent">
                TOPUPGAME
              </span>
              <span className="text-[8px] sm:text-[10px] bg-indigo-600 text-indigo-100 px-1 py-0.5 rounded font-mono font-bold">BOOTSTRAP</span>
            </div>
            <p className="text-[10px] text-slate-400 tracking-wide font-medium hidden sm:block">Auto Game Digital Store Mode Rp0</p>
          </div>
        </div>

        {/* Dynamic Nav Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2 md:gap-3">
          <button
            id="nav-games"
            onClick={() => setActiveTab("games")}
            className={`flex items-center gap-2 px-2.5 py-2 sm:px-3.5 sm:py-2.5 rounded-xl font-medium text-xs sm:text-sm tracking-wide transition-all ${
              activeTab === "games"
                ? "bg-slate-800 text-white shadow-inner shadow-slate-950 border border-slate-700/50"
                : "text-slate-400 hover:text-white hover:bg-slate-800/40"
            }`}
          >
            <Gamepad2 className="h-4 w-4 text-indigo-400" />
            <span className="hidden sm:inline">Pilih Game</span>
          </button>

          <button
            id="nav-tracker"
            onClick={() => setActiveTab("tracker")}
            className={`flex items-center gap-2 px-2.5 py-2 sm:px-3.5 sm:py-2.5 rounded-xl font-medium text-xs sm:text-sm tracking-wide transition-all ${
              activeTab === "tracker"
                ? "bg-slate-800 text-white shadow-inner shadow-slate-950 border border-slate-700/50"
                : "text-slate-400 hover:text-white hover:bg-slate-800/40"
            }`}
          >
            <FileText className="h-4 w-4 text-emerald-400" />
            <span className="hidden sm:inline">Lacak Order</span>
          </button>

          {currentUser?.role === "ADMIN" && (
            <button
              id="nav-admin"
              onClick={() => setActiveTab("admin")}
              className={`flex items-center gap-2 px-2.5 py-2 sm:px-3.5 sm:py-2.5 rounded-xl font-medium text-xs sm:text-sm tracking-wide transition-all border ${
                activeTab === "admin"
                  ? "bg-indigo-600/20 text-indigo-300 border-indigo-500/50 shadow-lg shadow-indigo-500/5"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/40 border-transparent"
              }`}
            >
              <Settings className="h-4 w-4 text-indigo-400 animate-spin-hover" />
              <span className="hidden sm:inline">Admin Control</span>
            </button>
          )}

          <button
            id="nav-profile"
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 px-2.5 py-2 sm:px-3.5 sm:py-2.5 rounded-xl font-medium text-xs sm:text-sm tracking-wide transition-all ${
              activeTab === "profile"
                ? "bg-slate-800 text-white shadow-inner shadow-slate-950 border border-slate-700/50"
                : "text-slate-400 hover:text-white hover:bg-slate-800/40"
            }`}
          >
            <User className="h-4 w-4 text-violet-400 animate-pulse" />
            <span className="hidden sm:inline">Profil Saya</span>
          </button>

          {/* User Account / Auth Status Container inside nav */}
          <div className="h-6 w-px bg-slate-800"></div>

          {currentUser ? (
            <div className="flex items-center gap-2 shrink-0">
              <div 
                onClick={() => setActiveTab("profile")} 
                className="hidden xs:flex flex-col text-right font-sans cursor-pointer hover:opacity-80 transition-all"
                title="Lihat Profil Saya"
              >
                <span className="text-[10px] sm:text-[11px] text-white font-extrabold leading-none truncate max-w-[124px]">
                  {currentUser.name || currentUser.email.split("@")[0]}
                </span>
                <div className="flex items-center gap-1.5 justify-end mt-1">
                  <span className={`text-[8px] font-black px-1 py-0.2 rounded font-mono ${
                    currentUser.role === "ADMIN" ? "bg-red-500/20 text-red-400 border border-red-500/20" :
                    currentUser.role === "MEMBER" ? "bg-amber-500/20 text-amber-400 border border-amber-500/20" :
                    "bg-slate-500/20 text-slate-400 border border-slate-800"
                  }`}>
                    {currentUser.role}
                  </span>
                  <span className="text-[9px] text-emerald-400 font-mono font-bold leading-none">
                    Rp {currentUser.walletBalance.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* Action Button: Sign out */}
              <button
                id="header-logout-btn"
                onClick={() => {
                  setCurrentUser(null);
                  alert("Anda telah keluar dari sandbox sesi.");
                }}
                className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-rose-405 hover:bg-rose-500/10 hover:text-rose-400 transition-all border border-transparent hover:border-rose-500/20 cursor-pointer"
                title="Keluar"
              >
                <LogOut className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
              </button>
            </div>
          ) : (
            <button
              id="header-login-btn"
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 cursor-pointer transition-all shrink-0"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span className="hidden xs:inline text-[10px] tracking-wider font-mono">LOG IN</span>
            </button>
          )}

        </nav>
      </div>


      {/* Sub-Header search when browsing games */}
      {activeTab === "games" && (
        <div className="bg-slate-950/40 border-t border-slate-800 py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-medium text-slate-300 text-xs">
              <Flame className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
              <span>Cari game favorit Anda instan:</span>
            </div>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                id="search-game-input"
                type="text"
                value={selectedSearch}
                onChange={(e) => setSelectedSearch(e.target.value)}
                placeholder="Ex. Mobile Legends, Valorant..."
                className="w-full bg-slate-900 text-slate-100 pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-500 transition-all font-medium"
              />
            </div>
          </div>
        </div>
      )}

      {/* Global Sandbox Portal for authentication triggers */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </header>

  );
}
