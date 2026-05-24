/**
 * Tripay Webhook Gateway Ingest Router
 * Processes incoming payment responses safely.
 * Verifies signature hash authenticity to prevent invoice manipulation.
 */

import { OrderStatus } from "../types";
import { PaymentService } from "../services/payment";

export class TripayWebhookHandler {
  private paymentService: PaymentService;

  constructor() {
    this.paymentService = new PaymentService();
  }

  /**
   * Processes inbound webhook triggers verifying signature matrices.
   */
  async handleInboundPayment(payload: {
    reference: string;
    merchant_ref: string;
    status: "PAID" | "UNPAID" | "EXPIRED" | "FAILED";
    signature: string;
    amount: number;
  }): Promise<{
    handled: boolean;
    orderId: string;
    nextState: OrderStatus;
    errorMessage?: string;
  }> {
    const rawStringRep = JSON.stringify({ reference: payload.reference, ref: payload.merchant_ref, amt: payload.amount });
    
    // Auth validity checks
    const hashIsValid = this.paymentService.verifyWebhookSignature({
      jsonPayload: rawStringRep,
      receivedSignature: payload.signature
    });

    if (!hashIsValid) {
      console.warn(`[Webhook Breach Attempt] Received unauthorized payment attempt on Invoice ${payload.merchant_ref}`);
      return {
        handled: false,
        orderId: payload.merchant_ref,
        nextState: OrderStatus.PENDING,
        errorMessage: "Ungoverned signature verification failed"
      };
    }

    let targetState = OrderStatus.PENDING;
    if (payload.status === "PAID") {
      targetState = OrderStatus.PAID;
      console.log(`[Webhook Fulfillment Trigger] Invoice ${payload.merchant_ref} paid with SUCCESS. Triggering supplier dispatch.`);
    } else if (payload.status === "EXPIRED" || payload.status === "FAILED") {
      targetState = OrderStatus.FAILED;
    }

    return {
      handled: true,
      orderId: payload.merchant_ref,
      nextState: targetState
    };
  }
}
