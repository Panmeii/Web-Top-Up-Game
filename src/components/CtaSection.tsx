import React from "react";
import { Sparkles, ArrowRight, Gamepad2, Gift } from "lucide-react";

interface CtaSectionProps {
  onJoinMember: () => void;
  onTrackOrder: () => void;
}

export default function CtaSection({ onJoinMember, onTrackOrder }: CtaSectionProps) {
  return (
    <section id="cta-conversion-banner" className="mt-16 text-left">
      <div className="relative bg-gradient-to-r from-indigo-900/40 via-purple-900/20 to-slate-950 border border-indigo-500/20 rounded-3xl p-6 sm:p-10 md:p-12 overflow-hidden shadow-2xl">
        {/* Dynamic backdrop glows */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/10 blur-3xl rounded-full pointer-events-none"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="lg:col-span-2 space-y-4">
            <span className="inline-flex items-center gap-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-mono font-bold tracking-widest uppercase px-3 py-1 rounded-full border border-indigo-500/20">
              <Gift className="h-3 w-3 text-amber-500" /> Promo & Cashback Member Aktif
            </span>
            <h3 className="text-2xl sm:text-3xl font-sans font-black tracking-tight text-white leading-tight">
              Dapatkan Margin Khusus & <br className="hidden sm:inline" />
              Diskon Melimpah Sebagai Member Regular!
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm max-w-xl leading-relaxed font-normal">
              Daftar akun gratis sekarang untuk menikmati harga reseller otomatis. Dapatkan jaminan harga top up game terendah yang keuntungannya diproteksi penuh oleh formula Safe Profits Rp0 Budget Startup!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3.5 w-full lg:w-auto">
            <button
              id="cta-join-member-btn"
              onClick={onJoinMember}
              className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-bold text-xs sm:text-sm py-3.5 px-6 rounded-2xl cursor-pointer transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2"
            >
              <Gamepad2 className="h-4.5 w-4.5 text-white" />
              <span>Daftar Member Sekarang</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              id="cta-track-order-btn"
              onClick={onTrackOrder}
              className="bg-slate-900/90 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 font-bold text-xs sm:text-sm py-3.5 px-6 rounded-2xl cursor-pointer transition-all duration-200 flex items-center justify-center gap-2"
            >
              <span>Lacak Transaksi</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
