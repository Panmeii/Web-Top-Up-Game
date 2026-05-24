import { PrismaClient, Role, OrderStatus, MemberTier, PaymentType, SupplierType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seeding...");

  // 1. Seed Users (with hashed passwords, wallets, and member records)
  const usersToSeed = [
    {
      email: "riankampank@gmail.com",
      name: "Rian Kampank",
      role: Role.ADMIN,
      balance: 150000.0,
      tier: MemberTier.PLATINUM_MEMBER,
      discount: 0.15,
    },
    {
      email: "member_vip@gamer.com",
      name: "VIP Member",
      role: Role.MEMBER,
      balance: 75000.0,
      tier: MemberTier.VIPP_MEMBER,
      discount: 0.10,
    },
    {
      email: "gamer_regular@gmail.com",
      name: "Regular User",
      role: Role.USER,
      balance: 15000.0,
      tier: MemberTier.REGULAR,
      discount: 0.0,
    }
  ];

  console.log("Seeding Users, Wallets, and Member terms...");
  for (const u of usersToSeed) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        name: u.name,
        role: u.role,
        passwordHash: "$2b$10$EPfG3F1BfUoO8P28M.8bZunv6rI10y3WIDitx98bVve7R/qXm7v2i", // pre-solved secure hash of "password123"
        wallet: {
          create: {
            balance: u.balance,
            currency: "IDR"
          }
        },
        member: {
          create: {
            tier: u.tier,
            discountRate: u.discount
          }
        }
      }
    });
    console.log(`- Seeded user: ${user.email} (${user.role})`);
  }

  // 2. Seed Games
  console.log("Seeding Games...");
  const gamesToSeed = [
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
    }
  ];

  for (const g of gamesToSeed) {
    await prisma.game.upsert({
      where: { id: g.id },
      update: {
        slug: g.slug,
        name: g.name,
        logo: g.logo,
        banner: g.banner,
        publisher: g.publisher,
        status: g.status,
        sortOrder: g.sortOrder,
        inputPlaceholder: g.inputPlaceholder,
        hasServer: g.hasServer
      },
      create: g
    });
  }
  console.log(`- Seeded ${gamesToSeed.length} game publishers successfully.`);

  // Helpers to calculate margins based on safe rules:
  function calculateSellingPrice(supplierPrice: number, isFlashSale = false, flashPrice = 0): number {
    if (isFlashSale && flashPrice > 0) {
      if (flashPrice > supplierPrice) {
        return flashPrice;
      }
    }
    let margin = 0;
    if (supplierPrice < 10000) {
      margin = 2000;
    } else if (supplierPrice < 50000) {
      margin = Math.round(supplierPrice * 0.12);
    } else if (supplierPrice < 100000) {
      margin = Math.round(supplierPrice * 0.10);
    } else {
      margin = Math.round(supplierPrice * 0.07);
    }
    const minProfit = supplierPrice < 10000 ? 500 : supplierPrice < 50000 ? 1000 : 2000;
    if (margin < minProfit) {
      margin = minProfit;
    }
    return supplierPrice + margin;
  }

  // 3. Seed Products
  console.log("Seeding Game Products...");
  const rawProducts = [
    // Mobile Legends
    { gameId: "mlbb", sku: "ml-3", name: "3 Diamonds", priceSupplier: 900 },
    { gameId: "mlbb", sku: "ml-5", name: "5 Diamonds", priceSupplier: 1400 },
    { gameId: "mlbb", sku: "ml-12", name: "12 Diamonds", priceSupplier: 3350 },
    { gameId: "mlbb", sku: "ml-28", name: "28 Diamonds", priceSupplier: 7200 },
    { gameId: "mlbb", sku: "ml-59", name: "59 Diamonds", priceSupplier: 14700 },
    { gameId: "mlbb", sku: "ml-85", name: "85 Diamonds", priceSupplier: 19800, isFlashSale: true, flashSalePrice: 20500, flashSaleQuota: 100 },
    { gameId: "mlbb", sku: "ml-170", name: "170 Diamonds", priceSupplier: 39500 },
    { gameId: "mlbb", sku: "ml-296", name: "296 Diamonds", priceSupplier: 69200 },
    { gameId: "mlbb", sku: "ml-568", name: "568 Diamonds", priceSupplier: 132000 },
    { gameId: "mlbb", sku: "ml-weekly", name: "Weekly Diamond Pass", priceSupplier: 25000, isFlashSale: true, flashSalePrice: 25900, flashSaleQuota: 50 },

    // Free Fire
    { gameId: "ff", sku: "ff-5", name: "5 Diamonds", priceSupplier: 900 },
    { gameId: "ff", sku: "ff-12", name: "12 Diamonds", priceSupplier: 1850 },
    { gameId: "ff", sku: "ff-50", name: "50 Diamonds", priceSupplier: 7350 },
    { gameId: "ff", sku: "ff-70", name: "70 Diamonds", priceSupplier: 9100 },
    { gameId: "ff", sku: "ff-140", name: "140 Diamonds", priceSupplier: 18100 },
    { gameId: "ff", sku: "ff-355", name: "355 Diamonds", priceSupplier: 45200 },
    { gameId: "ff", sku: "ff-720", name: "720 Diamonds", priceSupplier: 90100, isFlashSale: true, flashSalePrice: 94900, flashSaleQuota: 30 },

    // PUBG Mobile
    { gameId: "pubgm", sku: "pubg-30", name: "30 Unknown Cash (UC)", priceSupplier: 6500 },
    { gameId: "pubgm", sku: "pubg-60", name: "60 Unknown Cash (UC)", priceSupplier: 12100 },
    { gameId: "pubgm", sku: "pubg-325", name: "325 Unknown Cash (UC)", priceSupplier: 61500 },
    { gameId: "pubgm", sku: "pubg-660", name: "660 Unknown Cash (UC)", priceSupplier: 122000 },

    // Honor of Kings
    { gameId: "hok", sku: "hok-8", name: "8 Tokens", priceSupplier: 1540 },
    { gameId: "hok", sku: "hok-40", name: "40 Tokens", priceSupplier: 7300 },
    { gameId: "hok", sku: "hok-240", name: "240 Tokens", priceSupplier: 43200 },
    { gameId: "hok", sku: "hok-400", name: "400 Tokens", priceSupplier: 72500 },

    // Valorant
    { gameId: "valorant", sku: "val-125", name: "125 Valorant Points", priceSupplier: 13900 },
    { gameId: "valorant", sku: "val-375", name: "375 Valorant Points", priceSupplier: 41200 },
    { gameId: "valorant", sku: "val-1120", name: "1120 Valorant Points", priceSupplier: 110500 },

    // Genshin Impact
    { gameId: "genshin", sku: "gi-60", name: "60 Genesis Crystals", priceSupplier: 13600 },
    { gameId: "genshin", sku: "gi-300", name: "300 + 30 Crystals", priceSupplier: 67500 },
    { gameId: "genshin", sku: "gi-980", name: "980 + 110 Crystals", priceSupplier: 212000 },
    { gameId: "genshin", sku: "gi-welkin", name: "Blessing of the Welkin Moon", priceSupplier: 68000, isFlashSale: true, flashSalePrice: 72000, flashSaleQuota: 10 },

    // Roblox
    { gameId: "roblox", sku: "rb-80", name: "80 Robux (Fast)", priceSupplier: 13900 },
    { gameId: "roblox", sku: "rb-400", name: "400 Robux (Gift Card)", priceSupplier: 68500 },
    { gameId: "roblox", sku: "rb-800", name: "800 Robux (Gift Card)", priceSupplier: 134000 },

    // Steam
    { gameId: "steam", sku: "st-12k", name: "Steam Wallet Rp 12.000 (ID)", priceSupplier: 13600 },
    { gameId: "steam", sku: "st-45k", name: "Steam Wallet Rp 45.000 (ID)", priceSupplier: 49500 },
    { gameId: "steam", sku: "st-60k", name: "Steam Wallet Rp 60.000 (ID)", priceSupplier: 65100 },
    { gameId: "steam", sku: "st-120k", name: "Steam Wallet Rp 120.000 (ID)", priceSupplier: 128500 }
  ];

  for (const p of rawProducts) {
    const finalPrice = calculateSellingPrice(p.priceSupplier, p.isFlashSale, p.flashSalePrice);
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: {
        name: p.name,
        priceSupplier: p.priceSupplier,
        priceFinal: finalPrice,
        isFlashSale: p.isFlashSale || false,
        flashSalePrice: p.flashSalePrice || null,
        flashSaleQuota: p.flashSaleQuota || null,
        status: "ACTIVE"
      },
      create: {
        id: p.sku,
        gameId: p.gameId,
        name: p.name,
        sku: p.sku,
        priceSupplier: p.priceSupplier,
        priceFinal: finalPrice,
        isFlashSale: p.isFlashSale || false,
        flashSalePrice: p.flashSalePrice || null,
        flashSaleQuota: p.flashSaleQuota || null,
        status: "ACTIVE"
      }
    });
  }
  console.log(`- Seeded ${rawProducts.length} unique catalog products successfully.`);

  // 4. Seed Payment Methods
  console.log("Seeding Payment Methods...");
  const paymentsToSeed = [
    { id: "qris", name: "QRIS All Payment (LinkAja, OVO, Dana, Shopee)", type: PaymentType.QRIS, feeFixed: 0, feePercent: 0.7, logo: "⚡ QRIS", status: "ACTIVE" },
    { id: "gopay", name: "GoPay E-Wallet", type: PaymentType.EWALLET, feeFixed: 100, feePercent: 1.5, logo: "📱 GoPay", status: "ACTIVE" },
    { id: "dana", name: "Dana Instant", type: PaymentType.EWALLET, feeFixed: 100, feePercent: 1.5, logo: "💰 DANA", status: "ACTIVE" },
    { id: "bca", name: "BCA Virtual Account", type: PaymentType.VA, feeFixed: 3000, feePercent: 0, logo: "🏦 BCA VA", status: "ACTIVE" },
    { id: "mandiri", name: "Mandiri Virtual Account", type: PaymentType.VA, feeFixed: 3000, feePercent: 0, logo: "🏦 Mandiri VA", status: "ACTIVE" },
    { id: "bni", name: "BNI Virtual Account", type: PaymentType.VA, feeFixed: 3000, feePercent: 0, logo: "🏦 BNI VA", status: "ACTIVE" },
    { id: "transfer_manual", name: "Bank Transfer Manual (BCA/Danamon)", type: PaymentType.TRANSFER, feeFixed: 0, feePercent: 0, logo: "✉️ TRANSFER", status: "ACTIVE" }
  ];

  for (const pm of paymentsToSeed) {
    await prisma.paymentMethod.upsert({
      where: { id: pm.id },
      update: {
        name: pm.name,
        type: pm.type,
        feeFixed: pm.feeFixed,
        feePercent: pm.feePercent,
        logo: pm.logo,
        status: pm.status
      },
      create: pm
    });
  }
  console.log(`- Seeded ${paymentsToSeed.length} payment gateways.`);

  // 5. Seed Vouchers
  console.log("Seeding Promotion Vouchers...");
  const vouchersToSeed = [
    { code: "WELCOME", discountMax: 2000, minPurchase: 20000, quota: 1000, used: 24, status: "ACTIVE", expiryDate: new Date("2026-12-31T23:59:59Z") },
    { code: "NEWUSER", discountMax: 1500, minPurchase: 10000, quota: 500, used: 12, status: "ACTIVE", expiryDate: new Date("2026-12-31T23:59:59Z") },
    { code: "TOPUP", discountMax: 2000, minPurchase: 25000, quota: 200, used: 89, status: "ACTIVE", expiryDate: new Date("2026-12-31T23:59:59Z") },
    { code: "GOSALE", discountMax: 1000, minPurchase: 15000, quota: 100, used: 100, status: "INACTIVE", expiryDate: new Date("2026-01-01T00:00:00Z") }
  ];

  for (const v of vouchersToSeed) {
    await prisma.voucher.upsert({
      where: { code: v.code },
      update: {
        discountMax: v.discountMax,
        minPurchase: v.minPurchase,
        quota: v.quota,
        used: v.used,
        status: v.status,
        expiryDate: v.expiryDate
      },
      create: v
    });
  }
  console.log(`- Seeded promo events.`);

  // 6. Seed Suppliers
  console.log("Seeding API Suppliers...");
  const suppliersToSeed = [
    { id: "digiflazz", name: "Digiflazz Official", type: SupplierType.DIGIFLAZZ, apiUrl: "https://api.digiflazz.com/v1", apiUsername: "gamer_ria", apiKey: "df_8291aa8c88f3cc99", balance: 750000.0, isActive: true },
    { id: "vip_reseller", name: "VIP Reseller API", type: SupplierType.VIP_RESELLER, apiUrl: "https://vip-reseller.co.id/api", apiUsername: "rifqi_gamer", apiKey: "vip_9a8df142e0ca11", balance: 120000.0, isActive: true },
    { id: "iak", name: "IAK (Mobilepulsa)", type: SupplierType.IAK, apiUrl: "https://api.iak.id/v1", apiUsername: "iak_corp", apiKey: "iak_8e3c92a233b8", balance: 13000.0, isActive: true }
  ];

  for (const s of suppliersToSeed) {
    await prisma.supplier.upsert({
      where: { id: s.id },
      update: {
        name: s.name,
        type: s.type,
        apiUrl: s.apiUrl,
        apiUsername: s.apiUsername,
        apiKey: s.apiKey,
        balance: s.balance,
        isActive: s.isActive
      },
      create: s
    });
  }

  // 7. Seed Transactions / Orders
  console.log("Seeding mock historic transactions...");
  const defaultUser = await prisma.user.findFirst({ where: { email: "riankampank@gmail.com" } });
  
  const transactionsToSeed = [
    {
      id: "INV-20260524-10022",
      userId: defaultUser?.id || null,
      gameId: "mlbb",
      productId: "ml-weekly",
      gameName: "Mobile Legends",
      productName: "Weekly Diamond Pass",
      userUid: "29482104",
      userServer: "2044",
      priceSupplier: 25000,
      priceBase: 28000,
      priceFinal: 25900,
      discountAmount: 0,
      paymentMethodId: "qris",
      paymentMethodName: "QRIS All Payment",
      status: OrderStatus.SUCCESS,
      supplierUsed: "Digiflazz",
      supplierStatus: "Transaksi Sukses",
      log: ["Pesanan Diterima", "Pembayaran Terdeteksi QRIS", "Kirim ke Supplier Digiflazz", "Supplier Merespon SUKSES", "Pesanan Selesai Otomatis"]
    },
    {
      id: "INV-20260524-10023",
      userId: defaultUser?.id || null,
      gameId: "ff",
      productId: "ff-140",
      gameName: "Free Fire",
      productName: "140 Diamonds",
      userUid: "1932918301",
      priceSupplier: 18100,
      priceBase: 20500,
      priceFinal: 19000,
      voucherApplied: "NEWUSER",
      discountAmount: 1500,
      paymentMethodId: "dana",
      paymentMethodName: "Dana Instant",
      status: OrderStatus.SUCCESS,
      supplierUsed: "VIP Reseller",
      supplierStatus: "Sukses",
      log: ["Pesanan Diterima", "Kupon NEWUSER berhasil dipasang", "Pembayaran Terverifikasi Obyektif", "Pemesanan ke VIP Reseller Sukses"]
    }
  ];

  for (const tx of transactionsToSeed) {
    await prisma.transaction.upsert({
      where: { id: tx.id },
      update: {
        status: tx.status,
        supplierStatus: tx.supplierStatus,
        log: tx.log
      },
      create: tx
    });
  }

  console.log("Database seeded successfully with premium, high-fidelity sandbox context!");
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
