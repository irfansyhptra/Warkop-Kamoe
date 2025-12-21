"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useMidtrans } from "@/hooks/useMidtrans";

// Order interface matching the backend model
interface OrderData {
  _id: string;
  orderId: string;
  userId: string;
  warkopId: string;
  warkopName: string;
  items: {
    menuItemId: string;
    warkopId: string;
    name: string;
    price: number;
    quantity: number;
    notes?: string;
    image?: string;
  }[];
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  discount: number;
  totalAmount: number;
  status: "pending" | "confirmed" | "preparing" | "ready" | "on_delivery" | "delivered" | "cancelled";
  deliveryInfo: {
    name: string;
    phone: string;
    address?: string;
    city?: string;
    notes?: string;
  };
  deliveryDetails: {
    method: "delivery" | "pickup";
    fee: number;
    estimatedTime?: string;
  };
  paymentStatus: "pending" | "paid" | "failed" | "refunded" | "expired";
  paymentDetails: {
    method: "cod" | "midtrans";
    midtransPaymentType?: string;
    transactionId?: string;
    snapToken?: string;
    snapRedirectUrl?: string;
    vaNumber?: string;
    bank?: string;
    paidAt?: string;
  };
  orderHistory: {
    status: string;
    timestamp: string;
    notes?: string;
  }[];
  estimatedDeliveryTime?: string;
  createdAt: string;
  updatedAt: string;
}

const statusSteps = [
  { key: "pending", label: "Menunggu Pembayaran", icon: "�" },
  { key: "confirmed", label: "Pesanan Dikonfirmasi", icon: "✅" },
  { key: "preparing", label: "Sedang Disiapkan", icon: "👨‍🍳" },
  { key: "ready", label: "Siap Diambil/Diantar", icon: "📦" },
  { key: "on_delivery", label: "Sedang Diantar", icon: "🛵" },
  { key: "delivered", label: "Selesai", icon: "🎉" },
];

const paymentStatusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: "Menunggu Pembayaran", color: "bg-yellow-500/20 text-yellow-400" },
  paid: { label: "Sudah Dibayar", color: "bg-emerald-500/20 text-emerald-400" },
  failed: { label: "Pembayaran Gagal", color: "bg-red-500/20 text-red-400" },
  refunded: { label: "Dana Dikembalikan", color: "bg-blue-500/20 text-blue-400" },
  expired: { label: "Kedaluwarsa", color: "bg-zinc-500/20 text-zinc-400" },
};

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { pay: midtransPay, isLoaded: midtransLoaded } = useMidtrans();
  
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryingPayment, setRetryingPayment] = useState(false);

  const orderId = params.id as string;

  // Fetch order data
  const fetchOrder = useCallback(async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("warkop-kamoe-token");
      
      const response = await fetch(`/api/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          setError("Pesanan tidak ditemukan");
        } else {
          setError("Gagal memuat data pesanan");
        }
        return;
      }

      const data = await response.json();
      setOrder(data.data.order);
      setError(null);
    } catch (err) {
      console.error("Error fetching order:", err);
      setError("Terjadi kesalahan saat memuat pesanan");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
    
    // Poll for updates every 30 seconds if order is not completed
    const interval = setInterval(() => {
      if (order && !["delivered", "cancelled"].includes(order.status)) {
        fetchOrder();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchOrder, order?.status]);

  // Retry payment function
  const handleRetryPayment = async () => {
    if (!order?.paymentDetails?.snapToken || !midtransLoaded) return;

    setRetryingPayment(true);
    try {
      await midtransPay(order.paymentDetails.snapToken);
      fetchOrder(); // Refresh order data after payment
    } catch (err) {
      console.error("Payment retry error:", err);
    } finally {
      setRetryingPayment(false);
    }
  };

  const getCurrentStatusIndex = () => {
    if (!order) return 0;
    if (order.status === "cancelled") return -1;
    return statusSteps.findIndex((step) => step.key === order.status);
  };

  const getPaymentMethodLabel = (method: string, paymentType?: string) => {
    if (method === "cod") return "Cash on Delivery";
    if (paymentType) {
      const typeLabels: Record<string, string> = {
        bank_transfer: "Transfer Bank",
        gopay: "GoPay",
        shopeepay: "ShopeePay",
        qris: "QRIS",
        credit_card: "Kartu Kredit",
        bca_va: "BCA Virtual Account",
        bni_va: "BNI Virtual Account",
        bri_va: "BRI Virtual Account",
      };
      return typeLabels[paymentType] || paymentType;
    }
    return "Online Payment";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-violet-500 mx-auto"></div>
          <p className="mt-4 text-zinc-400">Memuat data pesanan...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center p-8 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Pesanan Tidak Ditemukan
          </h1>
          <p className="text-zinc-400 mb-6">
            {error || "ID pesanan tidak valid atau sudah tidak ada"}
          </p>
          <Button onClick={() => router.push("/")} variant="primary">
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    );
  }

  const currentStatusIndex = getCurrentStatusIndex();
  const paymentInfo = paymentStatusLabels[order.paymentStatus] || paymentStatusLabels.pending;

  return (
    <div className="min-h-screen bg-[#0a0a0b] py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Order Header */}
        <div className="bg-[#121215] rounded-2xl border border-white/10 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-white">Lacak Pesanan</h1>
            <span className="px-3 py-1 bg-violet-500/20 text-violet-400 rounded-full text-sm font-medium">
              {order.orderId}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-zinc-400">Tanggal Pesanan:</span>
              <p className="font-medium text-white">
                {new Date(order.createdAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div>
              <span className="text-zinc-400">Estimasi:</span>
              <p className="font-medium text-white">
                {order.deliveryDetails?.estimatedTime || order.estimatedDeliveryTime || "-"}
              </p>
            </div>
            <div>
              <span className="text-zinc-400">Pembayaran:</span>
              <p className="font-medium text-white">
                {getPaymentMethodLabel(order.paymentDetails?.method || "cod", order.paymentDetails?.midtransPaymentType)}
              </p>
            </div>
            <div>
              <span className="text-zinc-400">Status Bayar:</span>
              <p className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${paymentInfo.color}`}>
                {paymentInfo.label}
              </p>
            </div>
          </div>

          {/* Payment Action for Pending */}
          {order.paymentStatus === "pending" && order.paymentDetails?.method === "midtrans" && order.paymentDetails?.snapToken && (
            <div className="mt-4 p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-yellow-400">Pembayaran Belum Selesai</p>
                  <p className="text-sm text-yellow-400/70">Silakan selesaikan pembayaran Anda</p>
                </div>
                <Button
                  onClick={handleRetryPayment}
                  variant="primary"
                  size="sm"
                  disabled={retryingPayment || !midtransLoaded}
                >
                  {retryingPayment ? "Memproses..." : "Bayar Sekarang"}
                </Button>
              </div>
              
              {/* VA Number Info */}
              {order.paymentDetails?.vaNumber && (
                <div className="mt-3 p-3 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-sm text-zinc-400">Virtual Account ({order.paymentDetails.bank?.toUpperCase()}):</p>
                  <p className="font-mono font-bold text-lg text-white">{order.paymentDetails.vaNumber}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Status Tracking */}
        <div className="bg-[#121215] rounded-2xl border border-white/10 p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-6">Status Pesanan</h2>

          <div className="relative">
            {/* Progress Line */}
            <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-white/10"></div>
            <div
              className="absolute left-6 top-12 w-0.5 bg-violet-500 transition-all duration-500"
              style={{
                height: `${
                  (currentStatusIndex / (statusSteps.length - 1)) * 100
                }%`,
              }}
            ></div>

            {/* Status Steps */}
            <div className="space-y-6">
              {statusSteps.map((step, index) => {
                const isCompleted = index <= currentStatusIndex;
                const isCurrent = index === currentStatusIndex;

                return (
                  <div key={step.key} className="relative flex items-center">
                    {/* Status Icon */}
                    <div
                      className={`
                      relative z-10 w-12 h-12 rounded-full flex items-center justify-center text-xl
                      ${
                        isCompleted
                          ? "bg-violet-500 text-white"
                          : "bg-white/10 text-zinc-500"
                      }
                      ${isCurrent ? "ring-4 ring-violet-500/30" : ""}
                    `}
                    >
                      {step.icon}
                    </div>

                    {/* Status Text */}
                    <div className="ml-4">
                      <h3
                        className={`font-medium ${
                          isCompleted ? "text-white" : "text-zinc-500"
                        }`}
                      >
                        {step.label}
                      </h3>
                      {isCurrent && (
                        <p className="text-sm text-violet-400 font-medium">
                          Sedang diproses...
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Detail Pesanan */}
        <div className="bg-[#121215] rounded-2xl border border-white/10 p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Detail Pesanan</h2>
          <p className="text-sm text-zinc-400 mb-4">dari {order.warkopName}</p>

          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div
                key={`${item.menuItemId}-${index}`}
                className="flex justify-between items-start border-b border-white/10 pb-4 last:border-b-0"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-white">{item.name}</h3>
                  <p className="text-zinc-400 text-sm">
                    Rp {item.price.toLocaleString("id-ID")} ×{" "}
                    {item.quantity}
                  </p>
                  {item.notes && (
                    <p className="text-zinc-500 text-sm italic">
                      Catatan: {item.notes}
                    </p>
                  )}
                </div>
                <div className="font-medium text-white">
                  Rp{" "}
                  {(item.price * item.quantity).toLocaleString(
                    "id-ID"
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 mt-4 pt-4 space-y-2">
            <div className="flex justify-between text-sm text-zinc-300">
              <span>Subtotal</span>
              <span>Rp {order.subtotal.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between text-sm text-zinc-300">
              <span>Ongkir</span>
              <span>Rp {order.deliveryFee.toLocaleString("id-ID")}</span>
            </div>
            {order.serviceFee > 0 && (
              <div className="flex justify-between text-sm text-zinc-300">
                <span>Biaya Layanan</span>
                <span>Rp {order.serviceFee.toLocaleString("id-ID")}</span>
              </div>
            )}
            {order.discount > 0 && (
              <div className="flex justify-between text-sm text-emerald-400">
                <span>Diskon</span>
                <span>- Rp {order.discount.toLocaleString("id-ID")}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg border-t border-white/10 pt-2">
              <span className="text-white">Total Pembayaran</span>
              <span className="text-violet-400">
                Rp {order.totalAmount.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </div>

        {/* Informasi Pengiriman */}
        <div className="bg-[#121215] rounded-2xl border border-white/10 p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            {order.deliveryDetails?.method === "pickup" ? "Informasi Pengambilan" : "Informasi Pengiriman"}
          </h2>

          <div className="space-y-2">
            <div className="flex">
              <span className="text-zinc-400 w-24">Nama:</span>
              <span className="font-medium text-white">{order.deliveryInfo.name}</span>
            </div>
            <div className="flex">
              <span className="text-zinc-400 w-24">Telepon:</span>
              <span className="font-medium text-white">{order.deliveryInfo.phone}</span>
            </div>
            {order.deliveryDetails?.method === "delivery" && order.deliveryInfo.address && (
              <div className="flex">
                <span className="text-zinc-400 w-24">Alamat:</span>
                <span className="font-medium text-white">{order.deliveryInfo.address}</span>
              </div>
            )}
            {order.deliveryInfo.notes && (
              <div className="flex">
                <span className="text-zinc-400 w-24">Catatan:</span>
                <span className="font-medium text-white">{order.deliveryInfo.notes}</span>
              </div>
            )}
            <div className="flex">
              <span className="text-zinc-400 w-24">Metode:</span>
              <span className="font-medium text-white capitalize">
                {order.deliveryDetails?.method === "pickup" ? "Ambil Sendiri" : "Diantar"}
              </span>
            </div>
          </div>
        </div>

        {/* Order History Timeline */}
        {order.orderHistory && order.orderHistory.length > 0 && (
          <div className="bg-[#121215] rounded-2xl border border-white/10 p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Riwayat Pesanan</h2>
            <div className="space-y-4">
              {order.orderHistory.map((history, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-violet-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-white capitalize">{history.status.replace(/_/g, " ")}</p>
                    <p className="text-sm text-zinc-500">
                      {new Date(history.timestamp).toLocaleString("id-ID")}
                    </p>
                    {history.notes && (
                      <p className="text-sm text-zinc-400">{history.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {order.status === "delivered" && (
            <>
              <Button
                onClick={() => {/* Implement rating/review */}}
                variant="primary"
              >
                ⭐ Beri Rating & Ulasan
              </Button>
              <Button
                onClick={() => router.push("/")}
                variant="outline"
              >
                🛒 Pesan Lagi
              </Button>
            </>
          )}
          
          {order.status === "cancelled" && (
            <Button
              onClick={() => router.push("/")}
              variant="primary"
            >
              Kembali ke Beranda
            </Button>
          )}

          {!["delivered", "cancelled"].includes(order.status) && (
            <Button
              onClick={fetchOrder}
              variant="outline"
            >
              🔄 Refresh Status
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
