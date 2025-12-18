import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import { requireAuth } from "@/lib/auth";
import {
  createSnapTransaction,
  buildTransactionParams,
  CustomerDetails,
  ItemDetails,
} from "@/lib/midtrans";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * POST /api/payment/retry/[id]
 * Retry payment for an order with expired or failed payment
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

    // Check ownership
    if (
      currentUser.role === "customer" &&
      order.userId !== currentUser.userId
    ) {
      return NextResponse.json(
        { success: false, error: "Unauthorized to retry payment for this order" },
        { status: 403 }
      );
    }

    // Check if order can be retried
    if (!["pending", "failed", "expired"].includes(order.paymentStatus)) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot retry payment for order with payment status: ${order.paymentStatus}`,
        },
        { status: 400 }
      );
    }

    // Check if order is not cancelled
    if (order.status === "cancelled" || order.status === "delivered") {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot retry payment for ${order.status} order`,
        },
        { status: 400 }
      );
    }

    // Only allow retry for Midtrans payments
    if (order.paymentDetails?.method !== "midtrans") {
      return NextResponse.json(
        { success: false, error: "Payment retry is only available for Midtrans payments" },
        { status: 400 }
      );
    }

    try {
      // Get body for optional customer email update
      const body = await request.json().catch(() => ({}));
      const { customerEmail } = body;

      // Build customer details
      const customer: CustomerDetails = {
        firstName: order.deliveryInfo.name.split(" ")[0],
        lastName: order.deliveryInfo.name.split(" ").slice(1).join(" ") || "",
        email: customerEmail || `${currentUser.userId}@warkopkamoe.com`,
        phone: order.deliveryInfo.phone,
      };

      // Add shipping address if delivery
      if (order.deliveryDetails.method === "delivery" && order.deliveryInfo.address) {
        customer.shippingAddress = {
          firstName: order.deliveryInfo.name.split(" ")[0],
          lastName: order.deliveryInfo.name.split(" ").slice(1).join(" ") || "",
          phone: order.deliveryInfo.phone,
          address: order.deliveryInfo.address,
          city: order.deliveryInfo.city || "Indonesia",
        };
      }

      // Build item details from order items
      const itemDetails: ItemDetails[] = order.items.map((item: {
        menuItemId: { toString: () => string };
        name: string;
        price: number;
        quantity: number;
      }) => ({
        id: item.menuItemId.toString(),
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        merchantName: order.warkopName,
      }));

      // Add delivery fee if exists
      if (order.deliveryFee > 0) {
        itemDetails.push({
          id: "delivery-fee",
          name: "Ongkos Kirim",
          price: order.deliveryFee,
          quantity: 1,
        });
      }

      // Add service fee if exists
      if (order.serviceFee > 0) {
        itemDetails.push({
          id: "service-fee",
          name: "Biaya Layanan",
          price: order.serviceFee,
          quantity: 1,
        });
      }

      // Build transaction parameters with same order ID
      const transactionParams = buildTransactionParams(
        orderId,
        order.totalAmount,
        customer,
        itemDetails,
        process.env.NEXT_PUBLIC_API_URL
      );

      // Create new Snap transaction
      const snapResponse = await createSnapTransaction(transactionParams);

      // Update order with new Snap token and reset status
      await Order.findByIdAndUpdate(order._id, {
        paymentStatus: "pending",
        status: "pending",
        "paymentDetails.snapToken": snapResponse.token,
        "paymentDetails.snapRedirectUrl": snapResponse.redirect_url,
        $push: {
          orderHistory: {
            status: "pending",
            timestamp: new Date(),
            notes: "Payment retry initiated",
            updatedBy: currentUser.userId,
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: "Payment retry initiated successfully",
        data: {
          orderId,
          snapToken: snapResponse.token,
          snapRedirectUrl: snapResponse.redirect_url,
          totalAmount: order.totalAmount,
        },
      });
    } catch (midtransError) {
      console.error("Payment retry error:", midtransError);

      return NextResponse.json(
        {
          success: false,
          error: "Failed to create payment transaction. Please try again.",
        },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    console.error("Payment retry error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
