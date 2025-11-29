import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import { requireAuth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const currentUser = requireAuth(request);
    const { id } = await context.params;

    const order = await Order.findOne({ orderId: id });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if user has access to this order
    if (
      currentUser.role === "customer" &&
      order.userId !== currentUser.userId
    ) {
      return NextResponse.json(
        { error: "Unauthorized to view this order" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { order },
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Get order error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    requireAuth(request);
    const { id } = await context.params;
    const body = await request.json();
    const { status, notes } = body;

    const order = await Order.findOne({ orderId: id });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Update status
    order.status = status || order.status;

    // Add to order history
    if (status) {
      order.orderHistory = order.orderHistory || [];
      order.orderHistory.push({
        status,
        timestamp: new Date(),
        notes: notes || `Status updated to ${status}`,
      });
    }

    await order.save();

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
      data: { order },
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Update order error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
