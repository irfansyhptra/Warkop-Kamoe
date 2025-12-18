import { NextResponse } from "next/server";

/**
 * GET /api/payment/methods
 * Get available payment methods and their details
 */
export async function GET() {
  try {
    const paymentMethods = [
      {
        id: "midtrans",
        name: "Pembayaran Online",
        description: "Transfer Bank, E-Wallet, Kartu Kredit/Debit",
        icon: "💳",
        enabled: true,
        provider: "Midtrans",
        supportedTypes: [
          {
            type: "bank_transfer",
            name: "Transfer Bank",
            banks: ["BCA", "BNI", "BRI", "Mandiri", "Permata", "CIMB"],
            processingTime: "Real-time",
          },
          {
            type: "echannel",
            name: "Mandiri Bill",
            processingTime: "Real-time",
          },
          {
            type: "gopay",
            name: "GoPay",
            processingTime: "Instant",
          },
          {
            type: "shopeepay",
            name: "ShopeePay",
            processingTime: "Instant",
          },
          {
            type: "qris",
            name: "QRIS",
            processingTime: "Instant",
          },
          {
            type: "credit_card",
            name: "Kartu Kredit/Debit",
            banks: ["Visa", "Mastercard", "JCB", "Amex"],
            processingTime: "Instant",
          },
        ],
      },
      {
        id: "cod",
        name: "Cash on Delivery (COD)",
        description: "Bayar tunai saat pesanan diterima",
        icon: "💵",
        enabled: true,
        notes: "Pembayaran dilakukan langsung kepada kurir",
      },
    ];

    const serviceFeePercentage = 1; // 1%
    const minServiceFee = 500; // Rp 500

    return NextResponse.json({
      success: true,
      data: {
        methods: paymentMethods,
        fees: {
          serviceFee: {
            type: "percentage",
            value: serviceFeePercentage,
            minimum: minServiceFee,
            description: "Biaya layanan pembayaran online",
            appliesTo: ["midtrans"],
          },
        },
        currency: "IDR",
        environment: process.env.MIDTRANS_IS_PRODUCTION === "true" ? "production" : "sandbox",
      },
    });
  } catch (error) {
    console.error("Get payment methods error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
