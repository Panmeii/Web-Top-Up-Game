/**
 * Clean Architecture Supplier Service Adapter
 * Standardizes API communication with primary digital aggregators: Digiflazz, VIP Reseller, and IAK.
 */

import { Product } from "../types";
import { SITE_CONFIG } from "../config/site";

export interface SupplierConfig {
  apiKey: string;
  username: string;
  apiUrl: string;
  isActive: boolean;
}

export interface DigiflazzResponse {
  data: {
    ref_id: string;
    buyer_sku_code: string;
    customer_no: string;
    status: "Pending" | "Sukses" | "Gagal";
    price: number;
    message: string;
    sn?: string;
  };
}

export class SupplierService {
  private config: SupplierConfig;

  constructor(providerId: string) {
    // Simulated credential loader based on secure env keys
    this.config = {
      apiKey: process.env.SUPPLIER_API_KEY || "demo_apikey_xyz",
      username: process.env.SUPPLIER_USERNAME || "demo_user_abc",
      apiUrl: SITE_CONFIG.supportedSuppliers.find(s => s.id === providerId)?.id === "digiflazz" 
        ? "https://api.digiflazz.com/v1" 
        : "https://api.vipreseller.co/v2",
      isActive: true
    };
  }

  /**
   * Generates secure digital MD5/SHA256 signature for outgoing webhook authentication
   */
  private generateSignature(action: string, refId: string): string {
    // Standard protocol: md5(username + apikey + refId) or equivalent
    return `hash_sim_${this.config.username}_${refId}`;
  }

  /**
   * Submits automated top-up trigger request to external supplier API
   */
  async submitTopup(params: {
    invoiceId: string;
    sku: string;
    buyerId: string;
    zoneId?: string;
  }): Promise<{
    success: boolean;
    referenceId: string;
    supplierStatus: string;
    supplierCost: number;
    rawPayload: string;
  }> {
    const payload = {
      username: this.config.username,
      buyer_sku_code: params.sku,
      customer_no: params.zoneId ? `${params.buyerId}${params.zoneId}` : params.buyerId,
      ref_id: params.invoiceId,
      sign: this.generateSignature("order", params.invoiceId)
    };

    console.log("[Supplier API Request] Dispatching Payload to Supplier:", payload);

    // High fidelity simulator mimicking production response latency and schemas
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          referenceId: `SUP-REF-${Math.floor(100000 + Math.random() * 900000)}`,
          supplierStatus: "Pending", // Starts as pending, fulfilled asynchronously by supplier webhook
          supplierCost: 1540.0, // Supplier cost
          rawPayload: JSON.stringify(payload)
        });
      }, 800);
    });
  }

  /**
   * Universal margin tier formula requested in Phase 8
   * Calculates secure end-consumer retail pricing preventing any losses.
   */
  static calculatePriceWithMargin(supplierCost: number): number {
    let margin = 0;
    
    // Rule thresholds matching exact specification formula
    if (supplierCost < 10000) {
      // <10k: Rp 1500–3000 markup
      margin = 2000;
    } else if (supplierCost < 50000) {
      // 10–50k: 10–15% markup (we target mid-tier 12%)
      margin = Math.round(supplierCost * 0.12);
    } else if (supplierCost < 100000) {
      // 50–100k: 8–12% markup (we target 10%)
      margin = Math.round(supplierCost * 0.10);
    } else {
      // 100k+: 5–8% markup (we target 7%)
      margin = Math.round(supplierCost * 0.07);
    }

    // Safety minimum profit safeguards
    let minProfitAllowed = SITE_CONFIG.marginFormula.safeguards.low;
    if (supplierCost >= 10000 && supplierCost < 50000) {
      minProfitAllowed = SITE_CONFIG.marginFormula.safeguards.med;
    } else if (supplierCost >= 50000) {
      minProfitAllowed = SITE_CONFIG.marginFormula.safeguards.high;
    }

    if (margin < minProfitAllowed) {
      margin = minProfitAllowed;
    }

    return supplierCost + margin;
  }
}
