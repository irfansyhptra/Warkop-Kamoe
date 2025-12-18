import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const currentUser = requireAuth(request);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const userId = searchParams.get("userId");

    const query: Record<string, unknown> = {};

    // Regular users can only see their own orders
    if (currentUser.role === "customer") {
      query.userId = currentUser.userId;
    } else if (userId) {
      query.userId = userId;
    }

    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: { orders },
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Get orders error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const currentUser = requireAuth(request);
    const body = await request.json();
    const {
      items,
      totalAmount: providedTotal,
      deliveryInfo,
      paymentMethod,
      estimatedDeliveryTime,
      subtotal: providedSubtotal,
      deliveryFee: providedDeliveryFee,
      serviceFee: providedServiceFee,
      discount: providedDiscount,
      warkopId: providedWarkopId,
      warkopName: providedWarkopName,
    } = body;

    // Validation
    if (!items || items.length === 0 || !deliveryInfo || !paymentMethod) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate unique order ID
    const orderId = `ORDER-${Date.now()}`;

    // Compute subtotal and fees if not provided
    const computedSubtotal = providedSubtotal
      ? Number(providedSubtotal)
      : items.reduce((s: number, it: any) => s + (Number(it.price) || 0) * (Number(it.quantity) || 0), 0);

    const deliveryFee = typeof providedDeliveryFee !== "undefined" ? Number(providedDeliveryFee) : 0;
    const serviceFee = typeof providedServiceFee !== "undefined" ? Number(providedServiceFee) : 0;
    const discount = typeof providedDiscount !== "undefined" ? Number(providedDiscount) : 0;

    const totalAmount = providedTotal
      ? Number(providedTotal)
      : Math.max(0, computedSubtotal + deliveryFee + serviceFee - discount);

    const warkopId = providedWarkopId || (items[0] && items[0].warkopId) || "";
    const warkopName = providedWarkopName || (items[0] && items[0].warkopName) || "";

    const order = await Order.create({
      orderId,
      userId: currentUser.userId,
      warkopId,
      warkopName,
      items,
      subtotal: computedSubtotal,
      deliveryFee,
      serviceFee,
      discount,
      totalAmount,
      status: "pending",
      deliveryInfo,
      paymentStatus: paymentMethod === "cod" ? "pending" : "pending",
      paymentDetails: {
        method: paymentMethod,
      },
      estimatedDeliveryTime,
      orderHistory: [
        {
          status: "pending",
          timestamp: new Date(),
          notes: "Order created",
        },
      ],
    });

    return NextResponse.json(
      {
        success: true,
        message: "Order created successfully",
        data: { order },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
