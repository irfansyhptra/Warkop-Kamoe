import midtransClient from "midtrans-client";
import crypto from "crypto";

// Midtrans Configuration
const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";

// Snap Client for creating transactions
export const snap = new midtransClient.Snap({
  isProduction: isProduction,
  serverKey: process.env.MIDTRANS_SERVER_KEY || "",
  clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
});

// Core API Client for checking transaction status
export const coreApi = new midtransClient.CoreApi({
  isProduction: isProduction,
  serverKey: process.env.MIDTRANS_SERVER_KEY || "",
  clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
});

// Transaction Parameter Interface
export interface TransactionDetails {
  orderId: string;
  grossAmount: number;
}

export interface CustomerDetails {
  firstName: string;
  lastName?: string;
  email: string;
  phone: string;
  billingAddress?: {
    firstName: string;
    lastName?: string;
    phone: string;
    address: string;
    city: string;
    postalCode?: string;
    countryCode?: string;
  };
  shippingAddress?: {
    firstName: string;
    lastName?: string;
    phone: string;
    address: string;
    city: string;
    postalCode?: string;
    countryCode?: string;
  };
}

export interface ItemDetails {
  id: string;
  price: number;
  quantity: number;
  name: string;
  brand?: string;
  category?: string;
  merchantName?: string;
}

export interface MidtransTransactionParams {
  transaction_details: {
    order_id: string;
    gross_amount: number;
  };
  customer_details?: {
    first_name: string;
    last_name?: string;
    email: string;
    phone: string;
    billing_address?: {
      first_name: string;
      last_name?: string;
      phone: string;
      address: string;
      city: string;
      postal_code?: string;
      country_code?: string;
    };
    shipping_address?: {
      first_name: string;
      last_name?: string;
      phone: string;
      address: string;
      city: string;
      postal_code?: string;
      country_code?: string;
    };
  };
  item_details?: {
    id: string;
    price: number;
    quantity: number;
    name: string;
    brand?: string;
    category?: string;
    merchant_name?: string;
  }[];
  enabled_payments?: string[];
  callbacks?: {
    finish?: string;
    error?: string;
    pending?: string;
  };
  expiry?: {
    start_time?: string;
    unit: string;
    duration: number;
  };
  custom_field1?: string;
  custom_field2?: string;
  custom_field3?: string;
}

/**
 * Create Snap Transaction Token
 * Returns a token to be used in Snap payment popup
 */
export async function createSnapTransaction(
  params: MidtransTransactionParams
): Promise<{ token: string; redirect_url: string }> {
  try {
    const transaction = await snap.createTransaction(params);
    return transaction;
  } catch (error) {
    console.error("Midtrans createTransaction error:", error);
    throw error;
  }
}

/**
 * Get Transaction Status
 * Check the status of a transaction by order ID
 */
export async function getTransactionStatus(orderId: string) {
  try {
    const status = await coreApi.transaction.status(orderId);
    return status;
  } catch (error) {
    console.error("Midtrans getTransactionStatus error:", error);
    throw error;
  }
}

/**
 * Cancel Transaction
 * Cancel a pending transaction
 */
export async function cancelTransaction(orderId: string) {
  try {
    const result = await coreApi.transaction.cancel(orderId);
    return result;
  } catch (error) {
    console.error("Midtrans cancelTransaction error:", error);
    throw error;
  }
}

/**
 * Expire Transaction
 * Expire a pending transaction
 */
export async function expireTransaction(orderId: string) {
  try {
    const result = await coreApi.transaction.expire(orderId);
    return result;
  } catch (error) {
    console.error("Midtrans expireTransaction error:", error);
    throw error;
  }
}

/**
 * Refund Transaction
 * Refund a settled transaction
 */
export async function refundTransaction(
  orderId: string,
  amount?: number,
  reason?: string
) {
  try {
    const params: { amount?: number; reason?: string } = {};
    if (amount) params.amount = amount;
    if (reason) params.reason = reason;

    const result = await coreApi.transaction.refund(orderId, params);
    return result;
  } catch (error) {
    console.error("Midtrans refundTransaction error:", error);
    throw error;
  }
}

/**
 * Verify Notification Signature
 * Verify webhook notification from Midtrans
 */
export function verifySignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  serverKey: string,
  signatureKey: string
): boolean {
  const hash = crypto
    .createHash("sha512")
    .update(orderId + statusCode + grossAmount + serverKey)
    .digest("hex");
  return hash === signatureKey;
}

/**
 * Map Midtrans transaction status to our payment status
 */
export function mapMidtransStatus(
  transactionStatus: string,
  fraudStatus?: string
): "pending" | "paid" | "failed" | "refunded" | "expired" {
  switch (transactionStatus) {
    case "capture":
      // For credit card transactions
      if (fraudStatus === "accept") {
        return "paid";
      } else if (fraudStatus === "challenge") {
        return "pending";
      }
      return "pending";
    case "settlement":
      return "paid";
    case "pending":
      return "pending";
    case "deny":
    case "cancel":
      return "failed";
    case "expire":
      return "expired";
    case "refund":
    case "partial_refund":
      return "refunded";
    default:
      return "pending";
  }
}

/**
 * Build transaction parameters for Snap
 */
export function buildTransactionParams(
  orderId: string,
  grossAmount: number,
  customer: CustomerDetails,
  items: ItemDetails[],
  callbackUrl?: string
): MidtransTransactionParams {
  const params: MidtransTransactionParams = {
    transaction_details: {
      order_id: orderId,
      gross_amount: grossAmount,
    },
    customer_details: {
      first_name: customer.firstName,
      last_name: customer.lastName,
      email: customer.email,
      phone: customer.phone,
    },
    item_details: items.map((item) => ({
      id: item.id,
      price: item.price,
      quantity: item.quantity,
      name: item.name.substring(0, 50), // Midtrans limits name to 50 chars
      brand: item.brand,
      category: item.category,
      merchant_name: item.merchantName || "Warkop Kamoe",
    })),
    // Enable all payment methods
    enabled_payments: [
      "credit_card",
      "bca_va",
      "bni_va",
      "bri_va",
      "permata_va",
      "other_va",
      "gopay",
      "shopeepay",
      "dana",
      "ovo",
      "qris",
      "indomaret",
      "alfamart",
    ],
    // Set transaction expiry to 24 hours
    expiry: {
      unit: "hours",
      duration: 24,
    },
  };

  // Add callback URLs if provided
  if (callbackUrl) {
    params.callbacks = {
      finish: `${callbackUrl}/order-tracking`,
      error: `${callbackUrl}/checkout?error=payment_failed`,
      pending: `${callbackUrl}/order-tracking`,
    };
  }

  // Add shipping address if customer has address
  if (customer.shippingAddress) {
    params.customer_details!.shipping_address = {
      first_name: customer.shippingAddress.firstName,
      last_name: customer.shippingAddress.lastName,
      phone: customer.shippingAddress.phone,
      address: customer.shippingAddress.address,
      city: customer.shippingAddress.city,
      postal_code: customer.shippingAddress.postalCode,
      country_code: customer.shippingAddress.countryCode || "IDN",
    };
  }

  return params;
}

// Named export for all midtrans utilities
export const midtransUtils = {
  snap,
  coreApi,
  createSnapTransaction,
  getTransactionStatus,
  cancelTransaction,
  expireTransaction,
  refundTransaction,
  verifySignature,
  mapMidtransStatus,
  buildTransactionParams,
};
