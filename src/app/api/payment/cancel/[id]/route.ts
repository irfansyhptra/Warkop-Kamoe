import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import { requireAuth } from "@/lib/auth";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * POST /api/payment/cancel/[id]
 * Cancel a pending payment and order
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();

    const currentUser = requireAuth(request);
    const { id: orderId } = await params;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Find order
    const order = await Order.findOne({ orderId });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Check ownership (customer can only cancel their own orders)
    if (
      currentUser.role === "customer" &&
      order.userId !== currentUser.userId
    ) {
      return NextResponse.json(
        { success: false, error: "Unauthorized to cancel this order" },
        { status: 403 }
      );
    }

    // Check if order can be cancelled
    if (!["pending", "confirmed"].includes(order.status)) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot cancel order with status: ${order.status}`,
        },
        { status: 400 }
      );
    }

    // Get cancellation reason from request body
    const body = await request.json().catch(() => ({}));
    const { reason = "Cancelled by user" } = body;

    // Update order status to cancelled
    await Order.findByIdAndUpdate(order._id, {
      status: "cancelled",
      paymentStatus: order.paymentStatus === "paid" ? "refunded" : "cancelled",
      $push: {
        orderHistory: {
          status: "cancelled",
          timestamp: new Date(),
          notes: reason,
          updatedBy: currentUser.userId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Order cancelled successfully",
      data: {
        orderId,
        status: "cancelled",
        reason,
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    console.error("Cancel payment error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
