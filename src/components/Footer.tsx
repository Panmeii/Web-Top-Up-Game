import React, { useState } from "react";
import { HelpCircle, ChevronDown, ChevronUp, ShieldCheck, Heart, Mail } from "lucide-react";

const FAQ_ITEMS = [
  {
    q: "Bagaimana cara kerja top up otomatis 24 jam di website ini?",
    a: "Sistem kami terhubung langsung ke API Supplier terkemuka seperti Digiflazz dan VIP Reseller secara real-time. Begitu pembayaran Anda diverifikasi oleh Payment Gateway (Tripay), server kami akan langsung mengirimkan instruksi pengisian kepingan game ke ID tujuan Anda dalam hitungan detik secara otomatis tanpa campur tangan admin."
  },
  {
    q: "Apa itu Sistem Proteksi Anti-Rugi (Anti-Loss Pricing Engine)?",
    a: "Ini adalah algoritma kecerdasan pengingat margin profit. Jika harga modal supplier naik atau jika admin salah memasukkan nominal diskon kupon yang bisa menyebabkan produk dijual rugi, sistem otomatisasi akan menolak menyimpan perubahan harga tersebut dan segera menghentikan potensi negative profit demi mengamankan cash flow bisnis Anda."
  },
  {
    q: "Apakah layanan ini bisa digunakan untuk usaha top up keping digital sendiri?",
    a: "Tentu saja! Codebase ini dirancang 'production-ready' untuk model bisnis startup bootstrapping bermodal awal Rp 0. Anda bisa menghubungkannya ke API supplier dan payment gateway milik Anda sendiri dengan mudah menggunakan setelan berkas konfigurasinya."
  },
  {
    q: "Metode pembayaran apa saja yang didukung?",
    a: "Kami mendukung pembayaran instant terlengkap: QRIS (yang menerima LinkAja, OVO, Dana, Shopee, dll), Virtual Account Bank besar (BCA, Mandiri, BNI, BRI), serta Transfer manual bersistem konfirmasi."
  }
];

export default function Footer() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <footer className="mt-20 border-t border-slate-850 bg-slate-950 pt-16 pb-12 text-slate-400 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* FAQ Section */}
        <div id="faq-section" className="shadow-lg bg-slate-900 border border-slate-850 rounded-3xl p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-indigo-400 animate-pulse" />
            <h3 className="text-white text-base md:text-lg font-black tracking-tight font-sans uppercase">PERTANYAAN UMUM (F.A.Q)</h3>
          </div>

          <div className="divide-y divide-slate-800">
            {FAQ_ITEMS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="py-4">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex justify-between items-center text-left text-xs sm:text-sm font-bold text-slate-200 hover:text-indigo-400 cursor-pointer transition-colors"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  {isOpen && (
                    <p className="mt-2.5 text-slate-400 text-xs leading-relaxed font-normal p-3 bg-slate-950/40 rounded-xl border border-slate-850 animate-fade-in">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Brand footer details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-slate-900">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-sans font-black text-white text-lg tracking-tight uppercase">TOPUPGAME</span>
              <span className="text-[9px] bg-indigo-600 font-mono font-bold text-white px-1.5 rounded uppercase">API ONLINE</span>
            </div>
            <p className="mt-3 text-xs leading-relaxed max-w-xs font-normal">
              Digital Game Store otomatisasi instan untuk startup bootstrap margin anti-rugi. Melayani top up 24 jam nonprofit-delay.
            </p>
          </div>

          <div className="space-y-3">
            <span className="text-white font-bold text-xs font-mono uppercase tracking-wider block">SUPPORT GATEWAYS</span>
            <div className="flex flex-wrap gap-2 text-[10px] text-slate-500 font-mono">
              <span className="bg-slate-900 border border-slate-850 px-2.5 py-1 rounded">QRIS INSTANT</span>
              <span className="bg-slate-900 border border-slate-850 px-2.5 py-1 rounded">BCA VA</span>
              <span className="bg-slate-900 border border-slate-850 px-2.5 py-1 rounded">MANDIRI VA</span>
              <span className="bg-slate-900 border border-slate-850 px-2.5 py-1 rounded">GOPAY / DANA</span>
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-white font-bold text-xs font-mono uppercase tracking-wider block">HUBUNGI KAMI</span>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-400">
                <Mail className="h-4 w-4 text-indigo-400" />
                <span>Riankampank@gmail.com</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
                <span>Terverifikasi SSL Secure 256-bit</span>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright notice */}
        <div className="border-t border-slate-900 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-600 font-mono">
          <span>&copy; {new Date().getFullYear()} TOPUPGAME AUTOMATIC STORAGE. ALL RIGHTS RESERVED.</span>
          <span className="flex items-center gap-1">
            Built with <Heart className="h-3 w-3 text-red-500 animate-pulse" /> for Bootstrap Startups Mode
          </span>
        </div>

      </div>
    </footer>
  );
}
