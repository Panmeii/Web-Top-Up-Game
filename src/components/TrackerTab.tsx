import React, { useState, useEffect } from "react";
import { Search, FileText, CheckCircle2, RotateCw, AlertTriangle, Printer, Sparkles, Server, Zap, Compass, HelpCircle } from "lucide-react";
import { Order, OrderStatus } from "../types";

interface TrackerTabProps {
  initialSearchId?: string;
  onRefreshOrders?: () => void;
}

export default function TrackerTab({ initialSearchId, onRefreshOrders }: TrackerTabProps) {
  const [searchId, setSearchId] = useState(initialSearchId || "");
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [latestOrders, setLatestOrders] = useState<Order[]>([]);

  // Simulation state
  const [simulationLoading, setSimulationLoading] = useState(false);
  const [simulationSuccess, setSimulationSuccess] = useState("");

  const fetchOrderById = async (id: string) => {
    if (!id.trim()) return;
    setLoading(true);
    setErrorMsg("");
    try {
      const r = await fetch(`/api/orders/${id.trim()}`);
      const data = await r.json();
      if (!r.ok) {
        setErrorMsg(data.error || "Invoice tidak ditemukan. Pastikan format penulisan benar.");
        setFoundOrder(null);
      } else {
        setFoundOrder(data);
      }
    } catch (e) {
      setErrorMsg("Koneksi gagal saat menghubungi server.");
    } finally {
      setLoading(false);
    }
  };

  const fetchLatestOrders = async () => {
    try {
      const r = await fetch("/api/orders");
      const data = await r.json();
      if (r.ok) {
        setLatestOrders(data.slice(0, 5));
      }
    } catch (e) {
      console.error("Gagal memuat daftar pesanan terbaru.");
    }
  };

  useEffect(() => {
    fetchLatestOrders();
    if (initialSearchId) {
      setSearchId(initialSearchId);
      fetchOrderById(initialSearchId);
    }
  }, [initialSearchId]);

  const handleSimulatePayment = async () => {
    if (!foundOrder) return;
    setSimulationLoading(true);
    setSimulationSuccess("");
    try {
      const r = await fetch(`/api/orders/${foundOrder.id}/webhook-pay`, {
        method: "POST"
      });
      const data = await r.json();
      if (!r.ok) {
        setErrorMsg(data.error || "Gagal menyimulasikan webhook pembayaran.");
      } else {
        setSimulationSuccess("LUNAS! Webhook Tripay diterima. Memproses pesanan otomatis ke Supplier...");
        // Fast polling loop to show automatic status updates of PAID -> SUCCESS
        let pollCount = 0;
        const pollInterval = setInterval(async () => {
          pollCount++;
          await fetchOrderById(foundOrder.id);
          if (pollCount >= 4) {
            clearInterval(pollInterval);
            if (onRefreshOrders) onRefreshOrders();
            fetchLatestOrders();
          }
        }, 1500);
      }
    } catch (e) {
      setErrorMsg("Gagal melakukan panggilan simulasi.");
    } finally {
      setSimulationLoading(false);
    }
  };

  // Status mapping
  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400" };
      case OrderStatus.PAID:
        return { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400" };
      case OrderStatus.PROCESSING:
        return { bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-400" };
      case OrderStatus.SUCCESS:
        return { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400" };
      case OrderStatus.FAILED:
        return { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400" };
      default:
        return { bg: "bg-slate-500/10", border: "border-slate-500/30", text: "text-slate-400" };
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      
      {/* Top Search bar card */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
        <div className="flex gap-2.5 items-center">
          <FileText className="h-5 w-5 text-indigo-400 animate-bounce" />
          <h3 className="text-white text-base font-bold font-sans">Lacak & Verifikasi Pesanan Otomatis</h3>
        </div>
        <p className="text-slate-400 text-xs">
          Masukkan Nomor Invoice Anda (Contoh: <code className="text-amber-400 font-mono">INV-20260524-10022</code>) untuk memeriksa riwayat transaksi, tahapan integrasi supplier, dan status pengiriman.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              id="tracker-invoice-input"
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Ex: INV-20260524-10022"
              className="w-full bg-slate-950 text-slate-100 pl-9 pr-4 py-3 text-xs md:text-sm rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 placeholder:text-slate-600 font-mono font-bold"
            />
          </div>
          <button
            id="tracker-submit-btn"
            onClick={() => fetchOrderById(searchId)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs md:text-sm font-bold px-6 py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/10"
          >
            {loading ? <RotateCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            <span>Lacak Order</span>
          </button>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 text-red-400 text-xs p-3.5 rounded-xl border border-red-500/20 flex gap-2.5 items-center font-bold">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Main Details layout (only if an order is successfully tracked) */}
      {foundOrder ? (
        <div id="invoice-details-card" className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          
          {/* Left Column: Flow tracking & workflow logs */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Realtime Stepper visualization */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold text-indigo-400 font-mono bg-indigo-500/10 px-2 py-0.5 rounded">STATUS WORKFLOW</span>
                <span className="text-slate-500 text-[10px] font-mono">24 JAM KILAT INTEGRATOR</span>
              </div>

              {/* Progress Bar steps */}
              <div className="flex justify-between items-center relative max-w-md mx-auto py-2">
                {/* Background line */}
                <div className="absolute left-2 right-2 h-0.5 bg-slate-800 top-1/2 -translate-y-1/2 z-0"></div>
                
                {/* Step 1: PENDING */}
                <div className="z-10 flex flex-col items-center gap-1">
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    foundOrder.status !== OrderStatus.FAILED ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-500"
                  }`}>
                    1
                  </div>
                  <span className="text-[9px] text-slate-300 font-bold font-sans">Pending</span>
                </div>

                {/* Step 2: PAID */}
                <div className="z-10 flex flex-col items-center gap-1">
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    [OrderStatus.PAID, OrderStatus.PROCESSING, OrderStatus.SUCCESS].includes(foundOrder.status)
                      ? "bg-indigo-600 text-white animate-pulse" 
                      : "bg-slate-800 text-slate-500"
                  }`}>
                    2
                  </div>
                  <span className="text-[9px] text-slate-300 font-bold font-sans">Paid</span>
                </div>

                {/* Step 3: PROCESSING */}
                <div className="z-10 flex flex-col items-center gap-1">
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    [OrderStatus.PROCESSING, OrderStatus.SUCCESS].includes(foundOrder.status)
                      ? "bg-purple-600 text-white"
                      : "bg-slate-800 text-slate-500"
                  }`}>
                    3
                  </div>
                  <span className="text-[9px] text-slate-300 font-bold font-sans">Supplier</span>
                </div>

                {/* Step 4: SUCCESS */}
                <div className="z-10 flex flex-col items-center gap-1">
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    foundOrder.status === OrderStatus.SUCCESS
                      ? "bg-emerald-500 text-slate-950"
                      : "bg-slate-800 text-slate-500"
                  }`}>
                    {foundOrder.status === OrderStatus.SUCCESS ? "✓" : "4"}
                  </div>
                  <span className="text-[9px] text-slate-300 font-bold font-sans">Selesai</span>
                </div>
              </div>

              {/* Status banner */}
              {foundOrder.status === OrderStatus.PENDING && (
                <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 space-y-3.5">
                  <div className="flex gap-2.5 items-center">
                    <div className="h-2 w-2 rounded-full bg-amber-500 animate-ping"></div>
                    <span className="text-amber-400 text-xs font-bold">MENUNGGU PEMBAYARAN: QRIS / VA SEGERA DISELESAIKAN!</span>
                  </div>

                  {/* SIMULATE TRIGGER PORTAL inside the tracked receipt page! */}
                  <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-850 space-y-3">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-emerald-400 animate-pulse" />
                      <span className="text-white text-xs font-bold font-sans">Demo Sandbox Payment Simulator</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Lakukan simulasi pelunasan invoice gateway di sini. Sistem akan otomatis mengirimkan notifikasi Webhook Tripay, memicu verifikasi saldo anti-rugi, dan meneruskannya ke Supplier API.
                    </p>
                    <button
                      id="simulate-webhook-payment-btn"
                      onClick={handleSimulatePayment}
                      disabled={simulationLoading}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-bold text-xs py-3 rounded-xl cursor-pointer disabled:opacity-50 transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      {simulationLoading ? <RotateCw className="h-4 w-4 animate-spin" /> : "BAYAR INSTAN (SIMULASI WEBHOOK 200 OK)"}
                    </button>
                    {simulationSuccess && (
                      <p className="text-[10px] text-emerald-400 font-bold text-center mt-1 animate-pulse">{simulationSuccess}</p>
                    )}
                  </div>
                </div>
              )}

              {foundOrder.status === OrderStatus.SUCCESS && (
                <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex gap-3 items-center text-emerald-400 text-xs font-bold">
                  <CheckCircle2 className="h-5 w-5 animate-bounce flex-shrink-0" />
                  <span>TRANSAKSI SELESAI SUKSES! Saldo keping telah sukses ditransfer ke ID {foundOrder.userUid} {foundOrder.userServer ? `(${foundOrder.userServer})` : ""}. Terima kasih.</span>
                </div>
              )}
            </div>

            {/* Workflow logs audit trail */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3 justify-between">
                <div className="flex items-center gap-1.5">
                  <Server className="h-5 w-5 text-indigo-400" />
                  <span className="text-white text-xs font-bold">Log Otomatisasi Sistem (Audit Trail)</span>
                </div>
                <span className="text-[9px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded uppercase font-bold">Auto-Polling</span>
              </div>

              <div className="space-y-3">
                {foundOrder.log?.map((l, idx) => (
                  <div key={idx} className="flex gap-3 items-start text-xs text-slate-400 leading-relaxed">
                    <span className="h-5 w-5 rounded-full bg-slate-950 border border-slate-800 text-[10px] flex items-center justify-center font-mono font-bold text-indigo-400 flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="font-mono text-slate-300">{l}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Invoice printable card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl border-dashed-t p-6 space-y-5">
            <div className="border-b border-slate-800 pb-4 text-center">
              <div className="inline-flex bg-indigo-500/10 text-indigo-400 text-[10px] px-2 py-1 rounded font-bold font-mono uppercase tracking-wider mb-2">
                STRUK TRANSFER DIGITAL
              </div>
              <h4 className="text-white font-black text-sm font-sans">INVOICE PEMESANAN</h4>
              <span className="text-slate-500 text-[11px] font-mono leading-none">{foundOrder.id}</span>
            </div>

            <div className="space-y-3.5 text-xs text-slate-400 font-medium">
              <div className="flex justify-between">
                <span>Waktu Pembelian</span>
                <span className="text-slate-300 font-normal font-mono">{new Date(foundOrder.createdAt).toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between">
                <span>Nama Game</span>
                <span className="text-slate-200 font-bold">{foundOrder.gameName}</span>
              </div>
              <div className="flex justify-between">
                <span>Gamer ID</span>
                <span className="text-indigo-400 font-bold font-mono">
                  {foundOrder.userUid} {foundOrder.userServer ? `(${foundOrder.userServer})` : ""}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Paket Item</span>
                <span className="text-slate-200 font-bold">{foundOrder.productName}</span>
              </div>
              <div className="flex justify-between">
                <span>Metode Pembayaran</span>
                <span className="text-slate-200 font-bold">{foundOrder.paymentMethodName}</span>
              </div>
              <div className="flex justify-between">
                <span>Diproses Melalui</span>
                <span className="text-slate-400 font-mono font-bold">{foundOrder.supplierUsed} (Otomatis)</span>
              </div>

              <div className="h-px bg-slate-850 my-2"></div>

              <div className="flex justify-between text-slate-400">
                <span>Harga Dasar</span>
                <span className="text-white font-mono">Rp {foundOrder.priceBase.toLocaleString()}</span>
              </div>
              {foundOrder.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Voucher Diskon ({foundOrder.voucherApplied})</span>
                  <span className="font-mono">- Rp {foundOrder.discountAmount.toLocaleString()}</span>
                </div>
              )}
              
              <div className="h-px bg-slate-800 my-2"></div>

              <div className="flex justify-between text-slate-200 items-baseline pt-1">
                <span className="font-bold">TOTAL BAYAR</span>
                <span className="text-amber-400 font-black text-sm md:text-base tracking-tight font-mono">
                  Rp {foundOrder.priceFinal.toLocaleString()}
                </span>
              </div>

              <div className="pt-2">
                <div className={`p-2 rounded-xl text-center border font-bold text-[11px] tracking-wider uppercase ${
                  getStatusColor(foundOrder.status).bg
                } ${getStatusColor(foundOrder.status).border} ${getStatusColor(foundOrder.status).text}`}>
                  STATUS: {foundOrder.status}
                </div>
              </div>
            </div>

            {/* Print action button */}
            <div className="border-t border-slate-800 pt-4">
              <button
                onClick={handlePrint}
                className="w-full bg-slate-950 text-slate-200 hover:text-white border border-slate-800 hover:border-slate-700 font-bold text-xs py-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                <Printer className="h-4 w-4" />
                <span>Simpan PDF / Cetak Struk</span>
              </button>
            </div>
          </div>

        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-850 p-8 rounded-3xl text-center max-w-lg mx-auto space-y-4">
          <div className="h-10 w-10 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-500">
            <Compass className="h-6 w-6 animate-spin-hover" />
          </div>
          <h4 className="text-white font-bold text-sm">Belum ada invoice yang dipantau</h4>
          <p className="text-slate-400 text-xs leading-relaxed">
            Masukkan nomor invoice Anda di form pencarian di atas untuk melacak pesanan. Di bawah, pilih salah satu pesanan simulasi terbaru untuk dicoba:
          </p>

          <div className="space-y-2 mt-4 text-left">
            <span className="text-[9px] uppercase font-mono text-slate-500 block font-bold">PILIH PESANAN SIMULASI (DEMO FLOW):</span>
            
            {latestOrders.map((o) => (
              <div
                key={o.id}
                onClick={() => {
                  setSearchId(o.id);
                  fetchOrderById(o.id);
                }}
                className="p-3 bg-slate-950/60 rounded-xl border border-slate-850 hover:border-slate-800 flex justify-between items-center cursor-pointer hover:bg-slate-950 transition-all text-xs"
              >
                <div>
                  <span className="font-mono text-indigo-400 font-bold font-mono text-[11px] block">{o.id}</span>
                  <span className="text-slate-400 text-[10px]">{o.gameName} • {o.productName}</span>
                </div>
                <span className={`text-[10px] font-bold uppercase transition-colors ${
                  o.status === OrderStatus.SUCCESS ? "text-emerald-400" : "text-amber-400"
                }`}>
                  {o.status} &raquo;
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
