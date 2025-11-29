import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Warkop from "@/models/Warkop";
import Order from "@/models/Order";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get("authorization")?.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { error: "Token tidak ditemukan" },
        { status: 401 }
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    } catch {
      return NextResponse.json({ error: "Token tidak valid" }, { status: 401 });
    }

    await connectDB();

    // Verify user is admin
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    // Get statistics
    const [totalUsers, totalWarkops, totalOrders, pendingOrders] =
      await Promise.all([
        User.countDocuments(),
        Warkop.countDocuments(),
        Order.countDocuments(),
        Order.countDocuments({ status: "pending" }),
      ]);

    // Calculate total revenue
    const orders = await Order.find({ status: { $ne: "cancelled" } });
    const totalRevenue = orders.reduce(
      (sum, order) => sum + (order.totalPrice || 0),
      0
    );

    // Get recent users (last 5)
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email role createdAt");

    // Get recent warkops (last 5)
    const recentWarkops = await Warkop.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name location createdAt");

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalWarkops,
        totalOrders,
        pendingOrders,
        totalRevenue,
        recentUsers: recentUsers.map((u) => ({
          id: u._id.toString(),
          name: u.name,
          email: u.email,
          role: u.role,
          createdAt: u.createdAt,
        })),
        recentWarkops: recentWarkops.map((w) => ({
          id: w._id.toString(),
          name: w.name,
          location: w.location,
          createdAt: w.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching admin dashboard:", error);
    return NextResponse.json(
      { error: "Gagal memuat data dashboard" },
      { status: 500 }
    );
  }
}
