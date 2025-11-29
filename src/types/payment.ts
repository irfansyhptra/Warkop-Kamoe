// Payment Types for Warkop Kamoe

// Payment Methods
export type PaymentMethod = "cod" | "midtrans";

export type MidtransPaymentType =
  | "credit_card"
  | "bank_transfer"
  | "echannel"
  | "bca_va"
  | "bni_va"
  | "bri_va"
  | "permata_va"
  | "other_va"
  | "gopay"
  | "shopeepay"
  | "dana"
  | "ovo"
  | "qris"
  | "cstore"
  | "indomaret"
  | "alfamart"
  | "akulaku";

// Payment Status
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded" | "expired";

// Create Transaction Request
export interface CreateTransactionRequest {
  orderId: string;
  items: {
    menuItemId: string;
    warkopId: string;
    name: string;
    price: number;
    quantity: number;
    notes?: string;
    image?: string;
  }[];
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  deliveryInfo: {
    name: string;
    phone: string;
    address?: string;
    city?: string;
    postalCode?: string;
    notes?: string;
  };
  deliveryMethod: "delivery" | "pickup";
  deliveryFee: number;
  paymentMethod: PaymentMethod;
}

// Create Transaction Response
export interface CreateTransactionResponse {
  success: boolean;
  orderId: string;
  snapToken?: string;
  snapRedirectUrl?: string;
  message?: string;
  error?: string;
}

// Midtrans Notification Payload
export interface MidtransNotification {
  transaction_time: string;
  transaction_status: string;
  transaction_id: string;
  status_message: string;
  status_code: string;
  signature_key: string;
  settlement_time?: string;
  payment_type: string;
  order_id: string;
  merchant_id: string;
  gross_amount: string;
  fraud_status?: string;
  currency: string;
  // Bank transfer specific
  va_numbers?: Array<{
    bank: string;
    va_number: string;
  }>;
  // E-wallet specific
  payment_amounts?: Array<{
    amount: string;
    paid_at: string;
  }>;
  // QRIS specific
  acquirer?: string;
  // Convenience store specific
  store?: string;
  payment_code?: string;
}

// Payment Status Response
export interface PaymentStatusResponse {
  success: boolean;
  orderId: string;
  paymentStatus: PaymentStatus;
  transactionStatus?: string;
  paymentType?: string;
  transactionTime?: string;
  settlementTime?: string;
  grossAmount?: string;
  vaNumber?: string;
  bank?: string;
  message?: string;
  error?: string;
}

// Delivery Types
export type DeliveryMethod = "delivery" | "pickup";

export interface DeliveryFeeCalculation {
  baseFee: number;
  distanceFee: number;
  totalFee: number;
  distance: number;
  estimatedTime: string;
}

// Order Status for Tracking
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "on_delivery"
  | "delivered"
  | "cancelled";

export interface OrderStatusUpdate {
  orderId: string;
  status: OrderStatus;
  notes?: string;
  updatedBy?: string;
}

// Order Tracking Timeline Item
export interface OrderTimelineItem {
  status: OrderStatus;
  label: string;
  description: string;
  timestamp?: Date;
  isCompleted: boolean;
  isCurrent: boolean;
}

// Refund Request
export interface RefundRequest {
  orderId: string;
  amount?: number;
  reason: string;
}

// Refund Response
export interface RefundResponse {
  success: boolean;
  orderId: string;
  refundAmount: number;
  message?: string;
  error?: string;
}

// Payment Summary for Checkout
export interface PaymentSummary {
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  discount: number;
  total: number;
}

// Available Payment Methods Config
export interface PaymentMethodConfig {
  id: PaymentMethod | MidtransPaymentType;
  name: string;
  description: string;
  icon: string;
  isEnabled: boolean;
  minAmount?: number;
  maxAmount?: number;
}

// Default payment methods configuration
export const PAYMENT_METHODS: PaymentMethodConfig[] = [
  {
    id: "cod",
    name: "Cash on Delivery",
    description: "Bayar tunai saat pesanan diterima",
    icon: "💵",
    isEnabled: true,
  },
  {
    id: "qris",
    name: "QRIS",
    description: "Scan QR untuk pembayaran instan",
    icon: "📱",
    isEnabled: true,
  },
  {
    id: "gopay",
    name: "GoPay",
    description: "Bayar dengan GoPay",
    icon: "🟢",
    isEnabled: true,
  },
  {
    id: "shopeepay",
    name: "ShopeePay",
    description: "Bayar dengan ShopeePay",
    icon: "🟠",
    isEnabled: true,
  },
  {
    id: "dana",
    name: "DANA",
    description: "Bayar dengan DANA",
    icon: "🔵",
    isEnabled: true,
  },
  {
    id: "bca_va",
    name: "BCA Virtual Account",
    description: "Transfer via BCA",
    icon: "🏦",
    isEnabled: true,
  },
  {
    id: "bni_va",
    name: "BNI Virtual Account",
    description: "Transfer via BNI",
    icon: "🏦",
    isEnabled: true,
  },
  {
    id: "bri_va",
    name: "BRI Virtual Account",
    description: "Transfer via BRI",
    icon: "🏦",
    isEnabled: true,
  },
  {
    id: "permata_va",
    name: "Permata Virtual Account",
    description: "Transfer via Permata",
    icon: "🏦",
    isEnabled: true,
  },
];

// Order status labels for display
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Menunggu Pembayaran",
  confirmed: "Pesanan Dikonfirmasi",
  preparing: "Sedang Disiapkan",
  ready: "Siap Diambil/Diantar",
  on_delivery: "Sedang Diantar",
  delivered: "Pesanan Selesai",
  cancelled: "Dibatalkan",
};

// Payment status labels for display
export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Menunggu Pembayaran",
  paid: "Sudah Dibayar",
  failed: "Pembayaran Gagal",
  refunded: "Dana Dikembalikan",
  expired: "Kedaluwarsa",
};
