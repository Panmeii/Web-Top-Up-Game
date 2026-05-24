import React from "react";
import { Star, MessageSquareCode, Quote } from "lucide-react";

interface TestimonialItem {
  name: string;
  role: string;
  game: string;
  comment: string;
  rating: number;
  avatar: string;
}

const TESTIMONIALS_DATA: TestimonialItem[] = [
  {
    name: "Rizky Pratama",
    role: "Semi-Pro Player",
    game: "Mobile Legends",
    comment: "Top up Weekly Pass paling murah se-Indonesia cuma di sini! Biasanya platform lain mahal dan lama, di sini 1 detik langsung masuk pas lagi butuh buat nge-gacha skin favorit.",
    rating: 5,
    avatar: "👨‍💻"
  },
  {
    name: "Siti Rahma",
    role: "Casual Gamer",
    game: "Free Fire",
    comment: "Beli diamond FF gampang banget tinggal scan QRIS pakai LinkAja. Nggak perlu registrasi ribet langsung bisa selesai. Admin ramah dan sistemnya beneran otomatis 24 jam.",
    rating: 5,
    avatar: "👩‍💻"
  },
  {
    name: "Budi Santoso",
    role: "Guild Leader",
    game: "Honor of Kings",
    comment: "Awalnya ragu karena harganya miring banget dibanding tempat lain. Ternyata setelah dicoba, status transaksi langsung sukses otomatis dari API supplier. Sangat direkomendasikan!",
    rating: 5,
    avatar: "🎮"
  }
];

export default function Testimonials() {
  return (
    <section id="testimonials-section" className="mt-16 text-left">
      <div className="flex items-start gap-3 border-b border-slate-850 pb-5 mb-8">
        <span className="w-1 h-10 bg-indigo-500 rounded-full mt-1.5 flex-shrink-0"></span>
        <div>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Apa Kata Para Gamers?</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Testimoni jujur dari ribuan pelanggan aktif yang telah mencoba kecepatan transaksi top up instan kami.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TESTIMONIALS_DATA.map((item, index) => (
          <div 
            id={`testimonial-card-${index}`}
            key={index} 
            className="bg-slate-900 border border-slate-850 hover:border-slate-800 p-6 rounded-3xl relative transition-all duration-300 hover:-translate-y-1 block shadow-lg flex flex-col justify-between"
          >
            <div className="absolute top-4 right-4 text-slate-800 pointer-events-none">
              <Quote className="h-10 w-10 text-indigo-500/10" />
            </div>

            <div>
              {/* Rating stars */}
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: item.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                ))}
              </div>

              {/* Comment text */}
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6 font-normal">
                "{item.comment}"
              </p>
            </div>

            {/* Author info */}
            <div className="flex items-center gap-3 border-t border-slate-850/50 pt-4">
              <span className="text-xl bg-slate-950 p-2 rounded-xl border border-slate-850 flex-shrink-0 select-none">
                {item.avatar}
              </span>
              <div className="truncate">
                <h4 className="text-white font-bold text-xs sm:text-sm truncate">{item.name}</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-slate-500 font-mono font-medium">{item.role}</span>
                  <span className="text-[9px] text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded font-bold">{item.game}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
