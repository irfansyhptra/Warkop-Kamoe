"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Order } from "@/types";
import Button from "@/components/ui/Button";

// Enhanced Mock data
const mockOrder: Order = {
  id: "ORDER-1735516800000",
  userId: "customer-1",
  items: [
    {
      id: "cart-1",
      menuItem: {
        id: "menu-1",
        name: "Kopi Hitam Special",
        price: 12000,
        description: "Kopi hitam robusta pilihan dari Lampung",
        category: "Kopi",
        image: "/images/kopi-hitam.jpg",
        availability: "available",
        isRecommended: true,
      },
      warkopId: "warkop-1",
      warkopName: "Kopi Kita",
      quantity: 2,
      notes: "Gula sedikit",
    },
    {
      id: "cart-2",
      menuItem: {
        id: "menu-4",
        name: "Nasi Goreng Kamoe",
        price: 22000,
        description: "Nasi goreng khas warung dengan bumbu rempah pilihan",
        category: "Makanan Berat",
        image: "/images/nasgor.jpg",
        availability: "available",
        isRecommended: true,
      },
      warkopId: "warkop-1",
      warkopName: "Kopi Kita",
      quantity: 1,
      notes: "Pedas sedang, telur mata sapi",
    },
  ],
  totalAmount: 46000,
  orderDate: "2024-12-29T10:30:00Z",
  status: "preparing",
  deliveryInfo: {
    name: "John Doe",
    phone: "08123456789",
    address: "Jl. Kebon Jeruk No. 45, Jakarta Barat",
    notes: "Tolong dipisah antara makanan dan minuman",
  },
  paymentMethod: "cod",
  estimatedDeliveryTime: "11:15",
};

const statusSteps = [
  { key: "pending", label: "Pesanan Diterima", icon: "📝" },
  { key: "confirmed", label: "Dikonfirmasi", icon: "✅" },
  { key: "preparing", label: "Sedang Diproses", icon: "👨‍🍳" },
  { key: "ready", label: "Siap Diantar", icon: "📦" },
  { key: "delivered", label: "Selesai", icon: "🎉" },
];

export default function OrderTrackingPage() {
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulasi loading order data
    setTimeout(() => {
      setOrder(mockOrder);
      setLoading(false);
    }, 1000);
  }, [params.id]);

  const getCurrentStatusIndex = () => {
    if (!order) return 0;
    return statusSteps.findIndex((step) => step.key === order.status);
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "cod":
        return "Cash on Delivery";
      case "qris":
        return "QRIS";
      case "bank_transfer":
        return "Transfer Bank";
      default:
        return method;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data pesanan...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Pesanan Tidak Ditemukan
          </h1>
          <p className="text-gray-600 mb-6">
            ID pesanan tidak valid atau sudah tidak ada
          </p>
          <Button onClick={() => window.history.back()} variant="primary">
            Kembali
          </Button>
        </div>
      </div>
    );
  }

  const currentStatusIndex = getCurrentStatusIndex();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Lacak Pesanan</h1>
            <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
              ID: {order.id}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Tanggal Pesanan:</span>
              <p className="font-medium">
                {new Date(order.orderDate).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div>
              <span className="text-gray-600">Estimasi:</span>
              <p className="font-medium">
                {order.estimatedDeliveryTime || "-"}
              </p>
            </div>
            <div>
              <span className="text-gray-600">Pembayaran:</span>
              <p className="font-medium">
                {getPaymentMethodLabel(order.paymentMethod)}
              </p>
            </div>
          </div>
        </div>

        {/* Status Tracking */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-6">Status Pesanan</h2>

          <div className="relative">
            {/* Progress Line */}
            <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200"></div>
            <div
              className="absolute left-6 top-12 w-0.5 bg-amber-600 transition-all duration-500"
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
                          ? "bg-amber-600 text-white"
                          : "bg-gray-200 text-gray-400"
                      }
                      ${isCurrent ? "ring-4 ring-amber-200" : ""}
                    `}
                    >
                      {step.icon}
                    </div>

                    {/* Status Text */}
                    <div className="ml-4">
                      <h3
                        className={`font-medium ${
                          isCompleted ? "text-gray-900" : "text-gray-400"
                        }`}
                      >
                        {step.label}
                      </h3>
                      {isCurrent && (
                        <p className="text-sm text-amber-600 font-medium">
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
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Detail Pesanan</h2>

          <div className="space-y-4">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-start border-b border-gray-100 pb-4 last:border-b-0"
              >
                <div className="flex-1">
                  <h3 className="font-medium">{item.menuItem.name}</h3>
                  <p className="text-gray-600 text-sm">{item.warkopName}</p>
                  <p className="text-gray-600 text-sm">
                    Rp {item.menuItem.price.toLocaleString("id-ID")} ×{" "}
                    {item.quantity}
                  </p>
                  {item.notes && (
                    <p className="text-gray-500 text-sm italic">
                      Catatan: {item.notes}
                    </p>
                  )}
                </div>
                <div className="font-medium">
                  Rp{" "}
                  {(item.menuItem.price * item.quantity).toLocaleString(
                    "id-ID"
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t mt-4 pt-4">
            <div className="flex justify-between font-bold text-lg">
              <span>Total Pembayaran</span>
              <span className="text-amber-600">
                Rp {order.totalAmount.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </div>

        {/* Informasi Pengiriman */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Informasi Pengiriman</h2>

          <div className="space-y-2">
            <div>
              <span className="text-gray-600">Nama:</span>
              <span className="ml-2 font-medium">
                {order.deliveryInfo.name}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Telepon:</span>
              <span className="ml-2 font-medium">
                {order.deliveryInfo.phone}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Alamat:</span>
              <span className="ml-2 font-medium">
                {order.deliveryInfo.address}
              </span>
            </div>
            {order.deliveryInfo.notes && (
              <div>
                <span className="text-gray-600">Catatan:</span>
                <span className="ml-2 font-medium">
                  {order.deliveryInfo.notes}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {order.status === "delivered" && (
          <div className="mt-6 text-center">
            <Button
              onClick={() => {
                /* Implement rating/review */
              }}
              variant="primary"
              className="mr-4"
            >
              Beri Rating & Ulasan
            </Button>
            <Button
              onClick={() => {
                /* Implement reorder */
              }}
              variant="outline"
            >
              Pesan Lagi
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
