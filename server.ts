import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { SEED_GAMES, SEED_PRODUCTS, SEED_PAYMENTS, SEED_VOUCHERS, SEED_ORDERS, calculateSellingPrice } from "./src/data/seedData.ts";
import { Game, Product, PaymentMethod, Voucher, Order, OrderStatus, AppSettings, WebhookLog } from "./src/types";
import { GoogleGenAI } from "@google/genai";
import { PrismaClient } from "@prisma/client";

// Ensure state is maintained across execution turns via local server memory
let currentGames: Game[] = [...SEED_GAMES];
let currentProducts: Product[] = [...SEED_PRODUCTS];
let currentPayments: PaymentMethod[] = [...SEED_PAYMENTS];
let currentVouchers: Voucher[] = [...SEED_VOUCHERS];
let currentOrders: Order[] = [...SEED_ORDERS];
let webhookLogs: WebhookLog[] = [
  {
    id: "LOG-001",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    provider: "Tripay Gateway",
    type: "INBOUND",
    payload: JSON.stringify({ event: "payment_pending", reference: "INV-20260524-10024", amount: 116000, status: "UNPAID" }, null, 2),
    statusCode: 200
  },
  {
    id: "LOG-002",
    timestamp: new Date(Date.now() - 3500000).toISOString(),
    provider: "Digiflazz API",
    type: "OUTBOUND",
    payload: JSON.stringify({ action: "check_balance", username: "gameshop_boost", sign: "abfc879def81923" }, null, 2),
    statusCode: 200
  }
];

let appSettings: AppSettings = {
  siteName: "TopUpGamer",
  siteTitle: "Top Up Game Otomatis & Terlengkap",
  siteDescription: "Platform top up game digital instan 24 jam termurah, tercepat, dan termudah di Indonesia. Digiflazz, VIP Reseller integrated.",
  telegramBotToken: "5819401231:AAF_telegram_demo_token",
  telegramChatId: "84192084",
  webhookUrl: "https://yourdomain.com/api/webhooks/payment",
  supplierSyncEnabled: true,
  minimumProfitLow: 500,
  minimumProfitMed: 1000,
  minimumProfitHigh: 2000
};

// Lazy initialize Prisma client to maintain absolute safety
let prisma: PrismaClient | null = null;
if (process.env.DATABASE_URL) {
  try {
    prisma = new PrismaClient();
    console.log("[Prisma] DATABASE_URL detected. Live database connection enabled.");
  } catch (e) {
    console.warn("[Prisma] Database initialization failed. Defaulting to local memory:", e);
    prisma = null;
  }
} else {
  console.log("[Prisma] DATABASE_URL missing. Operating in resilient sandbox memory mode.");
}

// Lazy initialize Gemini client to avoid crashes if credentials aren't loaded yet
let aiClient: GoogleGenAI | null = null;
function getGenAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
    } catch (e) {
      console.warn("Could not load GoogleGenAI:", e);
    }
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Helper function to append to audit/webhook log
  async function addLog(provider: string, type: "INBOUND" | "OUTBOUND", payload: any, statusCode = 200) {
    const formattedPayload = typeof payload === "string" ? payload : JSON.stringify(payload, null, 2);

    if (prisma) {
      try {
        await prisma.webhookLog.create({
          data: {
            provider,
            direction: type,
            payload: formattedPayload,
            statusCode,
            isVerified: true
          }
        });
      } catch (e) {
        console.warn("[Prisma] Failed to insert webhook log into DB:", e);
      }
    }

    webhookLogs.unshift({
      id: `LOG-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      provider,
      type,
      payload: formattedPayload,
      statusCode
    });
    
    if (webhookLogs.length > 100) {
      webhookLogs = webhookLogs.slice(0, 100);
    }
  }

  // API Endpoints
  
  // 1. GET Games
  app.get("/api/games", async (req, res) => {
    if (prisma) {
      try {
        const games = await prisma.game.findMany({
          orderBy: { sortOrder: "asc" }
        });
        const mappedGames: Game[] = games.map(g => ({
          id: g.id,
          slug: g.slug,
          name: g.name,
          logo: g.logo,
          banner: g.banner,
          publisher: g.publisher,
          status: g.status as "ACTIVE" | "INACTIVE",
          sortOrder: g.sortOrder,
          inputPlaceholder: g.inputPlaceholder,
          hasServer: g.hasServer,
          seoMeta: { title: `${g.name} Murah`, description: `Top up ${g.name}`, keywords: g.name.toLowerCase() }
        }));
        return res.json(mappedGames);
      } catch (e) {
        console.warn("[Prisma] Failed to fetch games from database. Falling back to memory:", e);
      }
    }
    res.json(currentGames);
  });

  // Create or Update Game
  app.post("/api/games", async (req, res) => {
    const gameData: Game = req.body;
    if (!gameData.id || !gameData.name) {
      return res.status(400).json({ error: "Game ID and Name are required" });
    }

    if (prisma) {
      try {
        const logo = gameData.logo || "🎮";
        const banner = gameData.banner || "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)";
        const publisher = gameData.publisher || "Unknown";
        const inputPlaceholder = gameData.inputPlaceholder || "Masukkan User ID";
        const slug = gameData.slug || gameData.name.toLowerCase().replace(/\s+/g, "-");

        await prisma.game.upsert({
          where: { id: gameData.id },
          update: {
            slug: slug,
            name: gameData.name,
            logo: logo,
            banner: banner,
            publisher: publisher,
            status: gameData.status || "ACTIVE",
            sortOrder: gameData.sortOrder !== undefined ? Number(gameData.sortOrder) : undefined,
            inputPlaceholder: inputPlaceholder,
            hasServer: gameData.hasServer || false
          },
          create: {
            id: gameData.id,
            slug: slug,
            name: gameData.name,
            logo: logo,
            banner: banner,
            publisher: publisher,
            status: gameData.status || "ACTIVE",
            sortOrder: gameData.sortOrder !== undefined ? Number(gameData.sortOrder) : 1,
            inputPlaceholder: inputPlaceholder,
            hasServer: gameData.hasServer || false
          }
        });

        const games = await prisma.game.findMany({
          orderBy: { sortOrder: "asc" }
        });
        const mappedGames: Game[] = games.map(g => ({
          id: g.id,
          slug: g.slug,
          name: g.name,
          logo: g.logo,
          banner: g.banner,
          publisher: g.publisher,
          status: g.status as "ACTIVE" | "INACTIVE",
          sortOrder: g.sortOrder,
          inputPlaceholder: g.inputPlaceholder,
          hasServer: g.hasServer,
          seoMeta: { title: `${g.name} Murah`, description: `Top up ${g.name}`, keywords: g.name.toLowerCase() }
        }));
        return res.json({ success: true, games: mappedGames });
      } catch (e) {
        console.warn("[Prisma] Upsert game failed. Falling back to memory:", e);
      }
    }

    const idx = currentGames.findIndex(g => g.id === gameData.id);
    if (idx >= 0) {
      currentGames[idx] = { ...currentGames[idx], ...gameData };
    } else {
      currentGames.push({
        status: "ACTIVE",
        sortOrder: currentGames.length + 1,
        seoMeta: { title: `${gameData.name} Murah`, description: `Top up ${gameData.name}`, keywords: gameData.name.toLowerCase() },
        inputPlaceholder: "Masukkan User ID",
        ...gameData
      });
    }
    res.json({ success: true, games: currentGames });
  });

  // 2. GET Products (optionally filtered by game)
  app.get("/api/products", async (req, res) => {
    const { gameId } = req.query;
    if (prisma) {
      try {
        const products = await prisma.product.findMany(
          gameId ? { where: { gameId: String(gameId) } } : undefined
        );
        const mappedProducts: Product[] = products.map(p => ({
          id: p.id,
          gameId: p.gameId,
          name: p.name,
          priceSupplier: p.priceSupplier,
          priceFinal: p.priceFinal,
          sku: p.sku,
          status: p.status as "ACTIVE" | "INACTIVE",
          isFlashSale: p.isFlashSale ?? false,
          flashSalePrice: p.flashSalePrice ?? undefined,
          flashSaleQuota: p.flashSaleQuota ?? undefined
        }));
        return res.json(mappedProducts);
      } catch (e) {
        console.warn("[Prisma] Failed to fetch products. Falling back to memory:", e);
      }
    }

    if (gameId) {
      res.json(currentProducts.filter(p => p.gameId === gameId));
    } else {
      res.json(currentProducts);
    }
  });

  // PUT update product or edit manually (checking safeguards)
  app.put("/api/products/:id", async (req, res) => {
    const { id } = req.params;
    const { priceSupplier, priceFinal, status, isFlashSale, flashSalePrice } = req.body;

    const idx = currentProducts.findIndex(p => p.id === id);
    const existingProduct = idx !== -1 ? currentProducts[idx] : null;

    const pSupp = Number(priceSupplier ?? (existingProduct ? existingProduct.priceSupplier : 0));
    const pFinal = Number(priceFinal ?? (existingProduct ? existingProduct.priceFinal : 0));

    // Dynamic anti-loss verification
    let minAllowedProfit = appSettings.minimumProfitLow;
    if (pSupp >= 10000 && pSupp < 50000) minAllowedProfit = appSettings.minimumProfitMed;
    if (pSupp >= 50000) minAllowedProfit = appSettings.minimumProfitHigh;

    const marginOfProposed = pFinal - pSupp;
    if (marginOfProposed < minAllowedProfit) {
      return res.status(400).json({
        error: `Penyelamatan Margin Gagal: Profit diperoleh Rp ${marginOfProposed}. Minimum profit wajib Rp ${minAllowedProfit} (Sistem Proteksi Anti-Rugi Aktif). Tidak boleh menyimpan harga rugi.`
      });
    }

    if (prisma) {
      try {
        const updated = await prisma.product.update({
          where: { id },
          data: {
            priceSupplier: pSupp,
            priceFinal: pFinal,
            status: status ?? undefined,
            isFlashSale: isFlashSale !== undefined ? isFlashSale : undefined,
            flashSalePrice: flashSalePrice !== undefined ? Number(flashSalePrice) : undefined
          }
        });
        return res.json({
          success: true,
          product: {
            id: updated.id,
            gameId: updated.gameId,
            name: updated.name,
            priceSupplier: updated.priceSupplier,
            priceFinal: updated.priceFinal,
            sku: updated.sku,
            status: updated.status as "ACTIVE" | "INACTIVE",
            isFlashSale: updated.isFlashSale ?? false,
            flashSalePrice: updated.flashSalePrice ?? undefined,
            flashSaleQuota: updated.flashSaleQuota ?? undefined
          }
        });
      } catch (e) {
        console.warn("[Prisma] Failed to update product in database. Falling back to memory:", e);
      }
    }

    if (idx === -1) {
      return res.status(404).json({ error: "Product not found" });
    }

    currentProducts[idx] = {
      ...currentProducts[idx],
      priceSupplier: pSupp,
      priceFinal: pFinal,
      status: status ?? currentProducts[idx].status,
      isFlashSale: isFlashSale !== undefined ? isFlashSale : currentProducts[idx].isFlashSale,
      flashSalePrice: flashSalePrice !== undefined ? Number(flashSalePrice) : currentProducts[idx].flashSalePrice
    };

    res.json({ success: true, product: currentProducts[idx] });
  });

  // 3. Payment Methods
  app.get("/api/payments", async (req, res) => {
    if (prisma) {
      try {
        const pms = await prisma.paymentMethod.findMany();
        const mappedPms: PaymentMethod[] = pms.map(p => ({
          id: p.id,
          name: p.name,
          type: p.type as any,
          feeFixed: p.feeFixed,
          feePercent: p.feePercent,
          logo: p.logo,
          status: p.status as "ACTIVE" | "INACTIVE"
        }));
        return res.json(mappedPms);
      } catch (e) {
        console.warn("[Prisma] Failed to fetch payment methods. Falling back to memory:", e);
      }
    }
    res.json(currentPayments);
  });

  // 4. Vouchers Endpoints
  app.get("/api/vouchers", async (req, res) => {
    if (prisma) {
      try {
        const vouchers = await prisma.voucher.findMany();
        const mappedVouchers: Voucher[] = vouchers.map(v => ({
          code: v.code,
          discountMax: v.discountMax,
          minPurchase: v.minPurchase,
          quota: v.quota,
          used: v.used,
          status: v.status as "ACTIVE" | "INACTIVE",
          expiryDate: v.expiryDate.toISOString()
        }));
        return res.json(mappedVouchers);
      } catch (e) {
        console.warn("[Prisma] Failed to fetch vouchers. Falling back to memory:", e);
      }
    }
    res.json(currentVouchers);
  });

  app.post("/api/vouchers/validate", async (req, res) => {
    const { code, totalPrice } = req.body;

    if (prisma) {
      try {
        const voucher = await prisma.voucher.findFirst({
          where: { code: { equals: String(code).toUpperCase() }, status: "ACTIVE" }
        });
        if (!voucher) {
          return res.status(400).json({ error: "Kupon tidak ditemukan atau tidak aktif" });
        }
        if (Number(totalPrice) < voucher.minPurchase) {
          return res.status(400).json({ error: `Minimal pembelian untuk voucher ini adalah Rp ${voucher.minPurchase}` });
        }
        if (voucher.used >= voucher.quota) {
          return res.status(400).json({ error: "Kuota penukaran kupon telah habis" });
        }
        return res.json({
          success: true,
          code: voucher.code,
          discount: voucher.discountMax,
          message: `Kupon ${voucher.code} berhasil dipasang! Diskon Rp ${voucher.discountMax}`
        });
      } catch (e) {
        console.warn("[Prisma] Failed to validate voucher in DB. Falling back to memory:", e);
      }
    }

    const voucher = currentVouchers.find(v => v.code.toUpperCase() === String(code).toUpperCase() && v.status === "ACTIVE");
    if (!voucher) {
      return res.status(400).json({ error: "Kupon tidak ditemukan atau tidak aktif" });
    }
    if (Number(totalPrice) < voucher.minPurchase) {
      return res.status(400).json({ error: `Minimal pembelian untuk voucher ini adalah Rp ${voucher.minPurchase}` });
    }
    if (voucher.used >= voucher.quota) {
      return res.status(400).json({ error: "Kuota penukaran kupon telah habis" });
    }
    res.json({
      success: true,
      code: voucher.code,
      discount: voucher.discountMax,
      message: `Kupon ${voucher.code} berhasil dipasang! Diskon Rp ${voucher.discountMax}`
    });
  });

  // 5. Orders Endpoints
  app.get("/api/orders", async (req, res) => {
    if (prisma) {
      try {
        const transactions = await prisma.transaction.findMany({
          orderBy: { createdAt: "desc" }
        });
        const mappedOrders: Order[] = transactions.map(t => ({
          id: t.id,
          gameId: t.gameId,
          gameName: t.gameName,
          gameSlug: t.gameName.toLowerCase().replace(/\s+/g, "-"),
          productId: t.productId,
          productName: t.productName,
          userUid: t.userUid,
          userServer: t.userServer ?? undefined,
          priceSupplier: t.priceSupplier,
          priceBase: t.priceBase,
          priceFinal: t.priceFinal,
          voucherApplied: t.voucherApplied ?? undefined,
          discountAmount: t.discountAmount,
          paymentMethodId: t.paymentMethodId,
          paymentMethodName: t.paymentMethodName,
          status: t.status as OrderStatus,
          createdAt: t.createdAt.toISOString(),
          updatedAt: t.updatedAt.toISOString(),
          supplierUsed: t.supplierUsed,
          supplierStatus: t.supplierStatus,
          log: t.log
        }));
        return res.json(mappedOrders);
      } catch (e) {
        console.warn("[Prisma] Failed to fetch transactions. Falling back to memory:", e);
      }
    }
    res.json(currentOrders);
  });

  app.get("/api/orders/:id", async (req, res) => {
    const { id } = req.params;

    if (prisma) {
      try {
        const t = await prisma.transaction.findUnique({
          where: { id }
        });
        if (t) {
          const mappedOrder: Order = {
            id: t.id,
            gameId: t.gameId,
            gameName: t.gameName,
            gameSlug: t.gameName.toLowerCase().replace(/\s+/g, "-"),
            productId: t.productId,
            productName: t.productName,
            userUid: t.userUid,
            userServer: t.userServer ?? undefined,
            priceSupplier: t.priceSupplier,
            priceBase: t.priceBase,
            priceFinal: t.priceFinal,
            voucherApplied: t.voucherApplied ?? undefined,
            discountAmount: t.discountAmount,
            paymentMethodId: t.paymentMethodId,
            paymentMethodName: t.paymentMethodName,
            status: t.status as OrderStatus,
            createdAt: t.createdAt.toISOString(),
            updatedAt: t.updatedAt.toISOString(),
            supplierUsed: t.supplierUsed,
            supplierStatus: t.supplierStatus,
            log: t.log
          };
          return res.json(mappedOrder);
        }
      } catch (e) {
        console.warn("[Prisma] Failed to fetch single transaction. Falling back to memory:", e);
      }
    }

    const order = currentOrders.find(o => o.id === id);
    if (!order) return res.status(404).json({ error: "Pesanan tidak ditemukan" });
    res.json(order);
  });

  app.post("/api/orders", async (req, res) => {
    const { gameId, productId, userUid, userServer, paymentId, voucherCode } = req.body;
    
    let game: any = null;
    let product: any = null;
    let payment: any = null;
    let voucher: any = null;

    if (prisma) {
      try {
        game = await prisma.game.findUnique({ where: { id: gameId } });
        product = await prisma.product.findUnique({ where: { id: productId } });
        payment = await prisma.paymentMethod.findUnique({ where: { id: paymentId } });
        if (voucherCode) {
          voucher = await prisma.voucher.findFirst({
            where: { code: { equals: String(voucherCode).toUpperCase() }, status: "ACTIVE" }
          });
        }
      } catch (e) {
        console.warn("[Prisma] Failed to load order metadata from DB. Using local arrays:", e);
      }
    }

    if (!game) game = currentGames.find(g => g.id === gameId);
    if (!product) product = currentProducts.find(p => p.id === productId);
    if (!payment) payment = currentPayments.find(p => p.id === paymentId);
    if (!voucher && voucherCode) {
      voucher = currentVouchers.find(v => v.code.toUpperCase() === String(voucherCode).toUpperCase() && v.status === "ACTIVE");
    }

    if (!game || !product || !payment) {
      return res.status(400).json({ error: "Game, Produk, atau Metode Pembayaran tidak valid!" });
    }

    if (!userUid || String(userUid).trim() === "") {
      return res.status(400).json({ error: "Kolom ID Gamer Game tidak boleh kosong!" });
    }

    // Double check active flash sale pricing or base price
    let originalPrice = product.priceFinal;
    if (product.isFlashSale && product.flashSalePrice) {
      originalPrice = product.flashSalePrice;
    }

    // Apply Voucher discount (double verification server side)
    let discount = 0;
    if (voucher && originalPrice >= voucher.minPurchase && voucher.used < voucher.quota) {
      discount = voucher.discountMax;
      const afterDiscountProfit = (originalPrice - discount) - product.priceSupplier;
      if (afterDiscountProfit < 100) {
        discount = Math.max(0, originalPrice - product.priceSupplier - 150); // clamp discount
      }
    }

    // Add payment gateway variables
    const feeFixed = payment.feeFixed;
    const feePercent = (originalPrice - discount) * (payment.feePercent / 100);
    const serviceFee = Math.round(feeFixed + feePercent);
    const finalAmountToPay = (originalPrice - discount) + serviceFee;

    const uniqueInvoiceId = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(10000 + Math.random() * 90000)}`;

    const newOrder: Order = {
      id: uniqueInvoiceId,
      gameId: game.id,
      gameName: game.name,
      gameSlug: game.slug || game.name.toLowerCase().replace(/\s+/g, "-"),
      productId: product.id,
      productName: product.name,
      userUid,
      userServer: userServer || undefined,
      priceSupplier: product.priceSupplier,
      priceBase: originalPrice,
      priceFinal: finalAmountToPay,
      voucherApplied: discount > 0 ? voucher.code : undefined,
      discountAmount: discount,
      paymentMethodId: payment.id,
      paymentMethodName: payment.name,
      status: OrderStatus.PENDING,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      supplierUsed: "Digiflazz",
      supplierStatus: "Menunggu Pembayaran",
      log: ["Pesanan Baru Dibuat", `Status didaftarkan Menunggu Pembayaran via ${payment.name}`]
    };

    if (prisma) {
      try {
        await prisma.transaction.create({
          data: {
            id: newOrder.id,
            userId: null,
            gameId: newOrder.gameId,
            productId: newOrder.productId,
            gameName: newOrder.gameName,
            productName: newOrder.productName,
            userUid: newOrder.userUid,
            userServer: newOrder.userServer || null,
            priceSupplier: newOrder.priceSupplier,
            priceBase: newOrder.priceBase,
            priceFinal: newOrder.priceFinal,
            discountAmount: newOrder.discountAmount,
            voucherApplied: newOrder.voucherApplied || null,
            paymentMethodId: newOrder.paymentMethodId,
            paymentMethodName: newOrder.paymentMethodName,
            status: "PENDING",
            supplierUsed: newOrder.supplierUsed,
            supplierStatus: newOrder.supplierStatus,
            log: newOrder.log || []
          }
        });
      } catch (e) {
        console.warn("[Prisma] Failed to store invoice in database:", e);
      }
    }

    currentOrders.unshift(newOrder);

    // Record outbound communication simulating invoice creation log
    await addLog("Tripay Payment Gateway", "OUTBOUND", {
      action: "create_invoice",
      invoice: uniqueInvoiceId,
      amount: finalAmountToPay,
      callback_url: appSettings.webhookUrl
    });

    res.json({ success: true, order: newOrder });
  });

  // Simulated Instant Payment Trigger (simulate Webhook incoming)
  app.post("/api/orders/:id/webhook-pay", async (req, res) => {
    const { id } = req.params;
    let order: any = null;

    if (prisma) {
      try {
        order = await prisma.transaction.findUnique({ where: { id } });
      } catch (e) {
        console.warn("[Prisma] Webhook order search error:", e);
      }
    }

    if (!order) {
      order = currentOrders.find(o => o.id === id);
    }

    if (!order) {
      return res.status(404).json({ error: "Invoice tidak ditemukan." });
    }

    if (order.status !== OrderStatus.PENDING && order.status !== "PENDING") {
      return res.status(400).json({ error: "Invoice ini tidak sedang pending pembayaran." });
    }

    // Simulate Webhook inbound log
    await addLog("Tripay Webhook Receiver", "INBOUND", {
      event: "payment_reference_paid",
      reference: order.id,
      amount_settled: order.priceFinal,
      payment_channel: order.paymentMethodName,
      status: "SUCCESS"
    });

    const paidLog = order.log ? [...order.log] : [];
    paidLog.push("Menerima notifikasi webhook Tripay: Status LUNAS");
    paidLog.push("Mengubah status pesanan menjadi PAID");

    order.status = OrderStatus.PAID;
    order.supplierStatus = "Pembayaran Terverifikasi";
    order.log = paidLog;
    order.updatedAt = new Date().toISOString();

    if (prisma) {
      try {
        await prisma.transaction.update({
          where: { id },
          data: {
            status: "PAID",
            supplierStatus: "Pembayaran Terverifikasi",
            log: paidLog
          }
        });
      } catch (e) {
        console.warn("[Prisma] Payload update to PAID failed:", e);
      }
    }

    // 2. Automated Supplier Dispatch Pipeline
    setTimeout(async () => {
      const procLog = [...paidLog, `Mengirimkan pesanan otomatis ke API ${order.supplierUsed}`];
      order.status = OrderStatus.PROCESSING;
      order.supplierStatus = `Proses ke Supplier (${order.supplierUsed})`;
      order.log = procLog;
      order.updatedAt = new Date().toISOString();

      if (prisma) {
        try {
          await prisma.transaction.update({
            where: { id },
            data: {
              status: "PROCESSING",
              supplierStatus: `Proses ke Supplier (${order.supplierUsed})`,
              log: procLog
            }
          });
        } catch (e) {
          console.warn("[Prisma] Payload update to PROCESSING failed:", e);
        }
      }

      // Dispatch payload to supplier simul
      await addLog(`${order.supplierUsed} API Engine`, "OUTBOUND", {
        ref_id: order.id,
        buyer_sku_code: order.productId,
        customer_no: order.userUid + (order.userServer ? `-${order.userServer}` : ""),
        sign: "digi_md5_simulation"
      });

      // 3. Final Fulfillment Sequence
      setTimeout(async () => {
        const successLog = [...procLog, `Supplier ${order.supplierUsed} melaporkan transaksi Berhasil: ${order.productName} telah masuk ke ID ${order.userUid}`, "Transaksi Selesai 100% otomatis!"];
        
        order.status = OrderStatus.SUCCESS;
        order.supplierStatus = "SUKSES";
        order.log = successLog;
        order.updatedAt = new Date().toISOString();

        if (prisma) {
          try {
            await prisma.transaction.update({
              where: { id },
              data: {
                status: "SUCCESS",
                supplierStatus: "SUKSES",
                log: successLog
              }
            });

            if (order.voucherApplied) {
              await prisma.voucher.updateMany({
                where: { code: { equals: order.voucherApplied, mode: "insensitive" } },
                data: { used: { increment: 1 } }
              });
            }
          } catch (e) {
            console.warn("[Prisma] Final success update failed in DB:", e);
          }
        }

        // Increment voucher count locally for backup
        if (order.voucherApplied) {
          const vIdx = currentVouchers.findIndex(v => v.code.toUpperCase() === order.voucherApplied?.toUpperCase());
          if (vIdx >= 0) {
            currentVouchers[vIdx].used += 1;
          }
        }
      }, 3000);

    }, 1500);

    res.json({ success: true, message: "Webhook pembayaran berhasil disimulasikan! Alur pengisian berjalan otomatis.", order });
  });

  // Simulate Auto Sync / Import API trigger
  app.post("/api/supplier/sync", async (req, res) => {
    const { provider } = req.body;
    
    // Auto import and recalculating according to standard profit margin protection formula
    const simulatedSupplierImports = [
      { id: "ml-3", price: 850 },
      { id: "ml-5", price: 1350 },
      { id: "ff-5", price: 880 },
      { id: "gi-60", price: 13200 },
      { id: "pubg-30", price: 6100 }
    ];

    let updatedCount = 0;

    for (const imp of simulatedSupplierImports) {
      if (prisma) {
        try {
          const prod = await prisma.product.findUnique({ where: { id: imp.id } });
          if (prod) {
            const finalPrice = calculateSellingPrice(imp.price, prod.isFlashSale, prod.flashSalePrice ?? undefined);
            await prisma.product.update({
              where: { id: imp.id },
              data: {
                priceSupplier: imp.price,
                priceFinal: finalPrice
              }
            });
            updatedCount++;
          }
        } catch (e) {
          console.warn("[Prisma] Supplier sync item query failed:", e);
        }
      }

      // Memory backup
      const idx = currentProducts.findIndex(p => p.id === imp.id);
      if (idx >= 0) {
        currentProducts[idx].priceSupplier = imp.price;
        currentProducts[idx].priceFinal = calculateSellingPrice(imp.price, currentProducts[idx].isFlashSale, currentProducts[idx].flashSalePrice);
        if (!prisma) {
          updatedCount++;
        }
      }
    }

    await addLog(`${provider || "VIP Reseller"} Sync Engine`, "INBOUND", {
      status: "SUCCESS",
      synchronized_items: updatedCount,
      timestamp: new Date().toISOString()
    });

    let returnProducts = currentProducts;
    if (prisma) {
      try {
        const dbProds = await prisma.product.findMany();
        returnProducts = dbProds.map(p => ({
          id: p.id,
          gameId: p.gameId,
          name: p.name,
          priceSupplier: p.priceSupplier,
          priceFinal: p.priceFinal,
          sku: p.sku,
          status: p.status as "ACTIVE" | "INACTIVE",
          isFlashSale: p.isFlashSale ?? false,
          flashSalePrice: p.flashSalePrice ?? undefined,
          flashSaleQuota: p.flashSaleQuota ?? undefined
        }));
      } catch (e) {
        console.warn("[Prisma] Failed to retrieve products dynamically:", e);
      }
    }

    res.json({ success: true, message: `Berhasil sinkronisasi harga & stok dari ${provider || "Digiflazz"}. ${updatedCount} produk diperbarui otomatis.`, products: returnProducts });
  });

  // 6. Settings Router
  app.get("/api/settings", (req, res) => {
    res.json(appSettings);
  });

  app.post("/api/settings", (req, res) => {
    appSettings = { ...appSettings, ...req.body };
    res.json({ success: true, settings: appSettings });
  });

  // 7. GET Logs
  app.get("/api/logs", async (req, res) => {
    if (prisma) {
      try {
        const logs = await prisma.webhookLog.findMany({
          orderBy: { timestamp: "desc" },
          take: 100
        });
        const mappedLogs: WebhookLog[] = logs.map(l => ({
          id: l.id,
          timestamp: l.timestamp.toISOString(),
          provider: l.provider,
          type: l.direction as "INBOUND" | "OUTBOUND",
          payload: l.payload,
          statusCode: l.statusCode
        }));
        return res.json(mappedLogs);
      } catch (e) {
        console.warn("[Prisma] Hook loading failure. Resorting to memory logs:", e);
      }
    }
    res.json(webhookLogs);
  });

  // 8. Server-Side AI SEO Suggestion Generator (Gemini Integration via @google/genai SDK)
  app.post("/api/ai/seo", async (req, res) => {
    const { gameName, keywordFocus } = req.body;
    if (!gameName) {
      return res.status(400).json({ error: "Game name is required for generation." });
    }

    const prompt = `Anda adalah Spesialis SEO handal untuk startup top up game modal Rp0 di Indonesia. 
Buatlah materi optimasi SEO meta-tags premium dalam format JSON yang sangat menarik, persuasif, dan mendongkrak CTR (Click-Through Rate).
Judul meta harus mengandung unsur murah, cepat, terpercaya, otomatis 24 jam.

Detail Masukan:
Nama Game: ${gameName}
Fokus Kata Kunci: ${keywordFocus || "top up otomatis murah"}

Format respon wajib berupa objek JSON valid dengan properti berikut:
1. title: Judul halaman optimal (Maksimal 60 karakter)
2. description: Deskripsi meta persuasif mengajak klik (Maksimal 155 karakter)
3. keywords: Daftar kata kunci dipisahkan koma (maks 10)
4. suggestionCopy: Tips optimasi konten tambahan (maks 2 kalimat)`;

    const ai = getGenAIClient();
    if (!ai) {
      const simulatedSEO = {
        title: `Top Up ${gameName} Murah Meriah Instan & Otomatis 24 Jam`,
        description: `Beli Diamond/Crystals ${gameName} murah kilat 24 Jam otomatis masuk 1 detik! Bayar aman via QRIS, bank transfer, e-wallet.`,
        keywords: `top up ${gameName}, beli diamond ${gameName}, top up otomatis, top up murah`,
        suggestionCopy: "Persiapan lengkap: Berikan konten panduan cara topup di landing page game Anda untuk meroketkan peringkat Google Search Console!"
      };
      return res.json({
        success: true,
        source: "LOCAL_GUARDIAN_OPTIMIZED",
        note: "API Key belum terpasang di panel Secrets. Layanan asisten SEO diaktifkan dalam mode aman hemat biaya.",
        data: simulatedSEO
      });
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const rawText = response.text || "";
      const parsedData = JSON.parse(rawText.trim());
      res.json({
        success: true,
        source: "GEMINI_COGNITIVE_LIVE",
        data: parsedData
      });
    } catch (e: any) {
      console.error("Gemini Generation Error:", e);
      res.status(500).json({
        error: "Gagal membuat panduan SEO dari Gemini AI.",
        details: e.message
      });
    }
  });

  // 9. Reset simulated DB endpoint for clean testing demo reset
  app.post("/api/demo/reset", async (req, res) => {
    currentGames = [...SEED_GAMES];
    currentProducts = [...SEED_PRODUCTS];
    currentPayments = [...SEED_PAYMENTS];
    currentVouchers = [...SEED_VOUCHERS];
    currentOrders = [...SEED_ORDERS];

    if (prisma) {
      try {
        // Safe truncated reset sequence
        await prisma.transaction.deleteMany();
        await prisma.webhookLog.deleteMany();
        console.log("[Prisma] Transactions and Webhook Logs reset completed.");
      } catch (e) {
        console.warn("[Prisma] Database truncation failed during reset:", e);
      }
    }

    res.json({ success: true, message: "Data Demo Berhasil Direset ke Posisi Awal!" });
  });

  // Vite development server config
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    // Prod serving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Express] Game Store Server is running on http://localhost:${PORT}`);
  });
}

startServer();
