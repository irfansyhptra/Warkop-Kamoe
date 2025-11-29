import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import { verifySignature, mapMidtransStatus } from "@/lib/midtrans";
import { MidtransNotification } from "@/types/payment";

/**
 * Midtrans Payment Notification Webhook
 * This endpoint receives payment notifications from Midtrans
 * 
 * Important: This endpoint should be publicly accessible (no auth required)
 * Configure this URL in Midtrans Dashboard: https://your-domain.com/api/payment/notification
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const notification: MidtransNotification = await request.json();

    console.log("Midtrans Notification received:", {
      order_id: notification.order_id,
      transaction_status: notification.transaction_status,
      payment_type: notification.payment_type,
    });

    const {
      order_id: orderId,
      transaction_status: transactionStatus,
      fraud_status: fraudStatus,
      payment_type: paymentType,
      transaction_id: transactionId,
      gross_amount: grossAmount,
      signature_key: signatureKey,
      status_code: statusCode,
      va_numbers: vaNumbers,
      settlement_time: settlementTime,
    } = notification;

    // Verify signature
    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    const isValidSignature = verifySignature(
      orderId,
      statusCode,
      grossAmount,
      serverKey,
      signatureKey
    );

    if (!isValidSignature) {
      console.error("Invalid signature for order:", orderId);
      return NextResponse.json(
        { success: false, error: "Invalid signature" },
        { status: 403 }
      );
    }

    // Find the order
    const order = await Order.findOne({ orderId });

    if (!order) {
      console.error("Order not found:", orderId);
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Map Midtrans status to our payment status
    const paymentStatus = mapMidtransStatus(transactionStatus, fraudStatus);

    // Determine order status based on payment
    let orderStatus = order.status;
    let historyNotes = "";

    switch (paymentStatus) {
      case "paid":
        orderStatus = "confirmed";
        historyNotes = `Payment successful via ${paymentType}`;
        break;
      case "pending":
        historyNotes = `Waiting for payment via ${paymentType}`;
        break;
      case "failed":
        orderStatus = "cancelled";
        historyNotes = `Payment failed: ${transactionStatus}`;
        break;
      case "expired":
        orderStatus = "cancelled";
        historyNotes = "Payment expired";
        break;
      case "refunded":
        historyNotes = "Payment refunded";
        break;
    }

    // Build update object
    const updateData: Record<string, unknown> = {
      paymentStatus,
      status: orderStatus,
      "paymentDetails.transactionId": transactionId,
      "paymentDetails.midtransPaymentType": paymentType,
    };

    // Add VA number if available (for bank transfer)
    if (vaNumbers && vaNumbers.length > 0) {
      updateData["paymentDetails.vaNumber"] = vaNumbers[0].va_number;
      updateData["paymentDetails.bank"] = vaNumbers[0].bank;
    }

    // Add settlement time if paid
    if (paymentStatus === "paid" && settlementTime) {
      updateData["paymentDetails.paidAt"] = new Date(settlementTime);
    }

    // Update order
    await Order.findByIdAndUpdate(order._id, {
      ...updateData,
      $push: {
        orderHistory: {
          status: orderStatus,
          timestamp: new Date(),
          notes: historyNotes,
          updatedBy: "midtrans-webhook",
        },
      },
    });

    console.log(`Order ${orderId} updated:`, {
      paymentStatus,
      orderStatus,
      paymentType,
    });

    // Return 200 OK to acknowledge receipt
    return NextResponse.json({
      success: true,
      message: "Notification processed successfully",
    });
  } catch (error) {
    console.error("Webhook processing error:", error);
    
    // Always return 200 to prevent Midtrans from retrying
    // Log the error for manual investigation
    return NextResponse.json({
      success: false,
      error: "Internal processing error",
    });
  }
}

// Handle GET request (for testing/verification)
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Midtrans notification webhook is active",
    timestamp: new Date().toISOString(),
  });
}
