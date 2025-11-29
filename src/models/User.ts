import { Schema, model, models } from "mongoose";

export interface IUser {
  _id?: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: "customer" | "warkop_owner" | "admin";
  profileImage?: string;
  address?: string;
  warkopId?: string;
  isVerified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["customer", "warkop_owner", "admin"],
      default: "customer",
    },
    profileImage: {
      type: String,
    },
    address: {
      type: String,
    },
    warkopId: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });

const User = models.User || model<IUser>("User", UserSchema);

export default User;
