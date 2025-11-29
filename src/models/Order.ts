import { Schema, model, models } from "mongoose";

// Sub-interfaces for better organization
export interface IOrderItem {
  menuItemId: string;
  warkopId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  image?: string;
}

export interface IDeliveryInfo {
  name: string;
  phone: string;
  address?: string;
  city?: string;
  postalCode?: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
}

export interface IDeliveryDetails {
  method: "delivery" | "pickup";
  fee: number;
  distance?: number;
  estimatedTime?: string;
  pickupTime?: string;
  driverName?: string;
  driverPhone?: string;
  driverNotes?: string;
  deliveredAt?: Date;
}

export interface IPaymentDetails {
  method: "cod" | "midtrans";
  midtransPaymentType?: string;
  transactionId?: string;
  snapToken?: string;
  snapRedirectUrl?: string;
  vaNumber?: string;
  bank?: string;
  qrCodeUrl?: string;
  expiryTime?: Date;
  paidAt?: Date;
  refundedAt?: Date;
  refundAmount?: number;
}

export interface IOrderHistory {
  status: string;
  timestamp: Date;
  notes?: string;
  updatedBy?: string;
}

export interface IOrder {
  _id?: string;
  orderId: string;
  userId: string;
  warkopId: string;
  warkopName: string;
  items: IOrderItem[];
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  discount: number;
  totalAmount: number;
  status:
    | "pending"
    | "confirmed"
    | "preparing"
    | "ready"
    | "on_delivery"
    | "delivered"
    | "cancelled";
  deliveryInfo: IDeliveryInfo;
  deliveryDetails: IDeliveryDetails;
  paymentStatus: "pending" | "paid" | "failed" | "refunded" | "expired";
  paymentDetails: IPaymentDetails;
  orderHistory: IOrderHistory[];
  estimatedDeliveryTime?: string;
  completedAt?: Date;
  cancelledAt?: Date;
  cancelReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: String,
      required: [true, "User ID is required"],
      index: true,
    },
    warkopId: {
      type: String,
      required: [true, "Warkop ID is required"],
      index: true,
    },
    warkopName: {
      type: String,
      required: [true, "Warkop name is required"],
    },
    items: [
      {
        menuItemId: {
          type: String,
          required: true,
        },
        warkopId: {
          type: String,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        notes: String,
        image: String,
      },
    ],
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    serviceFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: 0,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "preparing",
        "ready",
        "on_delivery",
        "delivered",
        "cancelled",
      ],
      default: "pending",
      index: true,
    },
    deliveryInfo: {
      name: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      address: String,
      city: String,
      postalCode: String,
      notes: String,
      latitude: Number,
      longitude: Number,
    },
    deliveryDetails: {
      method: {
        type: String,
        enum: ["delivery", "pickup"],
        required: true,
      },
      fee: {
        type: Number,
        default: 0,
      },
      distance: Number,
      estimatedTime: String,
      pickupTime: String,
      driverName: String,
      driverPhone: String,
      driverNotes: String,
      deliveredAt: Date,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded", "expired"],
      default: "pending",
      index: true,
    },
    paymentDetails: {
      method: {
        type: String,
        enum: ["cod", "midtrans"],
        required: true,
      },
      midtransPaymentType: String,
      transactionId: String,
      snapToken: String,
      snapRedirectUrl: String,
      vaNumber: String,
      bank: String,
      qrCodeUrl: String,
      expiryTime: Date,
      paidAt: Date,
      refundedAt: Date,
      refundAmount: Number,
    },
    orderHistory: [
      {
        status: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        notes: String,
        updatedBy: String,
      },
    ],
    estimatedDeliveryTime: String,
    completedAt: Date,
    cancelledAt: Date,
    cancelReason: String,
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ warkopId: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ paymentStatus: 1, createdAt: -1 });
OrderSchema.index({ "paymentDetails.transactionId": 1 });

// Static method to generate order ID
OrderSchema.statics.generateOrderId = function (): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `WK-${timestamp}-${random}`;
};

const Order = models.Order || model<IOrder>("Order", OrderSchema);

export default Order;
