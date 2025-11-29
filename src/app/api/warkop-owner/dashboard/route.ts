import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import MenuItem from "@/models/MenuItem";
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

    // Verify user is warkop owner
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== "warkop_owner") {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const warkopId = user.warkopId;

    if (!warkopId) {
      return NextResponse.json(
        { error: "Warkop tidak ditemukan" },
        { status: 404 }
      );
    }

    // Get menu statistics
    const [totalMenuItems, availableItems] = await Promise.all([
      MenuItem.countDocuments({ warkopId }),
      MenuItem.countDocuments({ warkopId, availability: "available" }),
    ]);

    // Get order statistics
    const [totalOrders, pendingOrders] = await Promise.all([
      Order.countDocuments({ warkopId }),
      Order.countDocuments({ warkopId, status: "pending" }),
    ]);

    // Calculate today's revenue
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = await Order.find({
      warkopId,
      createdAt: { $gte: today },
      status: { $ne: "cancelled" },
    });
    const todayRevenue = todayOrders.reduce(
      (sum, order) => sum + (order.totalPrice || 0),
      0
    );

    // Calculate monthly revenue
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthlyOrders = await Order.find({
      warkopId,
      createdAt: { $gte: startOfMonth },
      status: { $ne: "cancelled" },
    });
    const monthlyRevenue = monthlyOrders.reduce(
      (sum, order) => sum + (order.totalPrice || 0),
      0
    );

    // Get top selling items
    const orders = await Order.find({
      warkopId,
      status: { $ne: "cancelled" },
    }).populate("items.menuItem");

    // Calculate item sales
    interface OrderItem {
      menuItem: {
        _id: { toString: () => string };
        name: string;
        price: number;
      };
      quantity: number;
    }

    const itemSales: {
      [key: string]: {
        menuItem: { name: string; price: number };
        quantity: number;
        revenue: number;
      };
    } = {};

    orders.forEach((order) => {
      order.items.forEach((item: OrderItem) => {
        if (item.menuItem && item.menuItem._id) {
          const itemId = item.menuItem._id.toString();
          if (!itemSales[itemId]) {
            itemSales[itemId] = {
              menuItem: {
                name: item.menuItem.name,
                price: item.menuItem.price,
              },
              quantity: 0,
              revenue: 0,
            };
          }
          itemSales[itemId].quantity += item.quantity;
          itemSales[itemId].revenue += item.menuItem.price * item.quantity;
        }
      });
    });

    const topSellingItems = Object.values(itemSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Get recent orders
    const recentOrders = await Order.find({ warkopId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("customerName totalPrice status createdAt");

    return NextResponse.json({
      success: true,
      data: {
        totalMenuItems,
        availableItems,
        totalOrders,
        pendingOrders,
        todayRevenue,
        monthlyRevenue,
        topSellingItems,
        recentOrders: recentOrders.map((order) => ({
          id: order._id.toString(),
          customerName: order.customerName,
          totalPrice: order.totalPrice,
          status: order.status,
          createdAt: order.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching warkop owner dashboard:", error);
    return NextResponse.json(
      { error: "Gagal memuat data dashboard" },
      { status: 500 }
    );
  }
}
