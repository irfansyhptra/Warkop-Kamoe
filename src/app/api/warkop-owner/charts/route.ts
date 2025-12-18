import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import MenuItem from "@/models/MenuItem";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const currentUser = requireAuth(request);

    // Only warkop_owner can access this
    if (currentUser.role !== "warkop_owner") {
      return NextResponse.json(
        { error: "Access denied. Only warkop owners can access this." },
        { status: 403 }
      );
    }

    const warkopId = currentUser.warkopId;
    if (!warkopId) {
      return NextResponse.json({
        success: true,
        data: {
          dailyRevenue: [],
          weeklyRevenue: [],
          monthlyRevenue: [],
          topSellingItems: [],
          ordersByStatus: [],
          revenueByPaymentMethod: [],
        },
      });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "30d";

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    switch (range) {
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get all orders for this warkop in the date range
    const orders = await Order.find({
      warkopId,
      createdAt: { $gte: startDate },
    }).lean();

    // Calculate daily revenue
    const dailyMap = new Map<string, { revenue: number; orders: number }>();
    const daysInRange = range === "7d" ? 7 : range === "90d" ? 90 : 30;

    // Initialize all days in range
    for (let i = daysInRange - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateKey = date.toISOString().split("T")[0];
      dailyMap.set(dateKey, { revenue: 0, orders: 0 });
    }

    // Aggregate order data
    const statusCount = new Map<string, number>();
    const paymentMethodMap = new Map<string, { revenue: number; count: number }>();
    const itemSalesMap = new Map<string, { name: string; quantity: number; revenue: number }>();

    for (const order of orders) {
      const orderDate = new Date(order.createdAt as Date);
      const dateKey = orderDate.toISOString().split("T")[0];

      // Daily revenue
      if (dailyMap.has(dateKey)) {
        const current = dailyMap.get(dateKey)!;
        dailyMap.set(dateKey, {
          revenue: current.revenue + (order.totalAmount || 0),
          orders: current.orders + 1,
        });
      }

      // Status count
      const status = order.status || "pending";
      statusCount.set(status, (statusCount.get(status) || 0) + 1);

      // Payment method
      const paymentMethod = order.paymentDetails?.method || "cod";
      const pmCurrent = paymentMethodMap.get(paymentMethod) || { revenue: 0, count: 0 };
      paymentMethodMap.set(paymentMethod, {
        revenue: pmCurrent.revenue + (order.totalAmount || 0),
        count: pmCurrent.count + 1,
      });

      // Item sales
      if (order.items && Array.isArray(order.items)) {
        for (const item of order.items) {
          const itemKey = item.menuItemId || item.name;
          const current = itemSalesMap.get(itemKey) || {
            name: item.name,
            quantity: 0,
            revenue: 0,
          };
          itemSalesMap.set(itemKey, {
            name: item.name,
            quantity: current.quantity + (item.quantity || 1),
            revenue: current.revenue + (item.price || 0) * (item.quantity || 1),
          });
        }
      }
    }

    // Convert maps to arrays
    const dailyRevenue = Array.from(dailyMap.entries()).map(([date, data]) => ({
      date,
      revenue: data.revenue,
      orders: data.orders,
    }));

    const ordersByStatus = Array.from(statusCount.entries()).map(([status, count]) => ({
      status,
      count,
    }));

    const revenueByPaymentMethod = Array.from(paymentMethodMap.entries()).map(
      ([method, data]) => ({
        method,
        revenue: data.revenue,
        count: data.count,
      })
    );

    const topSellingItems = Array.from(itemSalesMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    return NextResponse.json({
      success: true,
      data: {
        dailyRevenue,
        weeklyRevenue: [], // Can be computed if needed
        monthlyRevenue: [], // Can be computed if needed
        topSellingItems,
        ordersByStatus,
        revenueByPaymentMethod,
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Get charts error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
