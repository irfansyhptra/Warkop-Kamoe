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
      totalAmount,
      deliveryInfo,
      paymentMethod,
      estimatedDeliveryTime,
    } = body;

    // Validation
    if (
      !items ||
      items.length === 0 ||
      !totalAmount ||
      !deliveryInfo ||
      !paymentMethod
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate unique order ID
    const orderId = `ORDER-${Date.now()}`;

    const order = await Order.create({
      orderId,
      userId: currentUser.userId,
      items,
      totalAmount,
      status: "pending",
      deliveryInfo,
      paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "pending" : "pending",
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
