export enum OrderStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  PROCESSING = "PROCESSING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  REFUND = "REFUND"
}

export interface Game {
  id: string;
  slug: string;
  name: string;
  logo: string;
  banner: string;
  publisher: string;
  status: "ACTIVE" | "INACTIVE";
  sortOrder: number;
  inputPlaceholder: string;
  hasServer?: boolean;
  seoMeta: {
    title: string;
    description: string;
    keywords: string;
  };
}

export interface Product {
  id: string;
  gameId: string;
  name: string;
  priceSupplier: number;
  priceFinal: number;
  originalPrice?: number; // for flash sale
  sku: string;
  status: "ACTIVE" | "INACTIVE";
  isFlashSale?: boolean;
  flashSalePrice?: number;
  flashSaleQuota?: number;
}

export type PaymentMethodType = "QRIS" | "EWALLET" | "VA" | "TRANSFER";

export interface PaymentMethod {
  id: string;
  name: string;
  type: PaymentMethodType;
  feeFixed: number;
  feePercent: number;
  logo: string;
  status: "ACTIVE" | "INACTIVE";
}

export interface Voucher {
  code: string;
  discountMax: number;
  minPurchase: number;
  quota: number;
  used: number;
  status: "ACTIVE" | "INACTIVE";
  expiryDate: string;
}

export interface Order {
  id: string; // SKU code/Invoice e.g. INV-20260524-10043
  gameId: string;
  gameName: string;
  gameSlug: string;
  productId: string;
  productName: string;
  userUid: string;
  userServer?: string;
  priceSupplier: number;
  priceBase: number; // calculated according to pricing rules before discount
  priceFinal: number; // the final price the user must pay
  voucherApplied?: string;
  discountAmount: number;
  paymentMethodId: string;
  paymentMethodName: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  supplierUsed: string; // e.g., "Digiflazz", "VIP Reseller", "IAK"
  supplierStatus: string;
  log?: string[];
}

export interface MarginTier {
  minPrice: number;
  maxPrice: number;
  marginPercent?: number; // e.g. 10 for 10%
  marginFixed?: number;   // e.g. 1500 for Rp1500
}

export interface AppSettings {
  siteName: string;
  siteTitle: string;
  siteDescription: string;
  telegramBotToken: string;
  telegramChatId: string;
  webhookUrl: string;
  supplierSyncEnabled: boolean;
  minimumProfitLow: number;  // Default Rp 500
  minimumProfitMed: number;  // Default Rp 1000
  minimumProfitHigh: number; // Default Rp 2000
}

export interface WebhookLog {
  id: string;
  timestamp: string;
  provider: string; // e.g. "Tripay", "Digiflazz"
  type: "INBOUND" | "OUTBOUND";
  payload: string;
  statusCode: number;
}
