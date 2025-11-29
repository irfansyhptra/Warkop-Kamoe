import { Schema, model, models } from "mongoose";

export interface IMenuItem {
  _id?: string;
  warkopId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  availability: "available" | "unavailable" | "out_of_stock";
  isRecommended: boolean;
  ingredients?: string[];
  protein?: number;
  calories?: number;
  preparationTime?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const MenuItemSchema = new Schema<IMenuItem>(
  {
    warkopId: {
      type: String,
      required: [true, "Warkop ID is required"],
    },
    name: {
      type: String,
      required: [true, "Menu name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
    },
    image: {
      type: String,
    },
    availability: {
      type: String,
      enum: ["available", "unavailable", "out_of_stock"],
      default: "available",
    },
    isRecommended: {
      type: Boolean,
      default: false,
    },
    ingredients: [
      {
        type: String,
      },
    ],
    protein: Number,
    calories: Number,
    preparationTime: Number,
  },
  {
    timestamps: true,
  }
);

// Indexes
MenuItemSchema.index({ warkopId: 1 });
MenuItemSchema.index({ category: 1 });
MenuItemSchema.index({ availability: 1 });

const MenuItem =
  models.MenuItem || model<IMenuItem>("MenuItem", MenuItemSchema);

export default MenuItem;
