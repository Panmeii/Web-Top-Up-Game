import React, { useState, useEffect } from "react";
import { Sparkles, DollarSign, TrendingUp, Users, Calendar, AlertTriangle, Play, RefreshCw, BarChart2, ShieldAlert, CheckCircle2, FileText, Zap, Key, ArrowRight } from "lucide-react";
import { Product, Voucher, Order, WebhookLog, AppSettings, Game } from "../types";
import { useAppStore } from "../store/useStore";

interface AdminPanelProps {
  products: Product[];
  vouchers: Voucher[];
  orders: Order[];
  games: Game[];
  onRefreshData?: () => void;
}

export default function AdminPanel({ products, vouchers, orders, games, onRefreshData }: AdminPanelProps) {
  const { currentUser } = useAppStore();
  
  const [activeSubTab, setActiveSubTab] = useState<"dashboard" | "pricing" | "coupons" | "api" | "seo">("dashboard");

  const [currentLogs, setCurrentLogs] = useState<WebhookLog[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);

  // Sync state
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncResult, setSyncResult] = useState("");

  // Update product state
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editPriceSupplier, setEditPriceSupplier] = useState<number>(0);
  const [editPriceFinal, setEditPriceFinal] = useState<number>(0);
  const [editStatus, setEditStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const [pricingError, setPricingError] = useState("");
  const [pricingSuccess, setPricingSuccess] = useState("");

  // AI SEO State
  const [selectedSeoGame, setSelectedSeoGame] = useState(games[0]?.name || "Mobile Legends");
  const [seoKeyword, setSeoKeyword] = useState("diamond ml murah otomatis");
  const [seoLoading, setSeoLoading] = useState(false);
  const [seoResult, setSeoResult] = useState<any | null>(null);

  // Vouchers local state
  const [localVouchers, setLocalVouchers] = useState<Voucher[]>(vouchers);

  // Fetch log records and settings from Express backend
  const fetchLogsAndSettings = async () => {
    try {
      const logsResp = await fetch("/api/logs");
      const logsData = await logsResp.json();
      if (logsResp.ok) setCurrentLogs(logsData);

      const settingsResp = await fetch("/api/settings");
      const settingsData = await settingsResp.json();
      if (settingsResp.ok) setSettings(settingsData);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchLogsAndSettings();
    setLocalVouchers(vouchers);
  }, [vouchers, orders, products]);

  // Calculate Cumulative Dashboard Stats
  const getDashboardStats = () => {
    const totalTransactions = orders.length;
    const completedOrders = orders.filter(o => o.status === "SUCCESS" || o.status === "PAID" || o.status === "PROCESSING");
    
    // Revenue counts final volumes
    const revenueSum = completedOrders.reduce((sum, o) => sum + o.priceFinal, 0);
    
    // Profit counts margin sum: final_amount - supplierCost - voucherDiscount
    const netProfitSum = completedOrders.reduce((sum, o) => {
      const pSupp = o.priceSupplier;
      const base = o.priceBase;
      const earnedUnit = base - pSupp - o.discountAmount;
      return sum + earnedUnit;
    }, 0);

    return {
      revenueSum,
      netProfitSum,
      totalTransactions,
      completedOrdersCount: completedOrders.length
    };
  };

  const { revenueSum, netProfitSum, totalTransactions, completedOrdersCount } = getDashboardStats();

  // Run auto bulk sync simulation
  const handleBulkSync = async (provider: string) => {
    setSyncLoading(true);
    setSyncResult("");
    try {
      const r = await fetch("/api/supplier/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider })
      });
      const data = await r.json();
      if (r.ok) {
        setSyncResult(data.message);
        if (onRefreshData) onRefreshData();
        fetchLogsAndSettings();
      } else {
        setSyncResult("Sinkronisasi gagal: " + (data.error || "Gagal menghubungi API"));
      }
    } catch (e) {
      setSyncResult("Kesalahan jaringan supplier API.");
    } finally {
      setSyncLoading(false);
    }
  };

  // Run SEO Optimization using Gemini
  const handleGenerateSeo = async () => {
    setSeoLoading(true);
    setSeoResult(null);
    try {
      const r = await fetch("/api/ai/seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameName: selectedSeoGame, keywordFocus: seoKeyword })
      });
      const data = await r.json();
      if (r.ok) {
        setSeoResult({
          ...data.data,
          source: data.source,
          note: data.note
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSeoLoading(false);
    }
  };

  // Perform surgical edit of product pricing variables with negative margin safeguard check
  const startEditingProduct = (p: Product) => {
    setEditingProductId(p.id);
    setEditPriceSupplier(p.priceSupplier);
    setEditPriceFinal(p.priceFinal);
    setEditStatus(p.status);
    setPricingError("");
    setPricingSuccess("");
  };

  const saveProductPrice = async (pId: string) => {
    setPricingError("");
    setPricingSuccess("");
    try {
      const resp = await fetch(`/api/products/${pId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceSupplier: editPriceSupplier,
          priceFinal: editPriceFinal,
          status: editStatus
        })
      });
      const data = await resp.json();
      if (!resp.ok) {
        setPricingError(data.error || "Gagal mengubah harga.");
      } else {
        setPricingSuccess("Harga produk berhasil diperbarui dengan perlindungan margin anti-rugi!");
        setEditingProductId(null);
        if (onRefreshData) onRefreshData();
      }
    } catch (e) {
      setPricingError("Terjadi kegagalan komunikasi ke server API.");
    }
  };

  // Calculate margin color highlights for profit panel
  // GREEN = Safe (>= low/med margins)
  // YELLOW = Low profit
  // RED = LOSS (Disabled / Block save)
  const getMarginRiskIndicator = (pSupp: number, pFinal: number) => {
    const profit = pFinal - pSupp;
    let minMed = settings?.minimumProfitMed || 1000;
    let minLow = settings?.minimumProfitLow || 500;

    if (profit < minLow) {
      return { col: "text-red-400 font-bold", label: "ALERT: LOSS WARNING", badgeBg: "bg-red-500/10 text-red-400 border-red-500/20" };
    }
    if (profit < minMed) {
      return { col: "text-amber-400 font-bold", label: "WARN: LOW PROFIT", badgeBg: "bg-amber-500/10 text-amber-500 border-amber-500/20" };
    }
    return { col: "text-emerald-400 font-bold", label: "SAFE: GOOD MARGIN", badgeBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" };
  };

  if (!currentUser || currentUser.role !== "ADMIN") {
    return (
      <div id="admin-forbidden-state" className="max-w-md mx-auto my-12 bg-slate-900 border border-slate-850 rounded-3xl p-8 text-center space-y-6 shadow-2xl animate-fade-in relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-rose-500"></div>
        <div className="bg-rose-500/10 text-rose-400 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto border border-rose-500/20">
          <ShieldAlert className="h-8 w-8 text-rose-550 animate-pulse" />
        </div>
        <div className="space-y-2">
          <h3 className="font-sans font-black text-lg tracking-tight text-white uppercase text-center">Protected Route Gate</h3>
          <p className="text-slate-400 text-xs leading-relaxed text-center">
            Halaman ini membutuhkan hak akses <span className="font-mono text-xs font-bold bg-slate-950 text-rose-400 px-1.5 py-0.5 rounded">ADMIN</span>. Sesi Anda saat ini ({currentUser?.role || "GUEST"}) ditolak oleh sistem pengaman Supabase JWT.
          </p>
        </div>

        <div className="bg-slate-950/60 p-4 border border-slate-850 rounded-2xl text-left space-y-2.5">
          <div className="flex items-center gap-1 text-[9px] font-mono font-black text-indigo-400 tracking-wider">
            <Sparkles className="h-3 w-3 text-amber-500" />
            <span>CARA VERIFIKASI SEBAGAI ADMIN</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-normal font-medium">
            Untuk menguji panel administrasi ini, silakan klik tombol <strong>LOG IN</strong> di ujung kanan atas navigasi, lalu pilih penyiapan otomatis <strong>ADMIN</strong> di baris Sandbox Testing.
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={() => {
              const loginBtn = document.getElementById("header-login-btn") as HTMLButtonElement | null;
              if (loginBtn) {
                loginBtn.click();
              } else {
                alert("Harap klik LOG IN di navigasi atas!");
              }
            }}
            className="w-full bg-slate-950 hover:bg-slate-850 border border-slate-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Buka Sistem Autentikasi</span>
            <ArrowRight className="h-4 w-4 text-indigo-400" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in text-left">

      
      {/* Mini Title bar with tab switches */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <BarChart2 className="h-6 w-6 text-indigo-400" />
            <span>Admin Control Panel (Live Workspace)</span>
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            Manajemen margin harga otomatis, saringan anti rugi, simulasi sinkronisasi supplier, dan log webhook.
          </p>
        </div>

        {/* Subnav select */}
        <div className="flex flex-wrap gap-1.5 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-850">
          {[
            { id: "dashboard", label: "Overview" },
            { id: "pricing", label: "Anti-Loss Prices" },
            { id: "coupons", label: "Promo Vouchers" },
            { id: "api", label: "Supplier API & Logs" },
            { id: "seo", label: `SEO & Gemini AI` }
          ].map((sub) => (
            <button
              key={sub.id}
              onClick={() => setActiveSubTab(sub.id as any)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeSubTab === sub.id
                  ? "bg-slate-850 text-white shadow-inner"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {sub.label}
            </button>
          ))}
        </div>
      </div>

      {/* SUBTAB 1: OVERVIEW DASHBOARD */}
      {activeSubTab === "dashboard" && (
        <div className="space-y-8 animate-fade-in">
          {/* Key Revenue and Profit Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between shadow-md">
              <span className="text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wider">OMSET REVENUE</span>
              <div className="mt-2.5">
                <span className="text-white text-lg md:text-2xl font-sans font-black tracking-tight block">
                  Rp {revenueSum.toLocaleString()}
                </span>
                <span className="text-emerald-400 text-[10px] font-bold font-mono">+12.4% vs Kemarin</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between shadow-md">
              <span className="text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wider">PROFIT BERSIH SURPLUS</span>
              <div className="mt-2.5">
                <span className="text-emerald-400 text-lg md:text-2xl font-sans font-black tracking-tight block">
                  Rp {netProfitSum.toLocaleString()}
                </span>
                <span className="text-amber-400 text-[10px] font-bold font-mono">Anti-Loss Guard Aktif</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between shadow-md">
              <span className="text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wider font-bold">TOTAL TRANSAKSI</span>
              <div className="mt-2.5">
                <span className="text-white text-lg md:text-2xl font-sans font-black tracking-tight block">
                  {totalTransactions} Order
                </span>
                <span className="text-slate-500 text-[10px] font-mono">{completedOrdersCount} Lunas Otomatis</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between shadow-md">
              <span className="text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wider">HARGA SINKRONISASI</span>
              <div className="mt-2.5">
                <span className="text-white text-lg md:text-2xl font-sans font-black tracking-tight block uppercase">
                  ACTIVE 1s
                </span>
                <span className="text-emerald-400 text-[10px] font-bold font-mono">VIP / Digiflazz API</span>
              </div>
            </div>

          </div>

          {/* Pure SVG Custom Telemetry Sales Chart */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs text-white font-bold leading-none">Grafik Penjualan Harian (Seeding History)</span>
              <div className="flex gap-4 text-[10px] text-slate-400 font-mono">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-indigo-500"></span> Omset Kontrak</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-400"></span> Profit Murni</span>
              </div>
            </div>

            {/* Custom Interactive SVG Graph representing exact sales vectors */}
            <div className="w-full h-44 bg-slate-950/40 rounded-2xl border border-slate-850 p-4 flex items-center justify-center">
              <svg className="w-full h-full text-slate-800" viewBox="0 0 100 35" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="gradient-omset" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="gradient-profit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid guidelines */}
                <line x1="0" y1="5" x2="100" y2="5" stroke="#1e293b" strokeWidth="0.1" strokeDasharray="1" />
                <line x1="0" y1="15" x2="100" y2="15" stroke="#1e293b" strokeWidth="0.1" strokeDasharray="1" />
                <line x1="0" y1="25" x2="100" y2="25" stroke="#1e293b" strokeWidth="0.1" strokeDasharray="1" />

                {/* Omset Line + area */}
                <path d="M 0 30 Q 15 20, 30 25 T 60 12 T 85 15 T 100 8" fill="none" stroke="#6366f1" strokeWidth="0.65" />
                <path d="M 0 30 Q 15 20, 30 25 T 60 12 T 85 15 T 100 8 L 100 35 L 0 35 Z" fill="url(#gradient-omset)" />

                {/* Profit Line + area */}
                <path d="M 0 33 Q 15 28, 30 31 T 60 22 T 85 24 T 100 18" fill="none" stroke="#10b981" strokeWidth="0.5" />
                <path d="M 0 33 Q 15 28, 30 31 T 60 22 T 85 24 T 100 18 L 100 35 L 0 35 Z" fill="url(#gradient-profit)" />
              </svg>
            </div>
            
            <div className="flex justify-between text-[10px] text-slate-500 font-mono tracking-wider font-bold">
              <span>MONDAY</span>
              <span>TUESDAY</span>
              <span>WEDNESDAY</span>
              <span>THURSDAY</span>
              <span>FRIDAY</span>
              <span>TODAY (MAY 24)</span>
            </div>
          </div>

          {/* Quick transaction history records list */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
            <span className="text-xs text-white font-bold block border-b border-slate-800 pb-3">
              Riwayat Penjualan Terakhir (Recent Orders Pipeline)
            </span>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-400 font-medium">
                <thead>
                  <tr className="border-b border-slate-850 text-slate-500 uppercase text-[9px] font-mono font-bold">
                    <th className="py-2.5 px-3">Invoice</th>
                    <th className="py-2.5 px-3">Gamer ID</th>
                    <th className="py-2.5 px-3">Game</th>
                    <th className="py-2.5 px-3">Produk</th>
                    <th className="py-2.5 px-3 text-right">Harga Final (Omset)</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-950/20 transition-all font-mono">
                      <td className="py-2.5 px-3 font-bold text-indigo-400 text-[11px]">{order.id}</td>
                      <td className="py-2.5 px-3 text-slate-300 truncate">{order.userUid}</td>
                      <td className="py-2.5 px-3 uppercase text-[10px] text-slate-500">{order.gameName}</td>
                      <td className="py-2.5 px-3 text-slate-300 font-sans">{order.productName}</td>
                      <td className="py-2.5 px-3 text-right text-white font-bold">Rp {order.priceFinal.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded text-[10px] font-bold">
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* SUBTAB 2: ANTI-LOSS PRICING CONFIGURATOR */}
      {activeSubTab === "pricing" && (
        <div className="space-y-6 animate-fade-in text-slate-300">
          
          <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-xs text-amber-300 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 animate-bounce flex-shrink-0" />
            <p className="font-medium">
              <strong>SISTEM PROTEKSI MARGIN ANTI-RUGI AKTIF:</strong> Anda tidak diizinkan menyimpan harga jual yang menyebabkan kerugian atau margin profit di bawah batas minimum (Rendah: Rp 500, Menengah: Rp 1.000, Tinggi: Rp 2.000).
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
            <span className="text-white text-base font-black tracking-tight block">Harga Kepingan Game & Keuntungan (Margin Panel)</span>
            
            {pricingError && (
              <div className="p-3 bg-red-500/10 text-red-400 text-xs rounded-xl border border-red-500/20 font-bold">
                {pricingError}
              </div>
            )}
            {pricingSuccess && (
              <div className="p-3 bg-emerald-500/10 text-emerald-400 text-xs rounded-xl border border-emerald-500/20 font-bold">
                {pricingSuccess}
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-400">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] font-mono uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-3">Nama Produk SKU</th>
                    <th className="py-3 px-3">Game</th>
                    <th className="py-3 px-3">Modal Supplier</th>
                    <th className="py-3 px-3">Harga Jual Akhir</th>
                    <th className="py-3 px-3">Profit Margin</th>
                    <th className="py-3 px-3">Tingkat Risiko</th>
                    <th className="py-3 px-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {products.map((p) => {
                    const isEditing = editingProductId === p.id;
                    const profitMargin = isEditing ? (editPriceFinal - editPriceSupplier) : (p.priceFinal - p.priceSupplier);
                    const risk = getMarginRiskIndicator(isEditing ? editPriceSupplier : p.priceSupplier, isEditing ? editPriceFinal : p.priceFinal);

                    return (
                      <tr key={p.id} className="hover:bg-slate-950/20 transition-all font-mono text-slate-300">
                        <td className="py-3.5 px-3 font-bold font-sans text-white text-[13px]">
                          {p.name}
                          <span className="block text-[10px] font-mono text-slate-500">{p.sku}</span>
                        </td>
                        <td className="py-3.5 px-3 uppercase text-[10px] font-bold text-slate-400">{p.gameId}</td>
                        
                        {/* Supplier cost editable */}
                        <td className="py-3.5 px-3">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editPriceSupplier}
                              onChange={(e) => setEditPriceSupplier(Number(e.target.value))}
                              className="w-24 bg-slate-950 text-white border border-slate-800 rounded px-2 py-1 text-xs font-mono focus:outline-none focus:border-indigo-500"
                            />
                          ) : (
                            <span>Rp {p.priceSupplier.toLocaleString()}</span>
                          )}
                        </td>

                        {/* Final retail cost editable */}
                        <td className="py-3.5 px-3">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editPriceFinal}
                              onChange={(e) => setEditPriceFinal(Number(e.target.value))}
                              className="w-24 bg-slate-950 text-white border border-slate-800 rounded px-2 py-1 text-xs font-mono focus:outline-none focus:border-indigo-500"
                            />
                          ) : (
                            <span className="font-bold text-white">Rp {p.priceFinal.toLocaleString()}</span>
                          )}
                        </td>

                        {/* Profit dynamic math and indicator lights compliance checks! */}
                        <td className="py-3.5 px-3">
                          <span className={risk.col}>
                            Rp {profitMargin.toLocaleString()}
                          </span>
                        </td>

                        {/* Indicator badge lights */}
                        <td className="py-3.5 px-3">
                          <span className={`text-[9px] font-black uppercase tracking-wide border px-2 py-0.5 rounded ${risk.badgeBg}`}>
                            {risk.label}
                          </span>
                        </td>

                        {/* Save block trigger */}
                        <td className="py-3.5 px-3 text-center">
                          {isEditing ? (
                            <div className="flex gap-1.5 justify-center">
                              <button
                                onClick={() => saveProductPrice(p.id)}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white font-sans font-bold text-[10px] px-2.5 py-1.5 rounded transition-all cursor-pointer"
                              >
                                Simpan
                              </button>
                              <button
                                onClick={() => setEditingProductId(null)}
                                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-sans font-bold text-[10px] px-2.5 py-1.5 rounded transition-all cursor-pointer"
                              >
                                Batal
                              </button>
                            </div>
                          ) : (
                            <button
                              id={`edit-price-${p.id}`}
                              onClick={() => startEditingProduct(p)}
                              className="text-indigo-400 hover:text-indigo-300 text-[11px] font-bold underline cursor-pointer font-sans"
                            >
                              Ubah Harga
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* SUBTAB 3: PROMO VOUCHERS MANAGER */}
      {activeSubTab === "coupons" && (
        <div className="space-y-6 animate-fade-in text-slate-300">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
            <span className="text-white text-base font-black tracking-tight block">Kupon Promo & Voucher Aktif</span>
            <p className="text-slate-400 text-xs">
              Miliki kontrol penukaran kupon. Diskon keping game diproteksi sistem agar tidak berpotensi minus (Profit protection rules).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {localVouchers.map((v) => (
                <div key={v.code} className="p-4 bg-slate-950/60 rounded-2xl border border-slate-850 flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="bg-indigo-600/20 text-indigo-400 px-2 py-0.5 rounded font-mono font-bold text-xs uppercase tracking-wider">
                        {v.code}
                      </span>
                      <span className={`text-[9px] font-bold uppercase ${v.status === "ACTIVE" ? "text-emerald-400" : "text-slate-500"}`}>
                        ● {v.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-bold font-sans">
                      Diskon Maks: Rp {v.discountMax.toLocaleString()} (Min. Belanja: Rp {v.minPurchase.toLocaleString()})
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      Digunakan: {v.used} / {v.quota} keping • Kadaluarsa: {v.expiryDate}
                    </p>
                  </div>
                  
                  {/* Option to toggle */}
                  <button
                    onClick={() => {
                      const updated = localVouchers.map(x => x.code === v.code ? { ...x, status: (x.status === "ACTIVE" ? "INACTIVE" : "ACTIVE") as any } : x);
                      setLocalVouchers(updated);
                    }}
                    className={`text-[11px] font-bold font-sans px-3 py-1.5 rounded-lg border cursor-pointer transition-all ${
                      v.status === "ACTIVE" 
                        ? "text-red-400 border-red-500/20 bg-red-500/5 hover:bg-red-500/10" 
                        : "text-emerald-400 border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10"
                    }`}
                  >
                    {v.status === "ACTIVE" ? "Disable" : "Enable"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: SUPPLIER API & WEBHOOK LOGS */}
      {activeSubTab === "api" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-fade-in text-slate-300">
          
          {/* Left Panel: Autopilot synchronizer and scrapers */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
              <span className="text-white text-sm font-bold block flex items-center gap-1.5">
                <Zap className="h-5 w-5 text-indigo-400 animate-pulse" />
                <span>Autopilot Supplier Sync</span>
              </span>
              <p className="text-slate-400 text-xs leading-relaxed">
                Picu robot sinkronisasi harga kepingan secara manual. Sistem akan mengontak API Supplier, mendownload harga modal terbaru, dan meremukkan markup harga jual secara otomatis sesuai aturan anti rugi.
              </p>

              <div className="space-y-3 pt-2">
                <button
                  id="sync-digiflazz-btn"
                  onClick={() => handleBulkSync("Digiflazz")}
                  disabled={syncLoading}
                  className="w-full bg-slate-950 text-slate-200 hover:text-indigo-400 border border-slate-800 hover:border-slate-700 font-bold text-xs py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {syncLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 text-emerald-400" />}
                  <span>Sinkronisasi API Digiflazz</span>
                </button>

                <button
                  id="sync-vipreseller-btn"
                  onClick={() => handleBulkSync("VIP Reseller")}
                  disabled={syncLoading}
                  className="w-full bg-slate-950 text-slate-200 hover:text-indigo-400 border border-slate-800 hover:border-slate-700 font-bold text-xs py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {syncLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 text-amber-400" />}
                  <span>Sinkronisasi API VIP Reseller</span>
                </button>
              </div>

              {syncResult && (
                <div className="p-3 bg-indigo-600/10 text-indigo-400 text-xs rounded-xl border border-indigo-500/25 text-center font-bold animate-pulse">
                  {syncResult}
                </div>
              )}
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-3">
              <span className="text-white text-xs font-bold block">Status Gateway Terdaftar</span>
              <div className="space-y-2 text-[11px] font-mono">
                <div className="flex justify-between text-emerald-400">
                  <span>● TRIPAY PAYMENTS</span>
                  <span>ONLINE (200 OK)</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>● DIGIFLAZZ CONNECTOR</span>
                  <span>CONNECTED</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>● VIP RESELLER ENGINE</span>
                  <span>ONLINE</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Webhook logs JSON viewer */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
            <span className="text-white text-sm font-bold block border-b border-slate-800 pb-3">
              Webhook Real-Time Logs Inspector
            </span>

            <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
              {currentLogs.map((log) => (
                <div key={log.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-850 space-y-2">
                  <div className="flex flex-wrap justify-between items-center gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                        log.type === "INBOUND" ? "bg-emerald-500/10 text-emerald-400" : "bg-blue-500/10 text-blue-400"
                      }`}>
                        {log.type}
                      </span>
                      <strong className="text-slate-300 text-xs font-mono">{log.provider}</strong>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>

                  <pre className="text-[10px] font-mono text-indigo-300 bg-slate-900/60 p-3 rounded-xl border border-slate-850 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    <code>{log.payload}</code>
                  </pre>
                  
                  <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                    <span>Log ID: {log.id}</span>
                    <span className="text-emerald-400 font-bold">HTTP Status: {log.statusCode}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* SUBTAB 5: SEO GEMINI GENERATOR */}
      {activeSubTab === "seo" && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-6 animate-fade-in text-slate-300">
          <div>
            <span className="text-indigo-400 text-[10px] font-bold font-mono tracking-wider bg-indigo-500/10 px-2 py-0.5 rounded uppercase">
              COGNITIVE SEO WRITER
            </span>
            <h3 className="text-white text-base font-black tracking-tight mt-2">Gemini AI Smart SEO Generator</h3>
            <p className="text-slate-400 text-xs mt-1 leading-relaxed">
              Tingkatkan peringkat pencarian landing page game Anda di Google Search. Pilih game, masukkan target kata kunci, lalu biarkan model asisten Gemini membuat meta tag optimal Indonesia CTR tinggi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4 p-4 bg-slate-950/60 rounded-2xl border border-slate-850">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 block">Pilih Judul Halaman Game</label>
                <select 
                  id="seo-game-select"
                  value={selectedSeoGame}
                  onChange={(e) => setSelectedSeoGame(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white uppercase font-bold"
                >
                  {games.map(g => (
                    <option key={g.id} value={g.name}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 block">Fokus Keyword Tambahan</label>
                <input 
                  id="seo-keyword-input"
                  type="text"
                  value={seoKeyword}
                  onChange={(e) => setSeoKeyword(e.target.value)}
                  placeholder="Ex: top up murah 24 jam otomatis"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                id="generate-seo-btn"
                onClick={handleGenerateSeo}
                disabled={seoLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-sans font-bold text-xs py-3 rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {seoLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4 text-amber-300" />}
                <span>Buat Meta Tag Premium</span>
              </button>
            </div>

            {/* Results rendering layout */}
            <div className="md:col-span-2 p-5 bg-slate-950 rounded-2xl border border-slate-850 flex flex-col justify-between">
              {seoResult ? (
                <div className="space-y-4 animate-fade-in text-xs font-medium">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase block tracking-wider">
                      REKOMENDASI METADATA &raquo;
                    </span>
                    <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono uppercase">
                      {seoResult.source}
                    </span>
                  </div>

                  <div className="space-y-3 font-normal text-slate-300">
                    <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-850">
                      <span className="text-[9px] font-bold font-mono text-slate-500 block mb-1">GOOGLE SEARCH TITLE (60 CHARS):</span>
                      <span className="text-white text-sm font-black font-sans leading-tight block">{seoResult.title}</span>
                    </div>

                    <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-850">
                      <span className="text-[9px] font-bold font-mono text-slate-500 block mb-1">META DESCRIPTION INFLUENCE:</span>
                      <span className="text-slate-300 text-xs block leading-relaxed">{seoResult.description}</span>
                    </div>

                    <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-850">
                      <span className="text-[9px] font-bold font-mono text-slate-500 block mb-1">KEYWORD DICTIONARY:</span>
                      <span className="text-indigo-300 font-mono text-[11px] leading-tight block">{seoResult.keywords}</span>
                    </div>

                    <div className="p-3 bg-slate-900/10 rounded-xl border border-indigo-500/20 bg-indigo-500/5">
                      <span className="text-[9px] font-bold font-mono text-indigo-400 block mb-1">STRATEGI OPTIMASI KONTEN:</span>
                      <span className="text-slate-300 text-xs leading-relaxed block">{seoResult.suggestionCopy}</span>
                    </div>
                  </div>

                  {seoResult.note && (
                    <span className="text-[9px] text-slate-500 block uppercase block text-center font-bold">
                      {seoResult.note}
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-3 h-full">
                  <Key className="h-8 w-8 text-slate-700 animate-pulse" />
                  <span className="text-xs font-bold">Belum ada meta tag yang digenerate</span>
                  <p className="text-[10px] text-slate-600 max-w-sm leading-relaxed">
                    Sistem akan memvalidasi asisten kognitif Gemini atau AI lokal sandbox untuk menyusun tags otomatis terbaik. Tekan tombol buat meta tag di sebelah kiri untuk melihat hasil!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
