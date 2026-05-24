import React, { useState, useEffect } from "react";
import { Sparkles, Timer, Zap, ArrowRight, ShieldCheck, Flame, Cpu } from "lucide-react";
import { Product } from "../types";

interface HeroBannerProps {
  products: Product[];
  onSelectProduct: (gameId: string, productId: string) => void;
}

export default function HeroBanner({ products, onSelectProduct }: HeroBannerProps) {
  const flashProducts = products.filter(p => p.isFlashSale && p.status === "ACTIVE").slice(0, 2);
  const [timeLeft, setTimeLeft] = useState({ hours: 5, minutes: 43, seconds: 12 });

  useEffect(() => {
    // Simulated live flash sale countdown timer
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { hours: prev.hours, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 12, minutes: 0, seconds: 0 }; // reset
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative mb-12">
      {/* Decorative dynamic ambient glow spots */}
      <div className="absolute top-0 left-1/4 w-80 h-80 bg-indigo-600/10 blur-3xl rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none"></div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        
        {/* Main Branding glassmorphism card */}
        <div className="lg:col-span-2 relative bg-gradient-to-r from-indigo-900 via-slate-900 to-violet-900 border border-indigo-500/30 p-6 md:p-8 rounded-3xl shadow-2xl shadow-indigo-500/10 overflow-hidden flex flex-col justify-between group">
          <div className="absolute top-0 right-0 p-8 opacity-15 pointer-events-none">
            <Cpu className="h-44 w-44 text-indigo-400 rotate-12 transition-transform duration-700 group-hover:rotate-45" />
          </div>

          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] sm:text-[11px] font-mono tracking-widest font-bold uppercase">
              <Sparkles className="h-3 w-3 animate-pulse text-amber-400" />
              <span>Bootstrap TopUp - Modal Rp0 Premium</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-sans font-black tracking-tight text-white leading-tight">
              Platform Top Up Game <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500">
                Instan & Otomatis 24 Jam
              </span>
            </h1>

            <p className="max-w-xl text-slate-300 text-xs sm:text-sm leading-relaxed font-normal">
              Solusi digital store modern berkecepatan kilat. Harga selalu tersinkronisasi otomatis, transaksi diproses langsung menggunakan API Supplier terkemuka dengan margin optimal.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <span>Aman 100% Bergaransi</span>
            </div>
            <div className="h-4 w-px bg-slate-800 hidden md:block"></div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Zap className="h-5 w-5 text-amber-400 animate-bounce" />
              <span>Pengiriman Otomatis 1 Detik</span>
            </div>
            <div className="h-4 w-px bg-slate-800 hidden md:block"></div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Flame className="h-5 w-5 text-orange-400" />
              <span>Integrasi Digiflazz & VIP Reseller</span>
            </div>
          </div>
        </div>

        {/* Flash Sale Card Panel (Mobile-First, Responsive) */}
        <div id="flash-sale-panel" className="relative bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col justify-between overflow-hidden">
          {/* Header */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-red-500 p-1.5 rounded-lg text-white font-bold animate-pulse">
                  <Zap className="h-5 w-5" />
                </div>
                <span className="text-white text-sm font-bold tracking-tight">KILAT FLASH SALE</span>
              </div>
              
              {/* Timer */}
              <div className="flex items-center gap-1 bg-slate-950/40 text-[11px] font-mono text-amber-400 border border-amber-500/20 px-2 py-1 rounded-lg">
                <Timer className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                <span>
                  {String(timeLeft.hours).padStart(2, "0")}:
                  {String(timeLeft.minutes).padStart(2, "0")}:
                  {String(timeLeft.seconds).padStart(2, "0")}
                </span>
              </div>
            </div>

            <p className="text-slate-400 text-[11px] font-medium leading-relaxed mb-4">
              Dapatkan diamond dan pass dengan harga terendah, promo margin terbatas, dijamin aman legal!
            </p>

            {/* List Flash Sale Products */}
            <div className="space-y-3">
              {flashProducts.length > 0 ? (
                flashProducts.map((prod) => {
                  const discountPercent = prod.originalPrice 
                    ? Math.round(((prod.originalPrice - prod.priceFinal) / prod.originalPrice) * 100) 
                    : 15;

                  const stockProgress = prod.id === "ml-weekly" ? 78 : 45; // simulated robust stock info

                  return (
                    <div 
                      key={prod.id} 
                      className="p-3 bg-slate-950/60 hover:bg-slate-950 rounded-xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between gap-2.5 group cursor-pointer"
                      onClick={() => onSelectProduct(prod.gameId, prod.id)}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          {/* Title & Game tag */}
                          <div className="text-slate-300 font-bold text-xs group-hover:text-indigo-300 transition-colors">
                            {prod.name}
                          </div>
                          <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500">
                            {prod.gameId === "mlbb" ? "Mobile Legends" : "Genshin Impact"}
                          </span>
                        </div>
                        
                        {/* Percent Tag */}
                        <span className="bg-red-500/10 text-red-400 text-[9px] font-bold px-1.5 py-0.5 rounded border border-red-500/20">
                          -{discountPercent}% OFF
                        </span>
                      </div>

                      {/* Price and Action Row */}
                      <div className="flex justify-between items-end mt-1">
                        <div>
                          <span className="text-[10px] text-slate-500 line-through block leading-none mb-0.5">
                            Rp {prod.originalPrice?.toLocaleString()}
                          </span>
                          <span className="text-white text-xs font-black tracking-tight leading-none">
                            Rp {prod.priceFinal.toLocaleString()}
                          </span>
                        </div>
                        <span className="bg-indigo-600 text-white p-1 rounded-lg group-hover:bg-indigo-500 transition-all">
                          <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </div>

                      {/* Stock Bar */}
                      <div className="space-y-1 mt-1">
                        <div className="flex justify-between text-[8px] text-slate-500 font-medium font-mono">
                          <span>TERJUAL: {stockProgress}%</span>
                          <span>SISA: {100 - stockProgress} SLOT</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-red-500 to-amber-500 h-full rounded-full transition-all duration-1000"
                            style={{ width: `${stockProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                Array.from({ length: 2 }).map((_, idx) => (
                  <div key={idx} className="p-3 bg-slate-950/40 rounded-xl border border-slate-850/50 animate-pulse flex flex-col gap-2 h-24">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1 flex-grow">
                        <div className="bg-slate-800 h-3.5 rounded w-2/3"></div>
                        <div className="bg-slate-800 h-2 rounded w-1/3"></div>
                      </div>
                      <div className="bg-slate-800 h-4 rounded w-10"></div>
                    </div>
                    <div className="flex justify-between items-end mt-1">
                      <div className="space-y-1 flex-grow">
                        <div className="bg-slate-800 h-2.5 rounded w-1/4"></div>
                        <div className="bg-slate-800 h-3.5 rounded w-16"></div>
                      </div>
                      <div className="bg-slate-800 h-5 w-5 rounded-md"></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="border-t border-slate-800 mt-4 pt-3 text-center">
            <span className="text-[10px] text-slate-500 font-bold tracking-tight">PROTEKSI ANTI-RUGI AKTIF • HARGA RESMI SUPPLIER</span>
          </div>

        </div>

      </div>
    </div>
  );
}
