"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface OrderItem {
  menuItemId: string;
  warkopId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  image?: string;
}

interface Order {
  _id: string;
  orderId: string;
  userId: string;
  warkopId: string;
  warkopName: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  status: "pending" | "confirmed" | "preparing" | "ready" | "on_delivery" | "delivered" | "cancelled";
  deliveryInfo: {
    name: string;
    phone: string;
    address?: string;
    notes?: string;
  };
  paymentStatus: string;
  paymentDetails?: {
    method: string;
  };
  createdAt: string;
  estimatedDeliveryTime?: string;
}

const statusConfig: Record<string, { icon: string; bgColor: string; textColor: string; label: string }> = {
  pending: {
    icon: "⏳",
    bgColor: "bg-yellow-500/20",
    textColor: "text-yellow-400",
    label: "Menunggu",
  },
  confirmed: {
    icon: "✅",
    bgColor: "bg-blue-500/20",
    textColor: "text-blue-400",
    label: "Dikonfirmasi",
  },
  preparing: {
    icon: "👨‍🍳",
    bgColor: "bg-orange-500/20",
    textColor: "text-orange-400",
    label: "Diproses",
  },
  ready: {
    icon: "🔔",
    bgColor: "bg-green-500/20",
    textColor: "text-green-400",
    label: "Siap",
  },
  on_delivery: {
    icon: "🚗",
    bgColor: "bg-purple-500/20",
    textColor: "text-purple-400",
    label: "Dalam Pengiriman",
  },
  delivered: {
    icon: "✓",
    bgColor: "bg-emerald-500/20",
    textColor: "text-emerald-400",
    label: "Selesai",
  },
  cancelled: {
    icon: "❌",
    bgColor: "bg-red-500/20",
    textColor: "text-red-400",
    label: "Dibatalkan",
  },
};

export default function OrderTrackingPage() {
  const router = useRouter();
  const { user, isAuthenticated, authLoading } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch orders from API
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("warkop-kamoe-token");
      
      const response = await fetch("/api/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const ordersList = data.data?.orders || [];
        setOrders(ordersList);
        setFilteredOrders(ordersList);
      } else {
        console.error("Failed to fetch orders");
        setOrders([]);
        setFilteredOrders([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
      setFilteredOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchOrders();
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated, fetchOrders]);

  useEffect(() => {
    // Filter orders based on search and status
    let filtered = orders;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (order) =>
          order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.items.some((item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
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
      pending: orders.filter((o) => o.status === "pending").length,
      preparing: orders.filter((o) => o.status === "preparing" || o.status === "confirmed").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
    };
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-violet-500 mx-auto"></div>
          <p className="mt-4 text-zinc-400 text-lg">Memuat...</p>
        </div>
      </div>
    );
  }

  // Show login required after auth check is done
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10">
          <div className="text-6xl mb-6">🔒</div>
          <h1 className="text-2xl font-bold text-white mb-4">
            Login Diperlukan
          </h1>
          <p className="text-zinc-400 mb-6">
            Silakan login untuk melihat riwayat pesanan Anda.
          </p>
          <Link href="/auth/login">
            <Button variant="primary" className="px-8 py-3">
              Login Sekarang
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-violet-500 mx-auto"></div>
          <p className="mt-4 text-zinc-400 text-lg">Memuat pesanan...</p>
        </div>
      </div>
    );
  }

  const statusCounts = getStatusCounts();

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                📦 Lacak Pesanan
              </h1>
              <p className="text-zinc-400 mt-2">
                Pantau status pesanan Anda secara real-time
              </p>
            </div>
            <Link href="/">
              <Button variant="outline">🏠 Kembali ke Beranda</Button>
            </Link>
          </div>

          {/* Search */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Cari berdasarkan ID pesanan atau nama menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
                variant="dark"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Status Filter Tabs */}
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-2 mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                statusFilter === "all"
                  ? "bg-violet-500 text-white shadow-lg shadow-violet-500/25"
                  : "text-zinc-400 hover:bg-white/10"
              }`}
            >
              Semua ({statusCounts.all})
            </button>
            <button
              onClick={() => setStatusFilter("pending")}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                statusFilter === "pending"
                  ? "bg-yellow-500 text-white shadow-lg shadow-yellow-500/25"
                  : "text-zinc-400 hover:bg-white/10"
              }`}
            >
              ⏳ Menunggu ({statusCounts.pending})
            </button>
            <button
              onClick={() => setStatusFilter("preparing")}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                statusFilter === "preparing"
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25"
                  : "text-zinc-400 hover:bg-white/10"
              }`}
            >
              👨‍🍳 Diproses ({statusCounts.preparing})
            </button>
            <button
              onClick={() => setStatusFilter("delivered")}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                statusFilter === "delivered"
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                  : "text-zinc-400 hover:bg-white/10"
              }`}
            >
              ✓ Selesai ({statusCounts.delivered})
            </button>
            <button
              onClick={() => setStatusFilter("cancelled")}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                statusFilter === "cancelled"
                  ? "bg-red-500 text-white shadow-lg shadow-red-500/25"
                  : "text-zinc-400 hover:bg-white/10"
              }`}
            >
              ❌ Dibatalkan ({statusCounts.cancelled})
            </button>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-white mb-2">
              Tidak Ada Pesanan
            </h3>
            <p className="text-zinc-400 mb-6">
              {searchQuery || statusFilter !== "all"
                ? "Tidak ada pesanan yang sesuai dengan filter Anda"
                : "Anda belum memiliki pesanan. Yuk pesan sekarang!"}
            </p>
            {!searchQuery && statusFilter === "all" && (
              <Link href="/">
                <Button variant="primary">
                  🍽️ Mulai Pesan
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.pending;
              return (
                <div
                  key={order._id || order.orderId}
                  className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 hover:border-white/20 transition-all p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-white">{order.orderId}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.textColor} border border-white/10`}
                        >
                          {status.icon} {status.label}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-500">
                        {formatDate(order.createdAt)}
                      </p>
                      {order.warkopName && (
                        <p className="text-sm text-violet-400 font-medium mt-1">
                          🏪 {order.warkopName}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-violet-400">
                        Rp {order.totalAmount.toLocaleString("id-ID")}
                      </div>
                      <p className="text-xs text-zinc-500">
                        {order.items.length} item
                      </p>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="border-t border-white/10 pt-4 mb-4">
                    <div className="space-y-3">
                      {order.items.slice(0, 2).map((item, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-white/10 rounded-lg overflow-hidden flex-shrink-0">
                            {item.image ? (
                              <Image
                                src={item.image}
                                alt={item.name}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-500 text-xl">
                                🍽️
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm text-white">
                              {item.name}
                            </p>
                            <p className="text-xs text-zinc-500">
                              {item.quantity}x × Rp{" "}
                              {item.price.toLocaleString("id-ID")}
                            </p>
                          </div>
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <p className="text-xs text-zinc-500">
                          +{order.items.length - 2} item lainnya
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <div className="border-t border-white/10 pt-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-zinc-500">Penerima:</span>
                        <p className="font-medium text-white">
                          {order.deliveryInfo?.name || "-"}
                        </p>
                      </div>
                      <div>
                        <span className="text-zinc-500">Telepon:</span>
                        <p className="font-medium text-white">
                          {order.deliveryInfo?.phone || "-"}
                        </p>
                      </div>
                      {order.deliveryInfo?.address && (
                        <div className="md:col-span-2">
                          <span className="text-zinc-500">Alamat:</span>
                          <p className="font-medium text-white">
                            {order.deliveryInfo.address}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="border-t border-white/10 pt-4 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <span className="text-zinc-500">Pembayaran:</span>
                        <span className="ml-2 font-medium text-white">
                          {order.paymentDetails?.method === "cod" ? "Cash on Delivery" : 
                           order.paymentDetails?.method === "midtrans" ? "Online Payment" : 
                           order.paymentDetails?.method || "COD"}
                        </span>
                      </div>
                      <div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          order.paymentStatus === "paid" ? "bg-green-500/20 text-green-400" :
                          order.paymentStatus === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                          "bg-white/10 text-zinc-400"
                        }`}>
                          {order.paymentStatus === "paid" ? "Lunas" :
                           order.paymentStatus === "pending" ? "Menunggu" :
                           order.paymentStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Link
                      href={`/order-tracking/${order.orderId}`}
                      className="flex-1"
                    >
                      <Button
                        variant="primary"
                        className="w-full"
                      >
                        📋 Lihat Detail
                      </Button>
                    </Link>
                    {order.status === "delivered" && (
                      <Button variant="outline" className="flex-1">
                        🔄 Pesan Lagi
                      </Button>
                    )}
                    {(order.status === "preparing" || order.status === "confirmed") && (
                      <Button
                        variant="outline"
                        className="flex-1 text-emerald-400 hover:bg-emerald-500/10 border-emerald-500/30"
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
        <div className="mt-8 bg-gradient-to-r from-violet-500/10 to-purple-500/10 backdrop-blur-xl rounded-xl border border-white/10 p-6">
          <div className="flex items-start gap-4">
            <div className="text-4xl">💡</div>
            <div className="flex-1">
              <h3 className="font-bold text-white mb-2">Butuh Bantuan?</h3>
              <p className="text-zinc-400 text-sm mb-4">
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
