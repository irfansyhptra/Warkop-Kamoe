"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import Button from "@/components/ui/Button";

interface Order {
  _id: string;
  orderId: string;
  userId: string;
  warkopId: string;
  warkopName: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  paymentDetails: {
    method: string;
    midtransPaymentType?: string;
  };
  deliveryDetails: {
    method: string;
  };
  createdAt: string;
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const { user, isAuthenticated, authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPayment, setFilterPayment] = useState<string>("all");

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "admin")) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, authLoading, user, router]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("warkop-kamoe-token");
      const response = await fetch("/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.data.orders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem("warkop-kamoe-token");
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        alert("Status berhasil diupdate");
        fetchOrders();
      } else {
        alert("Gagal mengupdate status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Terjadi kesalahan");
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
      confirmed: "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30",
      preparing: "bg-orange-500/20 text-orange-400 border border-orange-500/30",
      ready: "bg-violet-500/20 text-violet-400 border border-violet-500/30",
      on_delivery: "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30",
      delivered: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
      cancelled: "bg-red-500/20 text-red-400 border border-red-500/30",
    };
    return colors[status] || "bg-zinc-500/20 text-zinc-400 border border-zinc-500/30";
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
      paid: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
      failed: "bg-red-500/20 text-red-400 border border-red-500/30",
      expired: "bg-zinc-500/20 text-zinc-400 border border-zinc-500/30",
      refunded: "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30",
    };
    return colors[status] || "bg-zinc-500/20 text-zinc-400 border border-zinc-500/30";
  };

  const filteredOrders = orders
    .filter((o) => (filterStatus === "all" ? true : o.status === filterStatus))
    .filter((o) => (filterPayment === "all" ? true : o.paymentStatus === filterPayment));

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-violet-500 mx-auto mb-4"></div>
          <p className="text-zinc-400">Memuat data pesanan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Kelola Pesanan</h1>
            <p className="text-zinc-400 mt-1">Manage all orders in the system</p>
          </div>
          <Link href="/admin/dashboard">
            <Button variant="outline">← Kembali ke Dashboard</Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-[#121215] rounded-2xl border border-white/10 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Filter by Order Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              >
                <option value="all" className="bg-[#121215]">Semua Status</option>
                <option value="pending" className="bg-[#121215]">Pending</option>
                <option value="confirmed" className="bg-[#121215]">Confirmed</option>
                <option value="preparing" className="bg-[#121215]">Preparing</option>
                <option value="ready" className="bg-[#121215]">Ready</option>
                <option value="on_delivery" className="bg-[#121215]">On Delivery</option>
                <option value="delivered" className="bg-[#121215]">Delivered</option>
                <option value="cancelled" className="bg-[#121215]">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Filter by Payment Status
              </label>
              <select
                value={filterPayment}
                onChange={(e) => setFilterPayment(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              >
                <option value="all" className="bg-[#121215]">Semua Status</option>
                <option value="pending" className="bg-[#121215]">Pending</option>
                <option value="paid" className="bg-[#121215]">Paid</option>
                <option value="failed" className="bg-[#121215]">Failed</option>
                <option value="expired" className="bg-[#121215]">Expired</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-[#121215] rounded-2xl border border-white/10 p-6">
            <div className="text-sm text-zinc-400">Total Orders</div>
            <div className="text-3xl font-bold text-white">{orders.length}</div>
          </div>
          <div className="bg-[#121215] rounded-2xl border border-amber-500/30 p-6 shadow-lg shadow-amber-500/10">
            <div className="text-sm text-amber-400">Pending</div>
            <div className="text-3xl font-bold text-white">
              {orders.filter((o) => o.status === "pending").length}
            </div>
          </div>
          <div className="bg-[#121215] rounded-2xl border border-cyan-500/30 p-6 shadow-lg shadow-cyan-500/10">
            <div className="text-sm text-cyan-400">Confirmed</div>
            <div className="text-3xl font-bold text-white">
              {orders.filter((o) => o.status === "confirmed").length}
            </div>
          </div>
          <div className="bg-[#121215] rounded-2xl border border-emerald-500/30 p-6 shadow-lg shadow-emerald-500/10">
            <div className="text-sm text-emerald-400">Delivered</div>
            <div className="text-3xl font-bold text-white">
              {orders.filter((o) => o.status === "delivered").length}
            </div>
          </div>
          <div className="bg-[#121215] rounded-2xl border border-violet-500/30 p-6 shadow-lg shadow-violet-500/10">
            <div className="text-sm text-violet-400">Revenue</div>
            <div className="text-2xl font-bold text-white">
              Rp {orders.filter((o) => o.paymentStatus === "paid").reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString("id-ID")}
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-[#121215] rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase">
                    Warkop
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase">
                    Order Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase">
                    Payment Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link href={`/order-tracking/${order.orderId}`}>
                        <span className="text-sm font-medium text-violet-400 hover:text-violet-300">
                          {order.orderId}
                        </span>
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{order.warkopName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">
                        Rp {order.totalAmount.toLocaleString("id-ID")}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-zinc-300">
                        {order.paymentDetails.method === "cod" ? "COD" : order.paymentDetails.midtransPaymentType || "Midtrans"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(order.orderId, e.target.value)}
                        className={`text-xs px-2 py-1 rounded-full font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white/5 ${getStatusColor(order.status)}`}
                      >
                        <option value="pending" className="bg-[#121215] text-white">Pending</option>
                        <option value="confirmed" className="bg-[#121215] text-white">Confirmed</option>
                        <option value="preparing" className="bg-[#121215] text-white">Preparing</option>
                        <option value="ready" className="bg-[#121215] text-white">Ready</option>
                        <option value="on_delivery" className="bg-[#121215] text-white">On Delivery</option>
                        <option value="delivered" className="bg-[#121215] text-white">Delivered</option>
                        <option value="cancelled" className="bg-[#121215] text-white">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">
                      {new Date(order.createdAt).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/order-tracking/${order.orderId}`}>
                        <span className="text-violet-400 hover:text-violet-300">View</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <p className="text-zinc-500">Tidak ada pesanan ditemukan</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
