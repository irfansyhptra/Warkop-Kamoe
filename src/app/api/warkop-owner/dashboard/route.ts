import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import MenuItem from "@/models/MenuItem";
import Order from "@/models/Order";
import Warkop from "@/models/Warkop";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get("authorization")?.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Token tidak ditemukan" },
        { status: 401 }
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    } catch {
      return NextResponse.json({ success: false, error: "Token tidak valid" }, { status: 401 });
    }

    await connectDB();

    // Verify user is warkop owner
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== "warkop_owner") {
      return NextResponse.json({ success: false, error: "Akses ditolak" }, { status: 403 });
    }

    const warkopId = user.warkopId;

    if (!warkopId) {
      // User belum setup warkop
      return NextResponse.json({
        success: true,
        data: {
          hasWarkop: false,
          totalMenuItems: 0,
          availableItems: 0,
          totalOrders: 0,
          pendingOrders: 0,
          todayRevenue: 0,
          monthlyRevenue: 0,
          topSellingItems: [],
          recentOrders: [],
        },
      });
    }

    // Get warkop details
    const warkop = await Warkop.findById(warkopId);

    // Get menu statistics
    const [totalMenuItems, availableItems] = await Promise.all([
      MenuItem.countDocuments({ warkopId }),
      MenuItem.countDocuments({ warkopId, isAvailable: true }),
    ]);

    // Get order statistics
    const [totalOrders, pendingOrders] = await Promise.all([
      Order.countDocuments({ warkopId }),
      Order.countDocuments({ warkopId, status: { $in: ["pending", "confirmed"] } }),
    ]);

    // Calculate today's revenue
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = await Order.find({
      warkopId,
      createdAt: { $gte: today },
      paymentStatus: "paid",
      status: { $ne: "cancelled" },
    });
    const todayRevenue = todayOrders.reduce(
      (sum, order) => sum + (order.totalAmount || 0),
      0
    );

    // Calculate monthly revenue
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthlyOrders = await Order.find({
      warkopId,
      createdAt: { $gte: startOfMonth },
      paymentStatus: "paid",
      status: { $ne: "cancelled" },
    });
    const monthlyRevenue = monthlyOrders.reduce(
      (sum, order) => sum + (order.totalAmount || 0),
      0
    );

    // Get top selling items from orders
    const orders = await Order.find({
      warkopId,
      status: { $ne: "cancelled" },
    });

    // Calculate item sales
    interface ItemSaleData {
      menuItem: { name: string; price: number };
      quantity: number;
      revenue: number;
    }

    const itemSales: { [key: string]: ItemSaleData } = {};

    orders.forEach((order) => {
      order.items.forEach((item: {
        menuItemId: string;
        name: string;
        price: number;
        quantity: number;
      }) => {
        const itemId = item.menuItemId.toString();
        if (!itemSales[itemId]) {
          itemSales[itemId] = {
            menuItem: {
              name: item.name,
              price: item.price,
            },
            quantity: 0,
            revenue: 0,
          };
        }
        itemSales[itemId].quantity += item.quantity;
        itemSales[itemId].revenue += item.price * item.quantity;
      });
    });

    const topSellingItems = Object.values(itemSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Get recent orders
    const recentOrders = await Order.find({ warkopId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("orderId totalAmount status paymentStatus deliveryInfo createdAt");

    return NextResponse.json({
      success: true,
      data: {
        hasWarkop: true,
        warkopName: warkop?.name || "Warkop Saya",
        totalMenuItems,
        availableItems,
        totalOrders,
        pendingOrders,
        todayRevenue,
        monthlyRevenue,
        topSellingItems,
        recentOrders: recentOrders.map((order) => ({
          id: order._id.toString(),
          orderId: order.orderId,
          customerName: order.deliveryInfo?.name || "N/A",
          totalPrice: order.totalAmount,
          status: order.status,
          paymentStatus: order.paymentStatus,
          createdAt: order.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching warkop owner dashboard:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat data dashboard" },
      { status: 500 }
    );
  }
}
