import { Game, Product, PaymentMethod, Voucher, Order, OrderStatus } from "../types";

export const SEED_GAMES: Game[] = [
  {
    id: "mlbb",
    slug: "mobile-legends",
    name: "Mobile Legends",
    logo: "🏆",
    banner: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
    publisher: "Moonton",
    status: "ACTIVE",
    sortOrder: 1,
    inputPlaceholder: "Masukkan User ID & Zone ID (Contoh: 12345678 (1234))",
    hasServer: true,
    seoMeta: {
      title: "Top Up Diamond MLBB Murah & Otomatis | Cepat Terkirim",
      description: "Beli Diamond Mobile Legends otomatis langsung masuk dalam 1 detik. Aman, terpercaya, bayar pakai QRIS, Danamon, BCA, Mandiri, ShopeePay.",
      keywords: "mlbb, mobile legends, top up ml, diamond ml murah, moonton"
    }
  },
  {
    id: "ff",
    slug: "free-fire",
    name: "Free Fire",
    logo: "🔥",
    banner: "linear-gradient(135deg, #7c2d12 0%, #ea580c 100%)",
    publisher: "Garena",
    status: "ACTIVE",
    sortOrder: 2,
    inputPlaceholder: "Masukkan Player ID FF (Contoh: 987654321)",
    hasServer: false,
    seoMeta: {
      title: "Top Up Free Fire Diamond Murah 24 Jam Otomatis",
      description: "Top up Diamond FF termudah. Masukkan Player ID, pilih nominal, selesaikan pembayaran, diamond langsung masuk otomatis di ID FF Anda.",
      keywords: "free fire, diamond ff, top up ff murah, garena free fire"
    }
  },
  {
    id: "pubgm",
    slug: "pubg-mobile",
    name: "PUBG Mobile",
    logo: "🪂",
    banner: "linear-gradient(135deg, #111827 0%, #374151 100%)",
    publisher: "Tencent Games",
    status: "ACTIVE",
    sortOrder: 3,
    inputPlaceholder: "Masukkan Character ID PUBG (Contoh: 5123456789)",
    hasServer: false,
    seoMeta: {
      title: "Top Up Unknown Cash UC PUBG Mobile Paling Murah",
      description: "Layanan top up UC PUBG Mobile resmi termurah dan kilat 24 jam. Pembayaran via e-wallet dan transfer bank terlengkap dan otomatis.",
      keywords: "pubg mobile, uc pubg murah, top up uc pubg, tencent"
    }
  },
  {
    id: "hok",
    slug: "honor-of-kings",
    name: "Honor of Kings",
    logo: "👑",
    banner: "linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%)",
    publisher: "Level Infinite",
    status: "ACTIVE",
    sortOrder: 4,
    inputPlaceholder: "Masukkan User ID HOK (Contoh: 700123456)",
    hasServer: true,
    seoMeta: {
      title: "Top Up Tokens Honor of Kings (HOK) Murah Otomatis",
      description: "Beli Tokens Honor of Kings murah meriah, proses instan 24 jam otomatis. Bayar aman dengan QRIS maupun bank transfer.",
      keywords: "honor of kings, hok tokens, top up hok, level infinite"
    }
  },
  {
    id: "valorant",
    slug: "valorant",
    name: "Valorant",
    logo: "🎯",
    banner: "linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%)",
    publisher: "Riot Games",
    status: "ACTIVE",
    sortOrder: 5,
    inputPlaceholder: "Masukkan Riot ID + Tag (Contoh: Player#1234)",
    hasServer: false,
    seoMeta: {
      title: "Top Up Valorant Points Murah - Pengiriman Instan",
      description: "Beli VP Valorant instan murah 24 jam nonstop. Cukup masukkan Riot ID Anda, poin langsung terisi secara otomatis.",
      keywords: "valorant points, vp valorant, top up vp, riot games"
    }
  },
  {
    id: "genshin",
    slug: "genshin-impact",
    name: "Genshin Impact",
    logo: "☄️",
    banner: "linear-gradient(135deg, #14532d 0%, #16a34a 100%)",
    publisher: "COGNOSPHERE (HoYoverse)",
    status: "ACTIVE",
    sortOrder: 6,
    inputPlaceholder: "Masukkan UID (Contoh: 123456789) & Pilih Server",
    hasServer: true,
    seoMeta: {
      title: "Top Up Genesis Crystals Genshin Impact Murah Meriah",
      description: "Beli Genesis Crystals Genshin Impact harga agen promo murah. Cepat, aman, otomatis bayar lewat QRIS atau Virtual Account.",
      keywords: "genshin impact, genesis crystals, top up genshin, hoyoverse"
    }
  },
  {
    id: "roblox",
    slug: "roblox",
    name: "Roblox",
    logo: "🧱",
    banner: "linear-gradient(135deg, #0f172a 0%, #475569 100%)",
    publisher: "Roblox Corporation",
    status: "ACTIVE",
    sortOrder: 7,
    inputPlaceholder: "Masukkan Username Roblox Anda (Contoh: MasterGamer)",
    hasServer: false,
    seoMeta: {
      title: "Top Up Robux Murah & Gift Card Roblox Instan",
      description: "Dapatkan Robux murah instan, legal dan terpercaya. Layanan top up Roblox terbaik di Indonesia dengan pembayaran lengkap.",
      keywords: "roblox, robux murah, top up robux, beli gift card roblox"
    }
  },
  {
    id: "steam",
    slug: "steam-wallet",
    name: "Steam Wallet",
    logo: "🎮",
    banner: "linear-gradient(135deg, #030712 0%, #1f2937 100%)",
    publisher: "Valve Corporation",
    status: "ACTIVE",
    sortOrder: 8,
    inputPlaceholder: "Masukkan Username Akun Steam (Contoh: steam_user88)",
    hasServer: false,
    seoMeta: {
      title: "Top Up Steam Wallet Code IDR Murah Meriah Instan",
      description: "Beli saldo Steam Wallet IDR paling murah untuk game PC kesayangan Anda. Code instan terkirim otomatis setelah pembayaran divalidasi.",
      keywords: "steam wallet, steam code idr, saldo steam, valve"
    }
  }
];

export const SEED_PRODUCTS_RAW = [
  // Mobile Legends
  { gameId: "mlbb", sku: "ml-3", name: "3 Diamonds", priceSupplier: 900, status: "ACTIVE" },
  { gameId: "mlbb", sku: "ml-5", name: "5 Diamonds", priceSupplier: 1400, status: "ACTIVE" },
  { gameId: "mlbb", sku: "ml-12", name: "12 Diamonds", priceSupplier: 3350, status: "ACTIVE" },
  { gameId: "mlbb", sku: "ml-28", name: "28 Diamonds", priceSupplier: 7200, status: "ACTIVE" },
  { gameId: "mlbb", sku: "ml-59", name: "59 Diamonds", priceSupplier: 14700, status: "ACTIVE" },
  { gameId: "mlbb", sku: "ml-85", name: "85 Diamonds", priceSupplier: 19800, status: "ACTIVE", isFlashSale: true, flashSalePrice: 20500, originalPrice: 22000, flashSaleQuota: 100 },
  { gameId: "mlbb", sku: "ml-170", name: "170 Diamonds", priceSupplier: 39500, status: "ACTIVE" },
  { gameId: "mlbb", sku: "ml-296", name: "296 Diamonds", priceSupplier: 69200, status: "ACTIVE" },
  { gameId: "mlbb", sku: "ml-568", name: "568 Diamonds", priceSupplier: 132000, status: "ACTIVE" },
  { gameId: "mlbb", sku: "ml-weekly", name: "Weekly Diamond Pass", priceSupplier: 25000, status: "ACTIVE", isFlashSale: true, flashSalePrice: 25900, originalPrice: 29900, flashSaleQuota: 50 },

  // Free Fire
  { gameId: "ff", sku: "ff-5", name: "5 Diamonds", priceSupplier: 900, status: "ACTIVE" },
  { gameId: "ff", sku: "ff-12", name: "12 Diamonds", priceSupplier: 1850, status: "ACTIVE" },
  { gameId: "ff", sku: "ff-50", name: "50 Diamonds", priceSupplier: 7350, status: "ACTIVE" },
  { gameId: "ff", sku: "ff-70", name: "70 Diamonds", priceSupplier: 9100, status: "ACTIVE" },
  { gameId: "ff", sku: "ff-140", name: "140 Diamonds", priceSupplier: 18100, status: "ACTIVE" },
  { gameId: "ff", sku: "ff-355", name: "355 Diamonds", priceSupplier: 45200, status: "ACTIVE" },
  { gameId: "ff", sku: "ff-720", name: "720 Diamonds", priceSupplier: 90100, status: "ACTIVE", isFlashSale: true, flashSalePrice: 94900, originalPrice: 103000, flashSaleQuota: 30 },

  // PUBG Mobile
  { gameId: "pubgm", sku: "pubg-30", name: "30 Unknown Cash (UC)", priceSupplier: 6500, status: "ACTIVE" },
  { gameId: "pubgm", sku: "pubg-60", name: "60 Unknown Cash (UC)", priceSupplier: 12100, status: "ACTIVE" },
  { gameId: "pubgm", sku: "pubg-325", name: "325 Unknown Cash (UC)", priceSupplier: 61500, status: "ACTIVE" },
  { gameId: "pubgm", sku: "pubg-660", name: "660 Unknown Cash (UC)", priceSupplier: 122000, status: "ACTIVE" },

  // Honor of Kings
  { gameId: "hok", sku: "hok-8", name: "8 Tokens", priceSupplier: 1540, status: "ACTIVE" },
  { gameId: "hok", sku: "hok-40", name: "40 Tokens", priceSupplier: 7300, status: "ACTIVE" },
  { gameId: "hok", sku: "hok-240", name: "240 Tokens", priceSupplier: 43200, status: "ACTIVE" },
  { gameId: "hok", sku: "hok-400", name: "400 Tokens", priceSupplier: 72500, status: "ACTIVE" },

  // Valorant
  { gameId: "valorant", sku: "val-125", name: "125 Valorant Points", priceSupplier: 13900, status: "ACTIVE" },
  { gameId: "valorant", sku: "val-375", name: "375 Valorant Points", priceSupplier: 41200, status: "ACTIVE" },
  { gameId: "valorant", sku: "val-1120", name: "1120 Valorant Points", priceSupplier: 110500, status: "ACTIVE" },

  // Genshin Impact
  { gameId: "genshin", sku: "gi-60", name: "60 Genesis Crystals", priceSupplier: 13600, status: "ACTIVE" },
  { gameId: "genshin", sku: "gi-300", name: "300 + 30 Crystals", priceSupplier: 67500, status: "ACTIVE" },
  { gameId: "genshin", sku: "gi-980", name: "980 + 110 Crystals", priceSupplier: 212000, status: "ACTIVE" },
  { gameId: "genshin", sku: "gi-welkin", name: "Blessing of the Welkin Moon", priceSupplier: 68000, status: "ACTIVE", isFlashSale: true, flashSalePrice: 72000, originalPrice: 79000, flashSaleQuota: 10 },

  // Roblox
  { gameId: "roblox", sku: "rb-80", name: "80 Robux (Fast)", priceSupplier: 13900, status: "ACTIVE" },
  { gameId: "roblox", sku: "rb-400", name: "400 Robux (Gift Card)", priceSupplier: 68500, status: "ACTIVE" },
  { gameId: "roblox", sku: "rb-800", name: "800 Robux (Gift Card)", priceSupplier: 134000, status: "ACTIVE" },

  // Steam
  { gameId: "steam", sku: "st-12k", name: "Steam Wallet Rp 12.000 (ID)", priceSupplier: 13600, status: "ACTIVE" },
  { gameId: "steam", sku: "st-45k", name: "Steam Wallet Rp 45.000 (ID)", priceSupplier: 49500, status: "ACTIVE" },
  { gameId: "steam", sku: "st-60k", name: "Steam Wallet Rp 60.000 (ID)", priceSupplier: 65100, status: "ACTIVE" },
  { gameId: "steam", sku: "st-120k", name: "Steam Wallet Rp 120.000 (ID)", priceSupplier: 128500, status: "ACTIVE" }
];

export const SEED_PAYMENTS: PaymentMethod[] = [
  { id: "qris", name: "QRIS All Payment (LinkAja, OVO, Dana, Shopee)", type: "QRIS", feeFixed: 0, feePercent: 0.7, logo: "⚡ QRIS", status: "ACTIVE" },
  { id: "gopay", name: "GoPay E-Wallet", type: "EWALLET", feeFixed: 100, feePercent: 1.5, logo: "📱 GoPay", status: "ACTIVE" },
  { id: "dana", name: "Dana Instant", type: "EWALLET", feeFixed: 100, feePercent: 1.5, logo: "💰 DANA", status: "ACTIVE" },
  { id: "bca", name: "BCA Virtual Account", type: "VA", feeFixed: 3000, feePercent: 0, logo: "🏦 BCA VA", status: "ACTIVE" },
  { id: "mandiri", name: "Mandiri Virtual Account", type: "VA", feeFixed: 3000, feePercent: 0, logo: "🏦 Mandiri VA", status: "ACTIVE" },
  { id: "bni", name: "BNI Virtual Account", type: "VA", feeFixed: 3000, feePercent: 0, logo: "🏦 BNI VA", status: "ACTIVE" },
  { id: "transfer_manual", name: "Bank Transfer Manual (BCA/Danamon)", type: "TRANSFER", feeFixed: 0, feePercent: 0, logo: "✉️ TRANSFER", status: "ACTIVE" }
];

export const SEED_VOUCHERS: Voucher[] = [
  { code: "WELCOME", discountMax: 2000, minPurchase: 20000, quota: 1000, used: 24, status: "ACTIVE", expiryDate: "2026-12-31" },
  { code: "NEWUSER", discountMax: 1500, minPurchase: 10000, quota: 500, used: 12, status: "ACTIVE", expiryDate: "2026-12-31" },
  { code: "TOPUP", discountMax: 2000, minPurchase: 25000, quota: 200, used: 89, status: "ACTIVE", expiryDate: "2026-12-31" },
  { code: "GOSALE", discountMax: 1000, minPurchase: 15000, quota: 100, used: 100, status: "INACTIVE", expiryDate: "2026-01-01" } // expired
];

// Calculation utility for compliance:
// Low (<10k): 1500 - 3000 margin, protection rule
// Med (10k - 50k): 10-15% margin
// High (50k - 100k): 8-12% margin
// Ultra (100k+): 5-8% margin
// We calculate default sellingPrice based on supplier price:
export function calculateSellingPrice(supplierPrice: number, isFlashSale = false, flashPrice = 0): number {
  if (isFlashSale && flashPrice > 0) {
    // If flash sale is set, make sure it is greater than supplierPrice
    if (flashPrice > supplierPrice) {
      return flashPrice;
    }
  }

  let margin = 0;
  if (supplierPrice < 10000) {
    margin = 2000; // default 2000 markup
  } else if (supplierPrice < 50000) {
    margin = Math.round(supplierPrice * 0.12); // 12%
  } else if (supplierPrice < 100000) {
    margin = Math.round(supplierPrice * 0.10); // 10%
  } else {
    margin = Math.round(supplierPrice * 0.07); // 7%
  }

  // Double check minimum profit safeguards
  // Low product: Rp500
  // Medium: Rp1000
  // High: Rp2000+
  let minAllowedProfit = 500;
  if (supplierPrice >= 10000 && supplierPrice < 50000) minAllowedProfit = 1000;
  if (supplierPrice >= 50000) minAllowedProfit = 2000;

  if (margin < minAllowedProfit) {
    margin = minAllowedProfit;
  }

  return supplierPrice + margin;
}

// Map real seeded compiled products
export const SEED_PRODUCTS: Product[] = SEED_PRODUCTS_RAW.map((prod) => {
  const finalPrice = calculateSellingPrice(prod.priceSupplier, prod.isFlashSale, prod.flashSalePrice);
  return {
    id: prod.sku,
    gameId: prod.gameId,
    name: prod.name,
    sku: prod.sku,
    priceSupplier: prod.priceSupplier,
    priceFinal: finalPrice,
    status: prod.status as "ACTIVE" | "INACTIVE",
    isFlashSale: prod.isFlashSale || false,
    flashSalePrice: prod.flashSalePrice,
    originalPrice: prod.originalPrice || Math.round(finalPrice * 1.15)
  };
});

// Seed some active static orders for real telemetry and admin graphs
export const SEED_ORDERS: Order[] = [
  {
    id: "INV-20260524-10022",
    gameId: "mlbb",
    gameName: "Mobile Legends",
    gameSlug: "mobile-legends",
    productId: "ml-weekly",
    productName: "Weekly Diamond Pass",
    userUid: "29482104",
    userServer: "2044",
    priceSupplier: 25000,
    priceBase: 28000,
    priceFinal: 25900, // Flash Sale Price
    discountAmount: 0,
    paymentMethodId: "qris",
    paymentMethodName: "QRIS All Payment",
    status: OrderStatus.SUCCESS,
    createdAt: "2026-05-24T12:04:10.000Z",
    updatedAt: "2026-05-24T12:04:15.000Z",
    supplierUsed: "Digiflazz",
    supplierStatus: "Transaksi Sukses",
    log: ["Pesanan Diterima", "Pembayaran Terdeteksi QRIS", "Kirim ke Supplier Digiflazz", "Supplier Merespon SUKSES", "Pesanan Selesai Otomatis"]
  },
  {
    id: "INV-20260524-10023",
    gameId: "ff",
    gameName: "Free Fire",
    gameSlug: "free-fire",
    productId: "ff-140",
    productName: "140 Diamonds",
    userUid: "1932918301",
    priceSupplier: 18100,
    priceBase: 20500,
    priceFinal: 19000, // Coupon applied
    voucherApplied: "NEWUSER",
    discountAmount: 1500,
    paymentMethodId: "dana",
    paymentMethodName: "Dana Instant",
    status: OrderStatus.SUCCESS,
    createdAt: "2026-05-24T14:15:22.000Z",
    updatedAt: "2026-05-24T14:15:30.000Z",
    supplierUsed: "VIP Reseller",
    supplierStatus: "Sukses",
    log: ["Pesanan Diterima", "Kupon NEWUSER berhasil dipasang", "Pembayaran Terverifikasi Obyektif", "Pemesanan ke VIP Reseller Sukses"]
  },
  {
    id: "INV-20260524-10024",
    gameId: "valorant",
    gameName: "Valorant",
    gameSlug: "valorant",
    productId: "val-1120",
    productName: "1120 Valorant Points",
    userUid: "Shroud#NA1",
    priceSupplier: 110500,
    priceBase: 118000,
    priceFinal: 116000, // WELCOME discount Applied
    voucherApplied: "WELCOME",
    discountAmount: 2000,
    paymentMethodId: "bca",
    paymentMethodName: "BCA Virtual Account",
    status: OrderStatus.PENDING,
    createdAt: "2026-05-24T17:45:00.000Z",
    updatedAt: "2026-05-24T17:45:00.000Z",
    supplierUsed: "Digiflazz",
    supplierStatus: "Menunggu Pembayaran",
    log: ["Pesanan Diterima", "Kupon WELCOME valid", "Menunggu Pembayaran melalui BCA VA"]
  },
  {
    id: "INV-20260524-10025",
    gameId: "genshin",
    gameName: "Genshin Impact",
    gameSlug: "genshin-impact",
    productId: "gi-980",
    productName: "980 + 110 Crystals",
    userUid: "804192831",
    userServer: "asia",
    priceSupplier: 212000,
    priceBase: 228000,
    priceFinal: 228000,
    discountAmount: 0,
    paymentMethodId: "qris",
    paymentMethodName: "QRIS All Payment",
    status: OrderStatus.PROCESSING,
    createdAt: "2026-05-24T18:05:00.000Z",
    updatedAt: "2026-05-24T18:06:12.000Z",
    supplierUsed: "IAK",
    supplierStatus: "Sedang Diproses",
    log: ["Pesanan Diterima", "Pembayaran QRIS lunas terverifikasi", "Kirim Request Supplier IAK (Pending)"]
  }
];
