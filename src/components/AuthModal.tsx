import React, { useState } from "react";
import { useAppStore } from "../store/useStore";
import { X, ShieldCheck, Mail, Lock, User as UserIcon, Sparkles, ArrowRight, ShieldAlert } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { currentUser, setCurrentUser } = useAppStore();
  const [activeTab, setActiveTab] = useState<"login" | "register" | "forgot">("login");
  
  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  
  // Feedback states
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Preset role credentials for premium sandbox convenience
  const rolePresets = [
    {
      role: "ADMIN" as const,
      email: "riankampank@gmail.com",
      name: "Rian Kampank",
      balance: 150000.0,
      badge: "Full Access & Audit Tools",
      color: "from-red-500 to-indigo-600"
    },
    {
      role: "MEMBER" as const,
      email: "member_vip@gamer.com",
      name: "VIP Member",
      balance: 75000.0,
      badge: "8-15% Automatic Pricing Discount",
      color: "from-amber-500 to-yellow-600"
    },
    {
      role: "USER" as const,
      email: "gamer_regular@gmail.com",
      name: "Regular User",
      balance: 15000.0,
      badge: "Standard Consumer Console",
      color: "from-slate-500 to-slate-700"
    }
  ];

  const triggerPresetLogin = (preset: typeof rolePresets[0]) => {
    setIsLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    setTimeout(() => {
      setCurrentUser({
        id: `user-${preset.role.toLowerCase()}-001`,
        email: preset.email,
        name: preset.name,
        role: preset.role,
        walletBalance: preset.balance
      });
      setIsLoading(false);
      setSuccessMsg(`Berhasil login sebagai info role: ${preset.role}!`);
      setTimeout(() => {
        onClose();
        // Reset modal messages after closing
        setSuccessMsg(null);
      }, 1000);
    }, 500);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    setTimeout(() => {
      if (activeTab === "login") {
        if (!email || !password) {
          setErrorMsg("Semua kolom email dan password wajib diisi!");
          setIsLoading(false);
          return;
        }

        // Standard user generation
        setCurrentUser({
          id: `user-standard-${Math.floor(100000 + Math.random() * 900000)}`,
          email: email,
          name: email.split("@")[0].toUpperCase(),
          role: "USER",
          walletBalance: 20000.0 // Starter simulation balance
        });
        setSuccessMsg("Autentikasi Supabase Berhasil! Token JWT telah disimpan.");
        setTimeout(() => {
          onClose();
          setSuccessMsg(null);
        }, 1200);

      } else if (activeTab === "register") {
        if (!email || !name || !password) {
          setErrorMsg("Harap melengkapi seluruh formulir pendaftaran!");
          setIsLoading(false);
          return;
        }

        setCurrentUser({
          id: `user-member-${Math.floor(1000 + Math.random() * 9000)}`,
          email: email,
          name: name,
          role: "MEMBER", // Register automatically promotes to member for reward logic
          walletBalance: 30000.0 // Bonus registrasi Rp30.000
        });
        setSuccessMsg("Pendaftaran MEMBER Baru Berhasil! Selamat datang.");
        setTimeout(() => {
          onClose();
          setSuccessMsg(null);
        }, 1200);

      } else {
        // Forgot Password
        if (!email) {
          setErrorMsg("Harap masukkan alamat email Anda!");
          setIsLoading(false);
          return;
        }
        setSuccessMsg(`Instruksi pengaturan ulang sandi dikirim ke: ${email}`);
      }
      setIsLoading(false);
    }, 805);
  };

  const handleGoogleOAuthLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setCurrentUser({
        id: "user-google-oauth",
        email: "google.tester@gmail.com",
        name: "Google Connected User",
        role: "MEMBER",
        walletBalance: 50000.0
      });
      setIsLoading(false);
      setSuccessMsg("Secure Google OAuth linked via Supabase!");
      setTimeout(() => {
        onClose();
        setSuccessMsg(null);
      }, 1000);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        onClick={onClose}
      ></div>

      {/* Main card */}
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl z-10 animate-fade-in flex flex-col">
        {/* Colorful gradient stripe header */}
        <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500"></div>

        {/* Header toolbar */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-850">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-indigo-500/10 text-indigo-400">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <span className="font-sans font-black tracking-tight text-white text-sm">
              SISTEM AUTENTIKASI UTAMA
            </span>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-500 hover:text-white hover:bg-slate-800 p-1.5 rounded-lg transition-all"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[80vh] space-y-5 text-left">
          {/* Preset Swapper for testing purposes (Rp0 bootstrap high validation value) */}
          <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-850/60 space-y-3">
            <div className="flex items-center gap-1.5 font-mono text-[9px] font-extrabold text-indigo-400 tracking-wider">
              <Sparkles className="h-3 w-3 text-amber-500 animate-pulse" />
              <span>TESTING ROLE SANDBOX: QUICK SWAP</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-normal">
              Pilih akun preset di bawah jika ingin menginstankan validasi proteksi route (USER/ADMIN) & harga berselisih (MEMBER):
            </p>
            <div className="grid grid-cols-1 gap-2.5">
              {rolePresets.map((preset) => (
                <button
                  id={`preset-auth-${preset.role.toLowerCase()}`}
                  key={preset.role}
                  onClick={() => triggerPresetLogin(preset)}
                  disabled={isLoading}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-850 bg-slate-900/50 hover:bg-slate-850/30 transition-all text-left text-xs text-slate-300 group"
                >
                  <div className="truncate pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded text-white bg-gradient-to-r ${preset.color}`}>
                        {preset.role}
                      </span>
                      <span className="font-bold text-white truncate text-[11px]">{preset.name}</span>
                    </div>
                    <span className="text-[9px] text-slate-500 leading-none block mt-1">{preset.badge}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded">
                    Rp {preset.balance.toLocaleString("id-ID")}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex items-center justify-center my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-850"></div>
            </div>
            <span className="relative z-10 bg-slate-900 px-3 text-[10px] text-slate-500 font-bold font-mono uppercase tracking-widest">
              Atau Autentikasi Form
            </span>
          </div>

          {/* Form tab controllers */}
          <div className="flex items-center justify-center bg-slate-950 p-1 rounded-xl border border-slate-850">
            <button
              id="auth-tab-login"
              onClick={() => { setActiveTab("login"); setErrorMsg(null); setSuccessMsg(null); }}
              className={`flex-1 py-2 text-center rounded-lg text-xs font-bold transition-all ${
                activeTab === "login" ? "bg-slate-900 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Masuk
            </button>
            <button
              id="auth-tab-register"
              onClick={() => { setActiveTab("register"); setErrorMsg(null); setSuccessMsg(null); }}
              className={`flex-1 py-2 text-center rounded-lg text-xs font-bold transition-all ${
                activeTab === "register" ? "bg-slate-900 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Daftar
            </button>
            <button
              id="auth-tab-forgot"
              onClick={() => { setActiveTab("forgot"); setErrorMsg(null); setSuccessMsg(null); }}
              className={`flex-1 py-2 text-center rounded-lg text-xs font-bold transition-all ${
                activeTab === "forgot" ? "bg-slate-900 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Lupa Sandi
            </button>
          </div>

          {/* Feedback logs */}
          {successMsg && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-[11px] text-emerald-400 leading-relaxed font-semibold">
              {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-[11px] text-rose-400 leading-relaxed flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-rose-500 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Core Custom Forms */}
          <form onSubmit={handleFormSubmit} className="space-y-4">
            {activeTab === "register" && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Nama Lengkap</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    id="auth-form-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Rian Kampank"
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition-all font-medium"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Alamat Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  id="auth-form-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition-all font-medium"
                />
              </div>
            </div>

            {activeTab !== "forgot" && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Sandi Akun</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    id="auth-form-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition-all font-medium"
                  />
                </div>
              </div>
            )}

            <button
              id="auth-form-submit"
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-bold text-xs sm:text-sm py-3 px-4 rounded-xl shadow-lg shadow-indigo-500/10 cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="h-4.5 w-4.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>
                    {activeTab === "login" ? "Masuk Sandbox" : activeTab === "register" ? "Register & Klaim Klaim Bonus" : "Kirim Email Reset"}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {activeTab === "login" && (
            <>
              <div className="relative flex items-center justify-center my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-850"></div>
                </div>
                <span className="relative z-10 bg-slate-900 px-3 text-[10px] text-slate-500 font-bold font-mono">
                  Bypass Google Account
                </span>
              </div>

              {/* Secure popup-based simulation triggers */}
              <button
                id="auth-google-oauth-btn"
                type="button"
                onClick={handleGoogleOAuthLogin}
                className="w-full bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span className="text-sm select-none">🌐</span>
                <span>Masuk dengan Google OAuth</span>
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
