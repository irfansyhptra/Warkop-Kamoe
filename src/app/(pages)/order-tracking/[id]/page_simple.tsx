"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Order } from "@/types";
import { useAuth } from "@/hooks/useAuth";
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

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    // Simulasi loading data order
    setLoading(true);
    setTimeout(() => {
      setOrder(mockOrder);
      setLoading(false);
    }, 1500);
  }, [params.id, user, router]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-6">🔒</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Login Diperlukan
          </h1>
          <p className="text-gray-600 mb-6">
            Silakan login terlebih dahulu untuk melihat status pesanan Anda.
          </p>
          <Link href="/auth/login">
            <Button className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3">
              Login Sekarang
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Memuat detail pesanan...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-6">📦</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Pesanan Tidak Ditemukan
          </h1>
          <p className="text-gray-600 mb-6">
            Pesanan dengan ID {params.id} tidak ditemukan atau Anda tidak
            memiliki akses.
          </p>
          <Link href="/">
            <Button className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3">
              Kembali ke Beranda
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                📦 Lacak Pesanan
              </h1>
              <p className="text-gray-600 mt-1">Order ID: {order.id}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Current Status Card */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <div className="text-center">
            <div className="text-6xl mb-4">👨‍🍳</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Sedang Dipersiapkan
            </h2>
            <p className="text-gray-600 mb-4 max-w-md mx-auto">
              Pesanan Anda sedang dimasak dengan penuh cinta
            </p>

            <div className="inline-block px-4 py-2 rounded-full bg-orange-100 text-orange-800 font-medium mb-4">
              Sedang Dipersiapkan
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Items */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                🍽️ Detail Pesanan
              </h3>

              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={
                          item.menuItem.image || "/images/placeholder-food.jpg"
                        }
                        alt={item.menuItem.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/images/placeholder-food.jpg";
                        }}
                      />
                    </div>

                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">
                        {item.menuItem.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {item.menuItem.description}
                      </p>
                      {item.notes && (
                        <p className="text-sm text-amber-600 mt-1">
                          📝 {item.notes}
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="font-medium text-gray-800">
                        {item.quantity}x
                      </div>
                      <div className="text-sm text-gray-600">
                        Rp{" "}
                        {(item.quantity * item.menuItem.price).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="border-t pt-4 mt-6">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total Pembayaran</span>
                  <span className="text-amber-600">
                    Rp {order.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Details */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                📄 Detail Pengiriman
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Pembayaran:</span>
                  <span className="font-medium capitalize">
                    {order.paymentMethod === "cod"
                      ? "💰 Tunai"
                      : "💳 Non-Tunai"}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                👤 Info Pelanggan
              </h3>

              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600">Nama:</span>
                  <p className="font-medium">{order.deliveryInfo.name}</p>
                </div>

                <div>
                  <span className="text-gray-600">Telepon:</span>
                  <p className="font-medium">{order.deliveryInfo.phone}</p>
                </div>

                {order.deliveryInfo.address && (
                  <div>
                    <span className="text-gray-600">Alamat:</span>
                    <p className="font-medium">{order.deliveryInfo.address}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link href="/">
                <Button variant="outline" className="w-full">
                  🏠 Kembali ke Beranda
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
