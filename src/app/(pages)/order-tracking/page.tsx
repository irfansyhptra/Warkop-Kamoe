"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { Order } from "@/types";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

// Mock orders data
const mockOrders: Order[] = [
  {
    id: "ORDER-1735516800000",
    userId: "customer-1",
    items: [
      {
        id: "cart-1",
        menuItem: {
          id: "menu-1",
          name: "Kopi Hitam Special",
          price: 12000,
          description: "Kopi hitam robusta pilihan",
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
    ],
    totalAmount: 46000,
    orderDate: "2024-12-29T10:30:00Z",
    status: "preparing",
    deliveryInfo: {
      name: "John Doe",
      phone: "08123456789",
      address: "Jl. Kebon Jeruk No. 45, Jakarta Barat",
      notes: "Tolong dipisah",
    },
    paymentMethod: "cod",
    estimatedDeliveryTime: "11:15",
  },
  {
    id: "ORDER-1735430400000",
    userId: "customer-1",
    items: [
      {
        id: "cart-2",
        menuItem: {
          id: "menu-2",
          name: "Nasi Goreng Kamoe",
          price: 22000,
          description: "Nasi goreng khas warung",
          category: "Makanan",
          image: "/images/nasi-goreng.jpg",
          availability: "available",
        },
        warkopId: "warkop-2",
        warkopName: "Warung Gayo",
        quantity: 1,
        notes: "",
      },
    ],
    totalAmount: 22000,
    orderDate: "2024-12-28T08:00:00Z",
    status: "delivered",
    deliveryInfo: {
      name: "John Doe",
      phone: "08123456789",
      address: "Jl. Kebon Jeruk No. 45, Jakarta Barat",
    },
    paymentMethod: "qris",
    estimatedDeliveryTime: "09:00",
  },
  {
    id: "ORDER-1735344000000",
    userId: "customer-1",
    items: [
      {
        id: "cart-3",
        menuItem: {
          id: "menu-3",
          name: "Es Teh Manis",
          price: 5000,
          description: "Es teh manis segar",
          category: "Minuman",
          image: "/images/es-teh.jpg",
          availability: "available",
        },
        warkopId: "warkop-1",
        warkopName: "Kopi Kita",
        quantity: 3,
        notes: "",
      },
    ],
    totalAmount: 15000,
    orderDate: "2024-12-27T15:20:00Z",
    status: "cancelled",
    deliveryInfo: {
      name: "John Doe",
      phone: "08123456789",
      address: "Jl. Kebon Jeruk No. 45, Jakarta Barat",
    },
    paymentMethod: "cod",
    estimatedDeliveryTime: "16:00",
  },
];

const statusConfig = {
  pending: {
    icon: "⏳",
    color: "yellow",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-800",
    label: "Menunggu",
  },
  confirmed: {
    icon: "✅",
    color: "blue",
    bgColor: "bg-blue-100",
    textColor: "text-blue-800",
    label: "Dikonfirmasi",
  },
  preparing: {
    icon: "👨‍🍳",
    color: "orange",
    bgColor: "bg-orange-100",
    textColor: "text-orange-800",
    label: "Diproses",
  },
  ready: {
    icon: "🔔",
    color: "green",
    bgColor: "bg-green-100",
    textColor: "text-green-800",
    label: "Siap",
  },
  delivered: {
    icon: "✓",
    color: "emerald",
    bgColor: "bg-emerald-100",
    textColor: "text-emerald-800",
    label: "Selesai",
  },
  cancelled: {
    icon: "❌",
    color: "red",
    bgColor: "bg-red-100",
    textColor: "text-red-800",
    label: "Dibatalkan",
  },
};

export default function OrderTrackingPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    if (!user) {
      router.push("/auth?tab=login");
      return;
    }

    // Simulasi loading orders
    setLoading(true);
    setTimeout(() => {
      setOrders(mockOrders);
      setFilteredOrders(mockOrders);
      setLoading(false);
    }, 1000);
  }, [user, router]);

  useEffect(() => {
    // Filter orders based on search and status
    let filtered = orders;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.items.some((item) =>
            item.menuItem.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [searchQuery, statusFilter, orders]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusCounts = () => {
    return {
      all: orders.length,
      preparing: orders.filter((o) => o.status === "preparing").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
    };
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
            Silakan login untuk melihat riwayat pesanan Anda.
          </p>
          <Link href="/auth?tab=login">
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
          <p className="mt-4 text-gray-600 text-lg">Memuat pesanan...</p>
        </div>
      </div>
    );
  }

  const statusCounts = getStatusCounts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                📦 Lacak Pesanan
              </h1>
              <p className="text-gray-600 mt-2">
                Pantau status pesanan Anda secara real-time
              </p>
            </div>
            <Link href="/">
              <Button variant="outline">🏠 Kembali ke Beranda</Button>
            </Link>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Cari berdasarkan ID pesanan atau nama menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Status Filter Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-2 mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                statusFilter === "all"
                  ? "bg-amber-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Semua ({statusCounts.all})
            </button>
            <button
              onClick={() => setStatusFilter("preparing")}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                statusFilter === "preparing"
                  ? "bg-orange-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              👨‍🍳 Diproses ({statusCounts.preparing})
            </button>
            <button
              onClick={() => setStatusFilter("delivered")}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                statusFilter === "delivered"
                  ? "bg-emerald-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              ✓ Selesai ({statusCounts.delivered})
            </button>
            <button
              onClick={() => setStatusFilter("cancelled")}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                statusFilter === "cancelled"
                  ? "bg-red-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              ❌ Dibatalkan ({statusCounts.cancelled})
            </button>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Tidak Ada Pesanan
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || statusFilter !== "all"
                ? "Tidak ada pesanan yang sesuai dengan filter Anda"
                : "Anda belum memiliki pesanan. Yuk pesan sekarang!"}
            </p>
            {!searchQuery && statusFilter === "all" && (
              <Link href="/">
                <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                  🍽️ Mulai Pesan
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const status = statusConfig[order.status];
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-gray-800">{order.id}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.textColor}`}
                        >
                          {status.icon} {status.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {formatDate(order.orderDate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-amber-600">
                        Rp {order.totalAmount.toLocaleString()}
                      </div>
                      <p className="text-xs text-gray-500">
                        {order.items.length} item
                      </p>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="border-t pt-4 mb-4">
                    <div className="space-y-3">
                      {order.items.slice(0, 2).map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={
                                item.menuItem.image ||
                                "/images/placeholder-food.jpg"
                              }
                              alt={item.menuItem.name}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm text-gray-800">
                              {item.menuItem.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.quantity}x × Rp{" "}
                              {item.menuItem.price.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <p className="text-xs text-gray-500">
                          +{order.items.length - 2} item lainnya
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <div className="border-t pt-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Penerima:</span>
                        <p className="font-medium text-gray-800">
                          {order.deliveryInfo.name}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Telepon:</span>
                        <p className="font-medium text-gray-800">
                          {order.deliveryInfo.phone}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Link
                      href={`/order-tracking/${order.id}`}
                      className="flex-1"
                    >
                      <Button
                        variant="primary"
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                      >
                        📋 Lihat Detail
                      </Button>
                    </Link>
                    {order.status === "delivered" && (
                      <Button variant="outline" className="flex-1">
                        🔄 Pesan Lagi
                      </Button>
                    )}
                    {order.status === "preparing" && (
                      <Button
                        variant="outline"
                        className="flex-1 text-green-600 hover:bg-green-50"
                      >
                        💬 Hubungi Warkop
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="text-4xl">💡</div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 mb-2">Butuh Bantuan?</h3>
              <p className="text-gray-700 text-sm mb-4">
                Jika ada pertanyaan tentang pesanan Anda, jangan ragu untuk
                menghubungi kami atau warkop terkait.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" className="text-sm">
                  📞 Hubungi Support
                </Button>
                <Button variant="outline" className="text-sm">
                  ❓ FAQ
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
