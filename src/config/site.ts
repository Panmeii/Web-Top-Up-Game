export const SITE_CONFIG = {
  name: "TopUpGamer",
  title: "Top Up Game Otomatis & Terlengkap - Rp0 Budget Startup",
  description: "Platform top up game digital instan 24 jam termurah, tercepat, dan termudah di Indonesia. Digiflazz & VIP Reseller integrated.",
  currency: {
    symbol: "Rp",
    code: "IDR"
  },
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || "5819401231:AAF_telegram_demo_token",
    chatId: process.env.TELEGRAM_CHAT_ID || "84192084"
  },
  marginFormula: {
    // Phase 8: Smart Pricing Rule Formula
    lowTierMaxAmount: 10000,
    lowTierMarginFixedMin: 1500,
    lowTierMarginFixedMax: 3000,
    
    medTierMaxAmount: 50000,
    medTierMarginPercentMin: 10,
    medTierMarginPercentMax: 15,
    
    highTierMaxAmount: 100000,
    highTierMarginPercentMin: 8,
    highTierMarginPercentMax: 12,
    
    ultraTierMarginPercentMin: 5,
    ultraTierMarginPercentMax: 8,

    // Profit protection minimums based on supplier costs
    safeguards: {
      low: 500,   // priceSupplier < 10000 -> Min Profit Rp500
      med: 1000,  // priceSupplier >= 10000 && priceSupplier < 50000 -> Min Profit Rp1000
      high: 2000  // priceSupplier >= 50000 -> Min Profit Rp2000
    }
  },
  supportedSuppliers: [
    { id: "digiflazz", name: "Digiflazz", enabled: true },
    { id: "vipreseller", name: "VIP Reseller", enabled: true },
    { id: "iak", name: "IAK", enabled: true },
    { id: "apigames", name: "Apigames", enabled: false }
  ],
  legal: {
    termsOfService: "/terms",
    privacyPolicy: "/privacy"
  }
};
