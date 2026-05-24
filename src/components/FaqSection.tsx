import React, { useState } from "react";
import { HelpCircle, ChevronRight, MessageSquareQuote } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_DATA: FaqItem[] = [
  {
    question: "Bagaimana cara melakukan top up game di platform ini?",
    answer: "Caranya sangat mudah dan ramah pengguna: 1) Pilih game yang ingin diisi dari beranda, 2) Masukkan User ID / Zone ID akun Anda, 3) Pilih produk digital atau nominal koin yang diinginkan, 4) Tentukan metode pembayaran terbaik (seperti QRIS atau Transfer Virtual Account), dan 5) Selesaikan pembayaran. Koin Anda akan masuk secara instan dalam hitungan detik!"
  },
  {
    question: "Apakah transaksi dijamin aman dan legal?",
    answer: "100% dijamin aman dan legal! Semua koin, diamond, atau pass yang dikirimkan terintegrasi langsung dengan API supplier resmi (seperti DigiFlazz & VIP Reseller) yang terhubung langsung ke server penerbit game resmi. Tidak ada konsekuensi ban atau resiko keamanan bagi akun Anda."
  },
  {
    question: "Berapa lama waktu pengiriman setelah transfer?",
    answer: "Hampir seluruh transaksi diproses secara real-time otomatis tanpa campur tangan admin manual. Rata-rata waktu pengiriman berkisar antara 1 hingga 30 detik semenjak sistem pembayaran kami mendeteksi mutasi saldo masuk dari sistem gateway Tripay."
  },
  {
    question: "Bagaimana jika koin belum masuk atau terjadi kendala?",
    answer: "Anda dapat memantau status pesanan secara mandiri di tab 'Lacak Order' menggunakan ID Invoice Anda (Contoh: INV-xxxxxxxx). Di sana, trace audit log dipaparkan mendalam secara real-time. Jika status gagal dari supplier, sisa saldo dapat dikembalikan atau Anda dapat menghubungi admin helpdesk via Telegram secara langsung."
  }
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq-section" className="mt-16 text-left">
      <div className="flex items-start gap-3 border-b border-slate-850 pb-5 mb-8">
        <span className="w-1 h-10 bg-indigo-500 rounded-full mt-1.5 flex-shrink-0"></span>
        <div>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Frequently Asked Questions (FAQ)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Temukan jawaban cepat mengenai prosedur pembayaran, integrasi supplier otomatis, dan jaminan keamanan transaksi digital.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto space-y-3.5">
        {FAQ_DATA.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div 
              id={`faq-item-${idx}`}
              key={idx}
              className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full flex items-center justify-between p-5 text-left font-sans select-none hover:bg-slate-850/30 transition-all font-bold text-xs sm:text-sm text-white"
              >
                <span className="flex items-center gap-3 pr-4">
                  <HelpCircle className={`h-4 w-4 flex-shrink-0 ${isOpen ? "text-indigo-400" : "text-slate-500"}`} />
                  {faq.question}
                </span>
                <ChevronRight className={`h-4 w-4 text-slate-400 flex-shrink-0 transition-transform duration-300 ${isOpen ? "rotate-90 text-indigo-400" : ""}`} />
              </button>

              <div 
                className={`transition-all duration-300 ease-in-out ${
                  isOpen ? "max-h-56 border-t border-slate-850/50 p-5 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
                }`}
              >
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-normal">
                  {faq.answer}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
