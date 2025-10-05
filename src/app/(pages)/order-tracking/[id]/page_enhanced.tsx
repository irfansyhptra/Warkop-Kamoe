"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Order } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { useNotification } from "@/hooks/useNotification";
import Button from "@/components/ui/Button";

// Enhanced Mock data untuk order tracking
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

// Status configuration
const statusConfig = {
  pending: {
    icon: "⏳",
    color: "yellow",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-800",
    title: "Menunggu Konfirmasi",
    description: "Pesanan Anda sedang menunggu konfirmasi dari warkop",
  },
  confirmed: {
    icon: "✅",
    color: "blue",
    bgColor: "bg-blue-100",
    textColor: "text-blue-800",
    title: "Pesanan Dikonfirmasi",
    description: "Pesanan telah dikonfirmasi dan akan segera diproses",
  },
  preparing: {
    icon: "👨‍🍳",
    color: "orange",
    bgColor: "bg-orange-100",
    textColor: "text-orange-800",
    title: "Sedang Dipersiapkan",
    description: "Pesanan Anda sedang dimasak dengan penuh cinta",
  },
  ready: {
    icon: "🔔",
    color: "green",
    bgColor: "bg-green-100",
    textColor: "text-green-800",
    title: "Siap Diambil/Diantar",
    description: "Pesanan sudah siap dan menunggu pengambilan/pengiriman",
  },
  delivered: {
    icon: "🚗",
    color: "blue",
    bgColor: "bg-blue-100",
    textColor: "text-blue-800",
    title: "Sedang Diantar",
    description: "Pesanan sedang dalam perjalanan menuju lokasi Anda",
  },
  completed: {
    icon: "🎉",
    color: "emerald",
    bgColor: "bg-emerald-100",
    textColor: "text-emerald-800",
    title: "Pesanan Selesai",
    description: "Pesanan telah selesai. Terima kasih atas kepercayaan Anda!",
  },
  cancelled: {
    icon: "❌",
    color: "red",
    bgColor: "bg-red-100",
    textColor: "text-red-800",
    title: "Pesanan Dibatalkan",
    description: "Pesanan telah dibatalkan",
  },
};

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulasi refresh data
    setTimeout(() => {
      setRefreshing(false);
      showSuccess("Berhasil", "Status pesanan telah diperbarui");
    }, 1000);
  };

  const handleCancelOrder = () => {
    if (!order) return;

    if (order.status === "delivered" || order.status === "cancelled") {
      showError("Tidak Dapat Dibatalkan", "Pesanan ini tidak dapat dibatalkan");
      return;
    }

    if (window.confirm("Apakah Anda yakin ingin membatalkan pesanan ini?")) {
      // Simulasi pembatalan
      setOrder((prev) => (prev ? { ...prev, status: "cancelled" } : null));
      showSuccess("Berhasil", "Pesanan telah dibatalkan");
    }
  };

  const handleReorder = () => {
    if (!order) return;

    // Simulasi menambahkan item ke keranjang
    showSuccess("Berhasil", "Item pesanan telah ditambahkan ke keranjang");
    router.push("/cart");
  };

  const handleContactWarkop = () => {
    if (!order) return;

    const message = `Halo, saya ingin menanyakan status pesanan ${order.id}`;
    // Note: Phone number would need to be fetched from warkop data
    const phoneNumber = "628123456789"; // Placeholder
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getEstimatedTimeRemaining = () => {
    if (!order?.estimatedDeliveryTime) return null;

    // Since estimatedDeliveryTime is just a time string like "11:15"
    // we can't calculate exact remaining time without date
    // Return the estimated time instead
    return `Estimasi: ${order.estimatedDeliveryTime}`;
  };

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

  const currentStatus = statusConfig[order.status];

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

            <div className="flex items-center gap-3">
              <Button
                onClick={handleRefresh}
                disabled={refreshing}
                variant="outline"
                className="flex items-center gap-2"
              >
                {refreshing ? "🔄" : "🔃"}
                {refreshing ? "Memperbarui..." : "Refresh"}
              </Button>

              <Button
                onClick={handleContactWarkop}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
              >
                💬 Kontak Warkop
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Current Status Card */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <div className="text-center">
            <div className="text-6xl mb-4">{currentStatus.icon}</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {currentStatus.title}
            </h2>
            <p className="text-gray-600 mb-4 max-w-md mx-auto">
              {currentStatus.description}
            </p>

            {/* Status Badge */}
            <div
              className={`inline-block px-4 py-2 rounded-full ${currentStatus.bgColor} ${currentStatus.textColor} font-medium mb-4`}
            >
              {currentStatus.title}
            </div>

            {/* Estimated Time */}
            {order.status === "preparing" && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-md mx-auto">
                <div className="flex items-center justify-center gap-2 text-amber-800">
                  <span>⏰</span>
                  <span className="font-medium">
                    Estimasi siap: {getEstimatedTimeRemaining()}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Timeline */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                📋 Riwayat Pesanan
              </h3>

              <div className="space-y-4">
                {/* Display current status only since Order doesn't have orderHistory */}
                {(() => {
                  const config = statusConfig[order.status];
                  return (
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg ${config.bgColor}`}
                      >
                        {config.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className={`font-medium ${config.textColor}`}>
                            {config.title}
                          </h4>
                          <span className="text-sm text-gray-500">
                            {new Date(order.orderDate).toLocaleTimeString(
                              "id-ID"
                            )}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mt-1">
                          {config.description}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

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

            {/* Special Instructions */}
            {order.deliveryInfo.notes && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                <h4 className="font-medium text-amber-900 mb-2 flex items-center gap-2">
                  📝 Catatan Khusus
                </h4>
                <p className="text-amber-800">{order.deliveryInfo.notes}</p>
              </div>
            )}
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
                  <span className="text-gray-600">Tanggal Pesan:</span>
                  <span className="font-medium">
                    {formatDate(order.orderDate)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Waktu Pesan:</span>
                  <span className="font-medium">
                    {formatTime(order.orderDate)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Pembayaran:</span>
                  <span className="font-medium capitalize">
                    {order.paymentMethod === "cod"
                      ? "💰 Tunai"
                      : "💳 Non-Tunai"}
                  </span>
                </div>

                {order.estimatedDeliveryTime && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estimasi Siap:</span>
                    <span className="font-medium">
                      {order.estimatedDeliveryTime}
                    </span>
                  </div>
                )}
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
              <Button
                onClick={handleReorder}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
              >
                🔄 Pesan Lagi
              </Button>

              {order.status !== "delivered" && order.status !== "cancelled" && (
                <Button
                  onClick={handleCancelOrder}
                  variant="outline"
                  className="w-full text-red-600 border-red-200 hover:bg-red-50"
                >
                  ❌ Batalkan Pesanan
                </Button>
              )}

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
