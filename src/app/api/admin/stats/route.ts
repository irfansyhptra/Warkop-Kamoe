import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Warkop from "@/models/Warkop";
import Order from "@/models/Order";
import MenuItem from "@/models/MenuItem";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    requireAdmin(request);

    // Get statistics
    const [
      totalUsers,
      totalWarkops,
      totalOrders,
      totalMenuItems,
      pendingOrders,
      todayOrders,
      verifiedWarkops,
    ] = await Promise.all([
      User.countDocuments(),
      Warkop.countDocuments(),
      Order.countDocuments(),
      MenuItem.countDocuments(),
      Order.countDocuments({ status: "pending" }),
      Order.countDocuments({
        createdAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      }),
      Warkop.countDocuments({ isVerified: true }),
    ]);

    // Get recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Calculate revenue
    const revenueData = await Order.aggregate([
      {
        $match: {
          status: { $in: ["delivered", "completed"] },
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    const totalRevenue = revenueData[0]?.totalRevenue || 0;

    // Get top warkops by orders
    const topWarkops = await Order.aggregate([
      {
        $unwind: "$items",
      },
      {
        $group: {
          _id: "$items.warkopId",
          orderCount: { $sum: 1 },
          revenue: { $sum: "$items.price" },
        },
      },
      {
        $sort: { orderCount: -1 },
      },
      {
        $limit: 5,
      },
    ]);

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalWarkops,
          totalOrders,
          totalMenuItems,
          pendingOrders,
          todayOrders,
          verifiedWarkops,
          totalRevenue,
        },
        recentOrders,
        topWarkops,
      },
    });
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      (error.message === "Unauthorized" || error.message.includes("Forbidden"))
    ) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Get admin stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
