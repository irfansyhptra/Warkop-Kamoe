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

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Verify user authentication
    const currentUser = requireAuth(request);

    const body = await request.json();
    const {
      items,
      warkopId,
      warkopName,
      deliveryInfo,
      deliveryMethod,
      deliveryFee = 0,
      paymentMethod,
      customerEmail,
    } = body;

    // Validation
    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Items are required" },
        { status: 400 }
      );
    }

    if (!deliveryInfo || !deliveryInfo.name || !deliveryInfo.phone) {
      return NextResponse.json(
        { success: false, error: "Delivery info is required" },
        { status: 400 }
      );
    }

    if (!paymentMethod || !["cod", "midtrans"].includes(paymentMethod)) {
      return NextResponse.json(
        { success: false, error: "Valid payment method is required" },
        { status: 400 }
      );
    }

    // Calculate totals - ensure all are integers for Midtrans
    const subtotal = Math.round(items.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + item.price * item.quantity,
      0
    ));
    const serviceFee = Math.round(subtotal * 0.01); // 1% service fee
    const roundedDeliveryFee = Math.round(deliveryFee);
    const totalAmount = subtotal + roundedDeliveryFee + serviceFee;

    // Generate unique order ID
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const orderId = `WK-${timestamp}-${random}`;

    // Create order in database
    const orderData = {
      orderId,
      userId: currentUser.userId,
      warkopId: warkopId || items[0]?.warkopId,
      warkopName: warkopName || "Warkop Kamoe",
      items: items.map(
        (item: {
          menuItemId: string;
          warkopId: string;
          name: string;
          price: number;
          quantity: number;
          notes?: string;
          image?: string;
        }) => ({
          menuItemId: item.menuItemId,
          warkopId: item.warkopId,
          name: item.name,
          price: Math.round(item.price),
          quantity: item.quantity,
          notes: item.notes || "",
          image: item.image || "",
        })
      ),
      subtotal,
      deliveryFee: roundedDeliveryFee,
      serviceFee,
      discount: 0,
      totalAmount,
      status: "pending",
      deliveryInfo: {
        name: deliveryInfo.name,
        phone: deliveryInfo.phone,
        address: deliveryInfo.address || "",
        city: deliveryInfo.city || "",
        postalCode: deliveryInfo.postalCode || "",
        notes: deliveryInfo.notes || "",
      },
      deliveryDetails: {
        method: deliveryMethod || "delivery",
        fee: roundedDeliveryFee,
        estimatedTime: deliveryMethod === "delivery" ? "30-45 menit" : "15-20 menit",
      },
      paymentStatus: paymentMethod === "cod" ? "pending" : "pending",
      paymentDetails: {
        method: paymentMethod,
      },
      orderHistory: [
        {
          status: "pending",
          timestamp: new Date(),
          notes: "Order created",
        },
      ],
    };

    const order = await Order.create(orderData);

    // If payment method is Midtrans, create Snap transaction
    if (paymentMethod === "midtrans") {
      try {
        // Build customer details
        const customer: CustomerDetails = {
          firstName: deliveryInfo.name.split(" ")[0],
          lastName: deliveryInfo.name.split(" ").slice(1).join(" ") || "",
          email: customerEmail || `${currentUser.userId}@warkopkamoe.com`,
          phone: deliveryInfo.phone,
        };

        // Add shipping address if delivery
        if (deliveryMethod === "delivery" && deliveryInfo.address) {
          customer.shippingAddress = {
            firstName: deliveryInfo.name.split(" ")[0],
            lastName: deliveryInfo.name.split(" ").slice(1).join(" ") || "",
            phone: deliveryInfo.phone,
            address: deliveryInfo.address,
            city: deliveryInfo.city || "Indonesia",
          };
        }

        // Helper function to truncate string to max length
        const truncateString = (str: string, maxLength: number): string => {
          if (str.length <= maxLength) return str;
          return str.substring(0, maxLength - 3) + "...";
        };

        // Build item details with truncated names (Midtrans max 50 chars)
        const itemDetails: ItemDetails[] = items.map(
          (item: { menuItemId: string; name: string; price: number; quantity: number }) => ({
            id: truncateString(item.menuItemId || "item", 50),
            name: truncateString(item.name || "Menu Item", 50),
            price: Math.round(item.price), // Ensure integer
            quantity: item.quantity,
            merchantName: truncateString(warkopName || "Warkop Kamoe", 50),
          })
        );

        // Add delivery fee as item if exists
        if (deliveryFee > 0) {
          itemDetails.push({
            id: "delivery-fee",
            name: "Ongkos Kirim",
            price: Math.round(deliveryFee),
            quantity: 1,
          });
        }

        // Add service fee as item
        if (serviceFee > 0) {
          itemDetails.push({
            id: "service-fee",
            name: "Biaya Layanan",
            price: Math.round(serviceFee),
            quantity: 1,
          });
        }

        // Calculate actual total from item details to ensure it matches
        const calculatedTotal = itemDetails.reduce(
          (sum, item) => sum + (item.price * item.quantity),
          0
        );

        // Build transaction parameters with calculated total
        const transactionParams = buildTransactionParams(
          orderId,
          calculatedTotal, // Use calculated total to ensure it matches item_details sum
          customer,
          itemDetails,
          process.env.NEXT_PUBLIC_API_URL
        );

        // Create Snap transaction
        const snapResponse = await createSnapTransaction(transactionParams);

        // Update order with Snap token
        await Order.findByIdAndUpdate(order._id, {
          "paymentDetails.snapToken": snapResponse.token,
          "paymentDetails.snapRedirectUrl": snapResponse.redirect_url,
        });

        return NextResponse.json(
          {
            success: true,
            message: "Transaction created successfully",
            data: {
              orderId,
              snapToken: snapResponse.token,
              snapRedirectUrl: snapResponse.redirect_url,
              totalAmount,
            },
          },
          { status: 201 }
        );
      } catch (midtransError: unknown) {
        console.error("Midtrans error:", midtransError);

        // Extract error message
        let errorMessage = "Gagal membuat transaksi pembayaran";
        if (midtransError && typeof midtransError === 'object' && 'ApiResponse' in midtransError) {
          const apiResponse = (midtransError as { ApiResponse?: { error_messages?: string[] } }).ApiResponse;
          if (apiResponse?.error_messages) {
            errorMessage = apiResponse.error_messages.join(", ");
            // Check if it's an API key issue
            if (errorMessage.includes("unauthorized") || errorMessage.includes("Access denied")) {
              errorMessage = "Konfigurasi Midtrans tidak valid. Silakan hubungi admin untuk memperbarui API key.";
            }
          }
        }

        // Update order status to failed
        await Order.findByIdAndUpdate(order._id, {
          paymentStatus: "failed",
          $push: {
            orderHistory: {
              status: "payment_failed",
              timestamp: new Date(),
              notes: `Failed to create Midtrans transaction: ${errorMessage}`,
            },
          },
        });

        // Return error with detailed message
        return NextResponse.json(
          {
            success: false,
            error: errorMessage,
            orderId,
            details: "Pembayaran online tidak dapat diproses. Silakan coba lagi atau gunakan metode COD.",
          },
          { status: 500 }
        );
      }
    }

    // For COD, just return the order
    return NextResponse.json(
      {
        success: true,
        message: "Order created successfully",
        data: {
          orderId,
          totalAmount,
          paymentMethod: "cod",
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    console.error("Create transaction error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
