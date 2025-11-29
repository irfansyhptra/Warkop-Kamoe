import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import { requireAuth } from "@/lib/auth";
import { getTransactionStatus, mapMidtransStatus } from "@/lib/midtrans";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/payment/status/[id]
 * Get payment status for an order
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
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

    // Find order in database
    const order = await Order.findOne({ orderId });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Check if user owns this order (unless admin/warkop_owner)
    if (
      currentUser.role === "customer" &&
      order.userId !== currentUser.userId
    ) {
      return NextResponse.json(
        { success: false, error: "Unauthorized to view this order" },
        { status: 403 }
      );
    }

    // If payment is via Midtrans and still pending, check with Midtrans
    if (
      order.paymentDetails?.method === "midtrans" &&
      order.paymentStatus === "pending"
    ) {
      try {
        const midtransStatus = await getTransactionStatus(orderId);
        
        // Map and update status if changed
        const newPaymentStatus = mapMidtransStatus(
          midtransStatus.transaction_status,
          midtransStatus.fraud_status
        );

        if (newPaymentStatus !== order.paymentStatus) {
          // Update order with new status
          let newOrderStatus = order.status;
          
          if (newPaymentStatus === "paid") {
            newOrderStatus = "confirmed";
          } else if (newPaymentStatus === "failed" || newPaymentStatus === "expired") {
            newOrderStatus = "cancelled";
          }

          await Order.findByIdAndUpdate(order._id, {
            paymentStatus: newPaymentStatus,
            status: newOrderStatus,
            "paymentDetails.transactionId": midtransStatus.transaction_id,
            "paymentDetails.midtransPaymentType": midtransStatus.payment_type,
            $push: {
              orderHistory: {
                status: newOrderStatus,
                timestamp: new Date(),
                notes: `Payment status updated: ${newPaymentStatus}`,
                updatedBy: "status-check",
              },
            },
          });

          return NextResponse.json({
            success: true,
            data: {
              orderId,
              paymentStatus: newPaymentStatus,
              orderStatus: newOrderStatus,
              transactionStatus: midtransStatus.transaction_status,
              paymentType: midtransStatus.payment_type,
              transactionTime: midtransStatus.transaction_time,
              settlementTime: midtransStatus.settlement_time,
              grossAmount: midtransStatus.gross_amount,
              vaNumber: midtransStatus.va_numbers?.[0]?.va_number,
              bank: midtransStatus.va_numbers?.[0]?.bank,
            },
          });
        }

        // Return current Midtrans status
        return NextResponse.json({
          success: true,
          data: {
            orderId,
            paymentStatus: order.paymentStatus,
            orderStatus: order.status,
            transactionStatus: midtransStatus.transaction_status,
            paymentType: midtransStatus.payment_type,
            transactionTime: midtransStatus.transaction_time,
            grossAmount: midtransStatus.gross_amount,
            vaNumber: midtransStatus.va_numbers?.[0]?.va_number,
            bank: midtransStatus.va_numbers?.[0]?.bank,
            snapToken: order.paymentDetails?.snapToken,
            snapRedirectUrl: order.paymentDetails?.snapRedirectUrl,
          },
        });
      } catch (midtransError) {
        console.error("Error checking Midtrans status:", midtransError);
        // Fall back to database status
      }
    }

    // Return database status
    return NextResponse.json({
      success: true,
      data: {
        orderId,
        paymentStatus: order.paymentStatus,
        orderStatus: order.status,
        paymentMethod: order.paymentDetails?.method,
        paymentType: order.paymentDetails?.midtransPaymentType,
        transactionId: order.paymentDetails?.transactionId,
        vaNumber: order.paymentDetails?.vaNumber,
        bank: order.paymentDetails?.bank,
        paidAt: order.paymentDetails?.paidAt,
        snapToken: order.paymentDetails?.snapToken,
        snapRedirectUrl: order.paymentDetails?.snapRedirectUrl,
        totalAmount: order.totalAmount,
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    console.error("Get payment status error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
