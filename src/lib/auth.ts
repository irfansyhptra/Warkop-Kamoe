import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

export interface JWTPayload {
  userId: string;
  email: string;
  role: "customer" | "warkop_owner" | "admin";
  warkopId?: string;
}

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
};

export const getUserFromRequest = (request: NextRequest): JWTPayload | null => {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    return null;
  }

  return verifyToken(token);
};

export const requireAuth = (request: NextRequest) => {
  const user = getUserFromRequest(request);

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
};

export const requireAdmin = (request: NextRequest) => {
  const user = requireAuth(request);

  if (user.role !== "admin") {
    throw new Error("Forbidden: Admin access required");
  }

  return user;
};

export const requireWarkopOwner = (request: NextRequest) => {
  const user = requireAuth(request);

  if (user.role !== "warkop_owner" && user.role !== "admin") {
    throw new Error("Forbidden: Warkop owner access required");
  }

  return user;
};
