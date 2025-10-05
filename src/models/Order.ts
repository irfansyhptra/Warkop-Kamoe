import mongoose, { Schema, model, models } from "mongoose";

export interface IOrder {
  _id?: string;
  orderId: string;
  userId: string;
  items: {
    menuItemId: string;
    warkopId: string;
    name: string;
    price: number;
    quantity: number;
    notes?: string;
  }[];
  totalAmount: number;
  status:
    | "pending"
    | "confirmed"
    | "preparing"
    | "ready"
    | "delivered"
    | "cancelled";
  deliveryInfo: {
    name: string;
    phone: string;
    address?: string;
    notes?: string;
  };
  paymentMethod: "cod" | "qris" | "transfer" | "ewallet";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  estimatedDeliveryTime?: string;
  orderHistory?: {
    status: string;
    timestamp: Date;
    notes?: string;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: String,
      required: [true, "User ID is required"],
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
        name: String,
        price: Number,
        quantity: Number,
        notes: String,
      },
    ],
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
        "delivered",
        "cancelled",
      ],
      default: "pending",
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
      notes: String,
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "qris", "transfer", "ewallet"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    estimatedDeliveryTime: String,
    orderHistory: [
      {
        status: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
        notes: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
OrderSchema.index({ orderId: 1 });
OrderSchema.index({ userId: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });

const Order = models.Order || model<IOrder>("Order", OrderSchema);

export default Order;
