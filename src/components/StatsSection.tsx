import React from "react";
import { CheckCircle2, Users, Flame, Percent } from "lucide-react";

interface StatsSectionProps {
  ordersCount: number;
}

export default function StatsSection({ ordersCount }: StatsSectionProps) {
  return (
    <div className="mb-14 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl flex items-center gap-4 hover:border-slate-800 transition-all shadow-md">
        <div className="bg-indigo-600/10 p-3 rounded-xl text-indigo-400">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wide block">TRANSAKSI SUKSES</span>
          <span className="text-white text-base md:text-xl font-sans font-black tracking-tight block">
            {(4512 + ordersCount).toLocaleString()}
          </span>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl flex items-center gap-4 hover:border-slate-800 transition-all shadow-md">
        <div className="bg-emerald-600/10 p-3 rounded-xl text-emerald-400">
          <Users className="h-6 w-6" />
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wide block">AKUN REGISTERED</span>
          <span className="text-white text-base md:text-xl font-sans font-black tracking-tight block">
            1,284
          </span>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl flex items-center gap-4 hover:border-slate-800 transition-all shadow-md">
        <div className="bg-amber-600/10 p-3 rounded-xl text-amber-400">
          <Flame className="h-6 w-6 animate-pulse" />
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wide block">KEMUDAHAN API SYSTEM</span>
          <span className="text-white text-base md:text-xl font-sans font-black tracking-tight block">
            99.99% UP
          </span>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl flex items-center gap-4 hover:border-slate-800 transition-all shadow-md">
        <div className="bg-violet-600/10 p-3 rounded-xl text-violet-400">
          <Percent className="h-6 w-6" />
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wide block">MARGIN PRICING</span>
          <span className="text-white text-base md:text-xl font-sans font-black tracking-tight block">
            SAY ZERO LOSS
          </span>
        </div>
      </div>
    </div>
  );
}
