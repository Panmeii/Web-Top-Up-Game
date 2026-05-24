import React, { useState, useEffect } from "react";
import { X, Sparkles, Tag, ShieldAlert, ArrowLeft, ArrowRight, Wallet, Check, Ticket, HelpCircle } from "lucide-react";
import { Game, Product, PaymentMethod, Voucher, Order, OrderStatus } from "../types";
import { useAppStore } from "../store/useStore";

interface OrderModalProps {
  game: Game;
  products: Product[];
  onClose: () => void;
  onOrderCreated: (order: Order) => void;
  preSelectedProductId?: string;
}

export default function OrderModal({ game, products, onClose, onOrderCreated, preSelectedProductId }: OrderModalProps) {
  const { currentUser } = useAppStore();

  // Wizard steps: 1 = ID input & Product, 2 = Payment Method, 3 = Coupon & Checkout Review
  const [step, setStep] = useState(1);
  const [userUid, setUserUid] = useState("");
  const [userServer, setUserServer] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);


  // Payments and local cached voucher
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [validatedCoupon, setValidatedCoupon] = useState<{ code: string; discount: number } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  // Game products filtered by gameId
  const gameProducts = products.filter(p => p.gameId === game.id && p.status === "ACTIVE");

  useEffect(() => {
    // Select default product if passed as a pre-select
    if (preSelectedProductId) {
      const found = gameProducts.find(p => p.id === preSelectedProductId);
      if (found) setSelectedProduct(found);
    } else if (gameProducts.length > 0) {
      setSelectedProduct(gameProducts[0]);
    }

    // Fetch payments
    fetch("/api/payments")
      .then(r => r.json())
      .then(d => {
        setPaymentMethods(d.filter((p: PaymentMethod) => p.status === "ACTIVE"));
        if (d.length > 0) setSelectedPayment(d.find((p: PaymentMethod) => p.id === "qris") || d[0]);
      });
  }, [game.id, preSelectedProductId, products]);

  // Handle Voucher check
  const handleApplyVoucher = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const resp = await fetch("/api/vouchers/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode,
          totalPrice: selectedProduct ? (selectedProduct.isFlashSale && selectedProduct.flashSalePrice ? selectedProduct.flashSalePrice : selectedProduct.priceFinal) : 0
        })
      });
      const data = await resp.json();
      if (!resp.ok) {
        setCouponError(data.error || "Gagal menerapkan kupon.");
        setValidatedCoupon(null);
      } else {
        setValidatedCoupon({ code: data.code, discount: data.discount });
      }
    } catch (e) {
      setCouponError("Sistem sibuk, silakan coba lagi nanti.");
    } finally {
      setCouponLoading(false);
    }
  };

  // Pricing math helper: base + service charges - discount
  const getPricingSummary = () => {
    if (!selectedProduct || !selectedPayment) return { priceBase: 0, serviceFee: 0, discount: 0, total: 0, memberDiscount: 0 };
    let base = selectedProduct.isFlashSale && selectedProduct.flashSalePrice ? selectedProduct.flashSalePrice : selectedProduct.priceFinal;
    
    // Apply automatic 10% Member/Reseller Discount as a special startup premium perk
    let memberDiscount = 0;
    if (currentUser && (currentUser.role === "MEMBER" || currentUser.role === "ADMIN")) {
      memberDiscount = Math.round(base * 0.1);
      base = base - memberDiscount;
    }

    const disc = validatedCoupon ? validatedCoupon.discount : 0;
    
    // Gateway service fee
    const feeFixed = selectedPayment.feeFixed;
    const feePercent = (base - disc) * (selectedPayment.feePercent / 100);
    const serviceFee = Math.round(feeFixed + feePercent);
    const total = (base - disc) + serviceFee;

    return { priceBase: base + memberDiscount, serviceFee, discount: disc, total, memberDiscount };
  };

  const { priceBase, serviceFee, discount, total, memberDiscount } = getPricingSummary();


  const handleCheckout = async () => {
    if (!userUid.trim()) {
      setCheckoutError("Kolom User ID Game tidak boleh kosong!");
      setStep(1);
      return;
    }

    if (game.hasServer && !userServer.trim()) {
      setCheckoutError("Silakan pilih atau masukkan server zone ID Anda!");
      setStep(1);
      return;
    }

    setIsSubmitting(true);
    setCheckoutError("");

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId: game.id,
          productId: selectedProduct?.id,
          userUid,
          userServer: game.hasServer ? userServer : undefined,
          paymentId: selectedPayment?.id,
          voucherCode: validatedCoupon?.code
        })
      });

      const data = await response.json();
      if (!response.ok) {
        setCheckoutError(data.error || "Gagal membuat pesanan.");
      } else {
        onOrderCreated(data.order);
      }
    } catch (e) {
      setCheckoutError("Terjadi kegagalan memproses pesanan ke server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-zoom-in">
        
        {/* Banner header inside modal */}
        <div className="relative p-6 border-b border-slate-800 flex items-center justify-between" style={{ background: game.banner, backgroundSize: 'cover' }}>
          <div className="absolute inset-0 bg-slate-950/60 pointer-events-none"></div>
          
          <div className="relative z-10 flex items-center gap-3">
            <span className="text-3xl bg-slate-900/80 p-2 rounded-xl border border-slate-700">{game.logo}</span>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">{game.name}</h2>
              <span className="text-xs uppercase tracking-wider font-bold text-slate-300 font-mono">
                {game.publisher}
              </span>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="relative z-10 bg-slate-950/40 text-slate-300 p-2 rounded-full cursor-pointer hover:bg-slate-900 hover:text-white transition-all border border-slate-700/50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Container */}
        <div className="p-6 space-y-6">
          
          {/* Top Wizard Steps Tracker */}
          <div className="flex items-center justify-center gap-2 max-w-md mx-auto mb-6">
            <div className={`p-1.5 rounded-full flex items-center gap-1.5 text-[11px] font-semibold transition-all ${step === 1 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
              <span className="h-4 w-4 rounded-full bg-slate-950 flex items-center justify-center text-[10px] font-mono">1</span>
              <span className="px-1">Data & Produk</span>
            </div>
            <div className="h-px bg-slate-800 w-8"></div>
            <div className={`p-1.5 rounded-full flex items-center gap-1.5 text-[11px] font-semibold transition-all ${step === 2 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
              <span className="h-4 w-4 rounded-full bg-slate-950 flex items-center justify-center text-[10px] font-mono">2</span>
              <span className="px-1">Pembayaran</span>
            </div>
            <div className="h-px bg-slate-800 w-8"></div>
            <div className={`p-1.5 rounded-full flex items-center gap-1.5 text-[11px] font-semibold transition-all ${step === 3 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
              <span className="h-4 w-4 rounded-full bg-slate-950 flex items-center justify-center text-[10px] font-mono">3</span>
              <span className="px-1">Checkout</span>
            </div>
          </div>

          {/* Checkout global errors */}
          {checkoutError && (
            <div className="bg-red-500/10 text-red-400 text-xs p-3 rounded-xl border border-red-500/20 flex gap-2.5 items-center">
              <ShieldAlert className="h-4 w-4 flex-shrink-0" />
              <span>{checkoutError}</span>
            </div>
          )}

          {/* STEP 1: UID, server and Products selection */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              {/* Part A: ID Gamer Fields */}
              <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-850 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] uppercase font-bold text-indigo-400 font-mono bg-indigo-500/10 px-2 py-0.5 rounded">Langkah 1</span>
                  <span className="text-white text-xs font-bold font-sans">Masukkan Identitas Akun</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400">Gamer UID / Player ID</label>
                    <input 
                      id="order-uid-input"
                      type="text" 
                      value={userUid}
                      onChange={(e) => setUserUid(e.target.value)}
                      placeholder={game.inputPlaceholder.split("(")[0]}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-medium"
                    />
                  </div>

                  {game.hasServer && (
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-400">Pilih Server Zone</label>
                      {game.id === "mlbb" ? (
                        <input
                          id="order-server-input-mlbb"
                          type="text"
                          value={userServer}
                          onChange={(e) => setUserServer(e.target.value)}
                          placeholder="Zone ID (e.g. 2044)"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-medium"
                        />
                      ) : (
                        <select 
                          id="order-server-select"
                          value={userServer}
                          onChange={(e) => setUserServer(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                        >
                          <option value="">-- Pilih Server --</option>
                          <option value="asia">Asia Server</option>
                          <option value="america">America Server</option>
                          <option value="europe">Europe Server</option>
                          <option value="tw_hk_mo">TW/HK/MO Server</option>
                        </select>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-[9px] text-slate-500 tracking-wide font-medium">
                  Aturan: Kesalahan menginput ID Gamer di luar tanggung jawab penyedia otomatisasi digital store.
                </p>
              </div>

              {/* Part B: Denominations Selection */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-indigo-400 font-mono bg-indigo-500/10 px-2 py-0.5 rounded">Langkah 2</span>
                    <span className="text-white text-xs font-bold font-sans">Pilih Nominal Topup</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">Tersedia {gameProducts.length} Keping</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-1">
                  {gameProducts.map((p) => {
                    const isSelected = selectedProduct?.id === p.id;
                    const priceShow = p.isFlashSale && p.flashSalePrice ? p.flashSalePrice : p.priceFinal;

                    return (
                      <div 
                        id={`product-${p.id}`}
                        key={p.id}
                        onClick={() => setSelectedProduct(p)}
                        className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between h-24 ${
                          isSelected 
                            ? "bg-slate-800 border-indigo-500 shadow-lg shadow-indigo-500/5 text-white" 
                            : "bg-slate-950/40 border-slate-850 hover:border-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        <div>
                          <span className="text-xs font-black block truncate">{p.name}</span>
                          {p.isFlashSale && (
                            <span className="inline-block bg-red-600/20 text-red-400 text-[8px] font-bold px-1 py-0.2 rounded mt-0.5 uppercase tracking-wide">
                              SALE PROMO
                            </span>
                          )}
                        </div>
                        <div className="mt-2 flex flex-col">
                          {p.isFlashSale && p.originalPrice && (
                            <span className="text-[9px] text-slate-500 line-through leading-none mb-0.5">
                              Rp {p.originalPrice.toLocaleString()}
                            </span>
                          )}
                          <span className="text-xs font-bold tracking-tight text-amber-400">
                            Rp {priceShow.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                <div className="text-left">
                  <span className="text-[10px] text-slate-500 block font-bold font-mono uppercase">TEMAN NOMINAL PILIHAN:</span>
                  <span className="text-white text-sm font-bold truncate block">{selectedProduct?.name || "Belum dipilih"}</span>
                </div>
                <button 
                  id="checkout-step-1-btn"
                  onClick={() => {
                    if (!userUid.trim()) {
                      setCheckoutError("Silakan masukkan ID Gamer Anda terlebih dahulu.");
                      return;
                    }
                    if (game.hasServer && !userServer.trim()) {
                      setCheckoutError("Silakan pilih atau masukkan server zone ID Anda.");
                      return;
                    }
                    setCheckoutError("");
                    setStep(2);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-3 rounded-xl flex items-center gap-1.5 transition-all shadow-lg cursor-pointer"
                >
                  <span>Langkah Berikutnya</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Payment Pipeline Method Selector */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-indigo-400 font-mono bg-indigo-500/10 px-2 py-0.5 rounded">Langkah 3</span>
                  <span className="text-white text-xs font-bold font-sans">Metode Pembayaran Tersedia</span>
                </div>
                <button 
                  onClick={() => setStep(1)}
                  className="text-indigo-400 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Kembali</span>
                </button>
              </div>

              {/* Payment Methods Grid grouped by categories */}
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                {["QRIS", "EWALLET", "VA", "TRANSFER"].map((catType) => {
                  const itemsInCat = paymentMethods.filter(p => p.type === catType);
                  if (itemsInCat.length === 0) return null;

                  return (
                    <div key={catType} className="space-y-2">
                      <span className="text-[10px] uppercase font-bold font-mono tracking-wider text-slate-500 block px-1">
                        {catType === "QRIS" ? "QRIS All Payment (Tercepat)" : 
                         catType === "EWALLET" ? "E-Wallet Instant" : 
                         catType === "VA" ? "Virtual Account Bank" : "Transfer Manual Verifikasi manual"}
                      </span>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {itemsInCat.map((pm) => {
                          const isSelected = selectedPayment?.id === pm.id;
                          // Calculate exact service fee for transparency
                          const itemBase = selectedProduct ? (selectedProduct.isFlashSale && selectedProduct.flashSalePrice ? selectedProduct.flashSalePrice : selectedProduct.priceFinal) : 0;
                          const calculatedFee = Math.round(pm.feeFixed + (itemBase * (pm.feePercent / 100)));

                          return (
                            <div 
                              id={`payment-${pm.id}`}
                              key={pm.id}
                              onClick={() => setSelectedPayment(pm)}
                              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                                isSelected 
                                  ? "bg-slate-800 border-indigo-500 text-white" 
                                  : "bg-slate-950/40 border-slate-850 text-slate-400 hover:text-white"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className="bg-slate-900 px-2 py-1.5 rounded-lg border border-slate-800 text-xs font-black">
                                  {pm.logo}
                                </span>
                                <div className="text-left">
                                  <span className="text-xs font-bold block">{pm.name.split("(")[0]}</span>
                                  <span className="text-[9px] text-slate-500 block font-mono">
                                    Biaya Admin: {pm.feePercent > 0 ? `${pm.feePercent}%` : ""} {pm.feeFixed > 0 ? `+ Rp ${pm.feeFixed}` : "Free"} (Est: Rp {calculatedFee})
                                  </span>
                                </div>
                              </div>
                              {isSelected && (
                                <span className="p-1 rounded-full bg-indigo-500 text-white">
                                  <Check className="h-3 w-3" />
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action buttons */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                <div className="text-left">
                  <span className="text-[10px] text-slate-500 block font-bold font-mono">METODE TERPILIH:</span>
                  <span className="text-white text-xs font-bold block">{selectedPayment?.name.split("(")[0]}</span>
                </div>
                <button 
                  id="checkout-step-2-btn"
                  onClick={() => setStep(3)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-3 rounded-xl flex items-center gap-1.5 transition-all shadow-lg cursor-pointer"
                >
                  <span>Langkah Akhir</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Coupons redemption & Checkout Review */}
          {step === 3 && selectedProduct && selectedPayment && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-indigo-400 font-mono bg-indigo-500/10 px-2 py-0.5 rounded">Langkah 4</span>
                  <span className="text-white text-xs font-bold font-sans">Verifikasi & Kupon Diskon</span>
                </div>
                <button 
                  onClick={() => setStep(2)}
                  className="text-indigo-400 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Kembali</span>
                </button>
              </div>

              {/* Coupon Form */}
              <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-850 space-y-3">
                <div className="flex items-center gap-2 justify-between">
                  <div className="flex items-center gap-1.5">
                    <Ticket className="h-4 w-4 text-amber-500" />
                    <span className="text-xs text-white font-bold">Miliki Kupon Promo?</span>
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono lowercase">Gunakan: WELCOME, NEWUSER, atau TOPUP</span>
                </div>

                <div className="flex gap-2.5">
                  <input 
                    id="coupon-input"
                    type="text"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value.toUpperCase());
                      setValidatedCoupon(null);
                      setCouponError("");
                    }}
                    placeholder="Masukkan Kode Kupon..."
                    className="flex-grow bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white uppercase placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-mono font-bold"
                  />
                  <button
                    id="apply-coupon-btn"
                    onClick={handleApplyVoucher}
                    disabled={couponLoading || !couponCode.trim()}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer disabled:opacity-50 transition-all font-sans"
                  >
                    {couponLoading ? "Checking..." : "Pasang"}
                  </button>
                </div>

                {couponError && (
                  <p className="text-[10px] text-red-400 font-bold">{couponError}</p>
                )}
                {validatedCoupon && (
                  <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="h-3.5 w-3.5" />
                    <span>Kupon {validatedCoupon.code} berhasil dipasang! Pengurangan Rp {validatedCoupon.discount}</span>
                  </p>
                )}
              </div>

              {/* Complete Breakdown Invoice Review */}
              <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-850 space-y-3">
                <span className="text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wide block border-b border-slate-800 pb-2">
                  Rincian Pemesanan (Invoice Breakdown)
                </span>

                <div className="space-y-2 text-xs font-medium text-slate-400">
                  <div className="flex justify-between">
                    <span>Nama Game</span>
                    <span className="text-slate-200 font-bold">{game.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gamer Player ID</span>
                    <span className="text-indigo-400 font-mono font-bold">
                      {userUid} {userServer ? `(${userServer})` : ""}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Item Nominal</span>
                    <span className="text-slate-200 font-bold">{selectedProduct.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Metode Pembayaran</span>
                    <span className="text-slate-200 font-bold">{selectedPayment.name.split("(")[0]}</span>
                  </div>
                  
                  <div className="h-px bg-slate-850 my-2"></div>

                  <div className="flex justify-between">
                    <span>Harga Paket</span>
                    <span className="text-slate-300 font-mono font-bold">Rp {priceBase.toLocaleString()}</span>
                  </div>
                  {memberDiscount > 0 && (
                    <div className="flex justify-between text-amber-400">
                      <span>Harga Spesial @{currentUser?.role} (-10%)</span>
                      <span className="font-mono font-bold">- Rp {memberDiscount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Biaya Layanan Admin Gateway</span>
                    <span className="text-slate-300 font-mono font-bold">+ Rp {serviceFee.toLocaleString()}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Kupon Diskon ({validatedCoupon?.code})</span>
                      <span className="font-mono font-bold">- Rp {discount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="h-px bg-slate-800 my-2"></div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white font-bold font-sans">TOTAL HARGA WAJIB BAYAR</span>
                    <span className="text-amber-400 font-sans font-black text-base tracking-tight font-mono">
                      Rp {total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Final dispatch with legal confirmation disclaimer */}
              <div className="space-y-3">
                <button
                  id="final-checkout-dispatch-btn"
                  onClick={handleCheckout}
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-sans font-black tracking-wide text-xs md:text-sm py-4 rounded-xl cursor-pointer disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
                >
                  <Sparkles className="h-5 w-5 animate-pulse" />
                  <span>{isSubmitting ? "MEMPROSES PESANAN..." : "BAYAR SEKARANG (PROSES OTOMATIS)"}</span>
                </button>
                <div className="flex gap-2 items-center justify-center text-[10px] text-slate-500 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  <span>Otomatisasi 24 jam • Enkripsi Tripay & Digiflazz Gateway SECURE</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
