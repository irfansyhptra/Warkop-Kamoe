import mongoose, { Schema, model, models } from "mongoose";

export interface IWarkop {
  _id?: string;
  name: string;
  description: string;
  ownerId: string;
  images: string[];
  address: string;
  city: string;
  phone: string;
  openingHours: {
    day: string;
    open: string;
    close: string;
    isOpen: boolean;
  }[];
  categories: string[];
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  isActive: boolean;
  latitude?: number;
  longitude?: number;
  facilities: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const WarkopSchema = new Schema<IWarkop>(
  {
    name: {
      type: String,
      required: [true, "Warkop name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    ownerId: {
      type: String,
      required: [true, "Owner ID is required"],
    },
    images: [
      {
        type: String,
      },
    ],
    address: {
      type: String,
      required: [true, "Address is required"],
    },
    city: {
      type: String,
      required: [true, "City is required"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
    },
    openingHours: [
      {
        day: String,
        open: String,
        close: String,
        isOpen: Boolean,
      },
    ],
    categories: [
      {
        type: String,
      },
    ],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    latitude: Number,
    longitude: Number,
    facilities: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
WarkopSchema.index({ ownerId: 1 });
WarkopSchema.index({ city: 1 });
WarkopSchema.index({ isActive: 1, isVerified: 1 });

const Warkop = models.Warkop || model<IWarkop>("Warkop", WarkopSchema);

export default Warkop;
