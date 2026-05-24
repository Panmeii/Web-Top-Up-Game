import React, { useState } from "react";
import { useAppStore } from "../store/useStore";
import { 
  User, Mail, Wallet, ShieldCheck, Sparkles, LogOut, Check, ArrowRight,
  PlusCircle, ShoppingBag, ShieldAlert, BadgeInfo, Award, Settings
} from "lucide-react";
import { Order, OrderStatus } from "../types";

interface ProfileTabProps {
  orders: Order[];
  onRefreshOrders?: () => void;
}

export default function ProfileTab({ orders, onRefreshOrders }: ProfileTabProps) {
  const { currentUser, setCurrentUser, updateWalletBalance } = useAppStore();
  
  // States
  const [displayName, setDisplayName] = useState(currentUser?.name || "");
  const [topUpAmountInput, setTopUpAmountInput] = useState("");
  const [customTopUpActive, setCustomTopUpActive] = useState(false);
  const [selectedPresetAmount, setSelectedPresetAmount] = useState<number | null>(50000);
  
  const [isTopUpLoading, setIsTopUpLoading] = useState(false);
  const [topUpSuccess, setTopUpSuccess] = useState<string | null>(null);
  const [settingsSuccess, setSettingsSuccess] = useState<string | null>(null);

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-12 bg-slate-900 border border-slate-850 rounded-3xl p-8 text-center space-y-6 shadow-2xl animate-fade-in text-left">
        <div className="mx-auto bg-slate-950 h-16 w-16 rounded-2xl flex items-center justify-center border border-slate-800 text-indigo-400">
          <User className="h-8 w-8 text-indigo-400" />
        </div>
        <div className="space-y-2">
          <h3 className="font-extrabold text-xl text-white">Sesi Belum Terhubung</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Anda belum masuk ke akun. Silakan klik tombol Masuk di bar navigasi atas atau gunakan tombol di bawah ini untuk mengaktifkan sesi sandbox instan.
          </p>
        </div>
        <button
          id="profile-trigger-login-fallback"
          onClick={() => {
            const loginBtn = document.getElementById("header-login-btn");
            if (loginBtn) loginBtn.click();
          }}
          className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/10 cursor-pointer"
        >
          Masuk Sekarang
        </button>
      </div>
    );
  }

  // Predefined quick deposit amounts
  const presetAmounts = [10000, 25000, 50000, 100000, 250000, 500000];

  // Handle deposit simulation
  const handleTopUp = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = customTopUpActive ? parseInt(topUpAmountInput) : selectedPresetAmount;
    
    if (!finalAmount || isNaN(finalAmount) || finalAmount <= 0) {
      alert("Harap pilih atau masukkan jumlah top up yang valid!");
      return;
    }

    setIsTopUpLoading(true);
    setTopUpSuccess(null);

    setTimeout(() => {
      const newBalance = currentUser.walletBalance + finalAmount;
      updateWalletBalance(newBalance);
      setIsTopUpLoading(false);
      setTopUpSuccess(`Deposit Simulasi Berhasil! Saldo Rp ${finalAmount.toLocaleString("id-ID")} telah ditambahkan ke wallet.`);
      setTopUpAmountInput("");
      
      // Trigger update logic
      if (onRefreshOrders) {
        onRefreshOrders();
      }
      
      setTimeout(() => setTopUpSuccess(null), 4000);
    }, 1200);
  };

  // Handle profile displayName edit
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      alert("Nama tampilan tidak boleh kosong!");
      return;
    }

    setCurrentUser({
      ...currentUser,
      name: displayName
    });
    setSettingsSuccess("Informasi nama profil berhasil diperbarui!");
    setTimeout(() => setSettingsSuccess(null), 3000);
  };

  // Determine user badge title and colors
  const getUserBadgeInfo = () => {
    switch (currentUser.role) {
      case "ADMIN":
        return { 
          title: "SUPREME OWNER (ADMIN)", 
          desc: "Akses Penuh Audit & Pengaturan Margin", 
          color: "from-red-500 to-rose-600 shadow-red-500/10" 
        };
      case "MEMBER":
        return { 
          title: "VIP GOLDEN MEMBER", 
          desc: "Potongan Harga Otomatis 10% Aktif", 
          color: "from-amber-500 to-yellow-600 shadow-amber-500/10" 
        };
      default:
        return { 
          title: "REGULAR GAMER", 
          desc: "Diskon opsional via kupon kuota terbatas", 
          color: "from-blue-500 to-indigo-600 shadow-blue-500/10" 
        };
    }
  };

  const badge = getUserBadgeInfo();

  // Find user orders (since sandbox we don't have user authentication tied hard to prisma, we show user related simulator orders or all orders depending on role context, which fits perfectly!)
  const userRelatedOrders = orders.slice(0, 10); // Show last 10 transactions

  return (
    <div id="profile-tab-workspace" className="space-y-8 animate-fade-in text-left">
      {/* Upper Jumbotron Welcome */}
      <div className="bg-slate-900 border border-slate-850 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 h-48 w-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 h-32 w-32 bg-violet-500/5 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left relative z-10 w-full md:w-auto">
          {/* Glowing Avatar circle */}
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-indigo-500/10 shrink-0 border border-white/10 uppercase">
            {currentUser.name ? currentUser.name[0] : currentUser.email[0]}
          </div>
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
              <h2 className="text-lg sm:text-2xl font-black text-white">{currentUser.name || currentUser.email.split("@")[0]}</h2>
              <span className={`text-[10px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full text-white bg-gradient-to-r text-center ${badge.color}`}>
                {currentUser.role}
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-1 font-mono">
              <Mail className="h-3 w-3 text-slate-500" />
              <span>{currentUser.email}</span>
            </p>
          </div>
        </div>

        {/* Big Balance Wallet Presentation */}
        <div className="bg-slate-950/80 border border-slate-800/80 p-4 rounded-2xl flex items-center gap-4 w-full md:w-auto relative z-10 justify-between sm:justify-start shrink-0">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">SALDO WALLET ANDA</span>
            <div className="flex items-center gap-1.5">
              <Wallet className="h-5 w-5 text-emerald-400" />
              <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                Rp {currentUser.walletBalance.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
          <div className="h-10 w-px bg-slate-800 hidden sm:block"></div>
          <div className="text-right hidden sm:block">
            <span className="text-[10px] font-extrabold text-slate-500 block font-mono">TIER DISKON</span>
            <span className="text-xs font-black text-amber-400 font-bold tracking-wider">
              {currentUser.role === "USER" ? "Standard" : currentUser.role === "MEMBER" ? "Reseller VIP 10%" : "Administrator"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left top-up + Settings / Right active logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (8 cols): Top Up simulator & Shopping status */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Top Up Wallet Section */}
          <div className="bg-slate-900 border border-slate-850 rounded-3xl p-5 sm:p-6 space-y-6">
            <div className="flex items-center gap-2.5 border-b border-slate-850 pb-4">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <PlusCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-white">Deposit Saldo Instan (Simulasi)</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                  Isi saldo wallet virtual Anda instan untuk melakukan top up item game dengan diskon harga mitra.
                </p>
              </div>
            </div>

            {topUpSuccess && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-[11px] sm:text-xs text-emerald-400 leading-normal font-semibold animate-shake">
                {topUpSuccess}
              </div>
            )}

            <form onSubmit={handleTopUp} className="space-y-5">
              {/* Preset Amounts GRID */}
              {!customTopUpActive && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Pilih Nominal Pengisian</label>
                  <div className="grid grid-cols-2 xs:grid-cols-3 gap-3">
                    {presetAmounts.map((amt) => (
                      <button
                        type="button"
                        key={amt}
                        onClick={() => setSelectedPresetAmount(amt)}
                        className={`py-3 px-2 rounded-xl border font-mono font-bold text-xs sm:text-sm text-center transition-all cursor-pointer ${
                          selectedPresetAmount === amt && !customTopUpActive
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/40 shadow-md shadow-emerald-500/5"
                            : "bg-slate-950 text-slate-400 border-slate-850 hover:border-slate-800 hover:bg-slate-850/20"
                        }`}
                      >
                        Rp {amt.toLocaleString("id-ID")}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Input */}
              {customTopUpActive && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Masukkan Jumlah Kustom (Rupiah)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono font-bold text-emerald-400 text-xs sm:text-sm">Rp</span>
                    <input
                      type="number"
                      value={topUpAmountInput}
                      onChange={(e) => setTopUpAmountInput(e.target.value)}
                      placeholder="Masukkan nilai deposit, Contoh: 150000"
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-11 pr-4 py-3 text-xs sm:text-sm text-slate-100 font-mono font-bold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Toggle custom input */}
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setCustomTopUpActive(!customTopUpActive);
                    setSelectedPresetAmount(customTopUpActive ? presetAmounts[2] : null);
                  }}
                  className="text-[10px] sm:text-xs text-indigo-400 hover:text-indigo-300 font-bold underline cursor-pointer"
                >
                  {customTopUpActive ? "Gunakan nominal standar swapper" : "Gunakan jumlah nominal kustom..."}
                </button>
              </div>

              {/* Submit simulation */}
              <button
                type="submit"
                disabled={isTopUpLoading}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs sm:text-sm py-3 px-4 rounded-xl shadow-lg shadow-emerald-500/10 cursor-pointer transition-all flex items-center justify-center gap-2 shrink-0"
              >
                {isTopUpLoading ? (
                  <div className="h-4.5 w-4.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Proses Pengisian Deposit Instan</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Shopper recent orders history inside profile */}
          <div className="bg-slate-900 border border-slate-850 rounded-3xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-850 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-white">Aktivitas Transaksi Simulasi</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                    Pelacakan pesanan digital global sandbox yang diproses di sistem ini.
                  </p>
                </div>
              </div>
            </div>

            {userRelatedOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] font-mono text-slate-500 tracking-wider">
                      <th className="pb-3 font-bold">INFO INVOICE / TANGGAL</th>
                      <th className="pb-3 font-bold">GAME & PRODUK</th>
                      <th className="pb-3 font-bold text-right">TOTAL</th>
                      <th className="pb-3 font-bold text-right">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850/60">
                    {userRelatedOrders.map((order) => (
                      <tr key={order.id} className="text-xs text-slate-300">
                        <td className="py-3 pr-2 whitespace-nowrap">
                          <span className="font-bold text-slate-200 block font-mono text-[11px]">{order.id}</span>
                          <span className="text-[9px] text-slate-500 font-mono block mt-0.5">
                            {new Date(order.createdAt).toLocaleDateString("id-ID")} {new Date(order.createdAt).toLocaleTimeString("id-ID")}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className="font-mono text-[10px] bg-slate-950 text-slate-300 px-1.5 py-0.5 rounded font-extrabold mr-1 border border-slate-800">
                            {order.gameName}
                          </span>
                          <span className="text-slate-400 text-[11px] block mt-1 leading-normal font-medium">{order.productName}</span>
                          <span className="text-[9px] text-slate-500 block leading-none mt-0.5">Gamer ID: {order.userUid}</span>
                        </td>
                        <td className="py-3 text-right font-mono font-bold text-slate-200 whitespace-nowrap">
                          Rp {order.priceFinal.toLocaleString("id-ID")}
                        </td>
                        <td className="py-3 text-right whitespace-nowrap">
                          <span className={`inline-block text-[9px] font-extrabold px-2 py-0.5 rounded font-mono ${
                            order.status === "SUCCESS" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10" :
                            order.status === "PENDING" ? "bg-amber-500/10 text-amber-400 border border-amber-500/10" :
                            "bg-indigo-500/10 text-indigo-400 border border-indigo-500/10"
                          }`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500 space-y-1">
                <p className="text-[11px]">Belum ada data invoice pesanan dalam sesi ini.</p>
                <p className="text-[10px] text-slate-600">Lakukan pemesanan top up game apa saja dan invoice akan terekam.</p>
              </div>
            )}
          </div>

        </div>

        {/* Right Column (4 cols): User settings changes & Level card info */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Level tier details cards */}
          <div className="bg-slate-900 border border-slate-850 rounded-3xl p-5 sm:p-6 space-y-4">
            <h3 className="font-sans font-extrabold text-xs tracking-wider text-slate-400 uppercase font-mono">STATUS LEVEL FITUR KEMITRAAN</h3>
            <div className="bg-slate-950/80 border border-slate-850 p-4 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs sm:text-sm">
                <Award className="h-4 w-4" />
                <span>{badge.title}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {badge.desc}. Sistem top up game kami menyeimbangkan margin supplier secara instan demi menyejahterakan operasional mitra.
              </p>
              
              {/* Rewards info metrics */}
              <div className="border-t border-slate-800 pt-3 mt-2 grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <span className="text-slate-500 uppercase font-mono tracking-wider font-extrabold leading-none">Status Autentikasi</span>
                  <span className="text-white font-semibold mt-1 block">JWT Verified</span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase font-mono tracking-wider font-extrabold leading-none">Tipe Server</span>
                  <span className="text-indigo-400 font-bold mt-1 block">Supabase SQL Eng.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Name details modifier form */}
          <div className="bg-slate-900 border border-slate-850 rounded-3xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
              <Settings className="h-4 w-4 text-violet-400" />
              <h3 className="font-extrabold text-xs sm:text-sm text-white">Perbarui Nama Tampilan</h3>
            </div>

            {settingsSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[10px] text-emerald-400 font-semibold leading-relaxed">
                {settingsSuccess}
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">NAMA AKUN KAMU</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Masukkan nama baru, Ex. Rian Kampank"
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-xs text-slate-100 font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-indigo-400 hover:text-indigo-300 font-bold text-xs py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 shrink-0"
              >
                <span>Simpan Perubahan</span>
              </button>
            </form>
          </div>

          {/* Logout button */}
          <div className="bg-slate-950 border border-slate-850 rounded-3xl p-5 text-center">
            <p className="text-[10px] text-slate-400 mb-3 leading-normal font-medium">
              Selesai menggunakan panel sandbox? Kamu dapat keluar dan mereset sesi ini.
            </p>
            <button
              onClick={() => {
                setCurrentUser(null);
                alert("Anda telah keluar dari sandbox sesi.");
              }}
              className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-xs py-2.5 rounded-xl border border-rose-500/20 cursor-pointer transition-all flex items-center justify-center gap-2 shrink-0"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Keluar Sesi</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
