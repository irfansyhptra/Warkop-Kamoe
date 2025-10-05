"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNotification } from "@/hooks/useNotification";
import { User, Warkop, Order } from "@/types";
import Button from "@/components/ui/Button";

// Mock data
const mockUsers: User[] = [
  {
    id: "1",
    name: "John Customer",
    email: "customer@example.com",
    role: "customer",
    favoriteWarkops: [],
    isVerified: true,
  },
  {
    id: "2",
    name: "Warkop Owner",
    email: "owner@example.com",
    role: "warkop_owner",
    favoriteWarkops: [],
    warkopId: "warkop-1",
    isVerified: false,
  },
];

const mockWarkops: Warkop[] = [
  {
    id: "warkop-1",
    name: "Kopi Kita",
    description: "Warkop legendaris",
    location: "Jakarta",
    coordinates: { lat: -6.2088, lng: 106.8456 },
    rating: 4.5,
    totalReviews: 150,
    categories: ["Kopi"],
    distance: "1.2 km",
    badges: [],
    busyLevel: "Ramai",
    images: [],
    openingHours: { open: "06:00", close: "23:00", is24Hours: false },
    contactInfo: { phone: "021-12345678" },
    facilities: [],
    menu: [],
  },
];

const mockOrders: Order[] = [
  {
    id: "order-1",
    userId: "1",
    items: [],
    totalAmount: 25000,
    status: "delivered",
    orderDate: new Date().toISOString(),
    deliveryInfo: {
      name: "John Doe",
      phone: "08123456789",
      address: "Jakarta",
    },
    paymentMethod: "qris",
    estimatedDeliveryTime: "11:00",
  },
  {
    id: "order-2",
    userId: "1",
    items: [],
    totalAmount: 35000,
    status: "preparing",
    orderDate: new Date().toISOString(),
    deliveryInfo: {
      name: "Jane Doe",
      phone: "08123456789",
      address: "Jakarta",
    },
    paymentMethod: "cod",
    estimatedDeliveryTime: "12:00",
  },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "users" | "warkops" | "transactions"
  >("overview");
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [warkops] = useState<Warkop[]>(mockWarkops);
  const [orders] = useState<Order[]>(mockOrders);

  const { user } = useAuth();
  const { showSuccess } = useNotification();

  const handleVerifyWarkop = (warkopId: string) => {
    // Update warkop verification status
    setUsers(
      users.map((user) =>
        user.warkopId === warkopId ? { ...user, isVerified: true } : user
      )
    );
    showSuccess("Warkop Diverifikasi", "Warkop berhasil diverifikasi");
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter((u) => u.id !== userId));
    showSuccess("User Dihapus", "User berhasil dihapus");
  };

  const getTotalRevenue = () => {
    return orders.reduce((total, order) => total + order.totalAmount, 0);
  };

  const getTotalUsers = () => {
    return users.filter((u) => u.role === "customer").length;
  };

  const getTotalWarkops = () => {
    return users.filter((u) => u.role === "warkop_owner").length;
  };

  const getPendingVerifications = () => {
    return users.filter((u) => u.role === "warkop_owner" && !u.isVerified)
      .length;
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Akses Ditolak</h1>
          <p className="text-gray-600 mt-2">Anda harus login sebagai admin</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Selamat datang, {user.name}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {[
                { id: "overview", label: "Overview", icon: "📊" },
                { id: "users", label: "Kelola User", icon: "👥" },
                { id: "warkops", label: "Kelola Warkop", icon: "🏪" },
                { id: "transactions", label: "Transaksi", icon: "💰" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 ${
                    activeTab === tab.id
                      ? "border-amber-600 text-amber-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div>
                <h2 className="text-xl font-semibold mb-6">
                  Dashboard Overview
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100">Total User</p>
                        <p className="text-3xl font-bold">{getTotalUsers()}</p>
                      </div>
                      <div className="text-4xl opacity-80">👥</div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100">Total Warkop</p>
                        <p className="text-3xl font-bold">
                          {getTotalWarkops()}
                        </p>
                      </div>
                      <div className="text-4xl opacity-80">🏪</div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-amber-100">Total Transaksi</p>
                        <p className="text-3xl font-bold">{orders.length}</p>
                      </div>
                      <div className="text-4xl opacity-80">📋</div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100">Total Revenue</p>
                        <p className="text-xl font-bold">
                          Rp {getTotalRevenue().toLocaleString("id-ID")}
                        </p>
                      </div>
                      <div className="text-4xl opacity-80">💰</div>
                    </div>
                  </div>
                </div>

                {/* Pending Verifications */}
                {getPendingVerifications() > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-6">
                    <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                      Verifikasi Menunggu
                    </h3>
                    <p className="text-yellow-700">
                      Ada {getPendingVerifications()} warkop yang menunggu
                      verifikasi.
                    </p>
                    <Button
                      onClick={() => setActiveTab("warkops")}
                      variant="primary"
                      size="sm"
                      className="mt-3"
                    >
                      Lihat Warkop
                    </Button>
                  </div>
                )}

                {/* Recent Activity */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Aktivitas Terbaru
                  </h3>
                  <div className="space-y-3">
                    {orders.slice(0, 5).map((order) => (
                      <div
                        key={order.id}
                        className="flex justify-between items-center py-2"
                      >
                        <div>
                          <p className="font-medium">Pesanan #{order.id}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(order.orderDate).toLocaleDateString(
                              "id-ID"
                            )}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            Rp {order.totalAmount.toLocaleString("id-ID")}
                          </p>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              order.status === "delivered"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {order.status === "delivered"
                              ? "Selesai"
                              : "Proses"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Kelola User</h2>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4">Nama</th>
                        <th className="text-left py-3 px-4">Email</th>
                        <th className="text-left py-3 px-4">Role</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} className="border-b border-gray-100">
                          <td className="py-3 px-4 font-medium">{u.name}</td>
                          <td className="py-3 px-4">{u.email}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                u.role === "admin"
                                  ? "bg-red-100 text-red-800"
                                  : u.role === "warkop_owner"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {u.role === "admin"
                                ? "Admin"
                                : u.role === "warkop_owner"
                                ? "Owner"
                                : "Customer"}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                u.isVerified
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {u.isVerified ? "Verified" : "Pending"}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              {u.role === "warkop_owner" && !u.isVerified && (
                                <Button
                                  onClick={() =>
                                    handleVerifyWarkop(u.warkopId!)
                                  }
                                  variant="primary"
                                  size="sm"
                                >
                                  Verifikasi
                                </Button>
                              )}
                              {u.role !== "admin" && (
                                <Button
                                  onClick={() => handleDeleteUser(u.id)}
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 border-red-600 hover:bg-red-50"
                                >
                                  Hapus
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Warkops Tab */}
            {activeTab === "warkops" && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Kelola Warkop</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {warkops.map((warkop) => {
                    const owner = users.find((u) => u.warkopId === warkop.id);
                    return (
                      <div
                        key={warkop.id}
                        className="border border-gray-200 rounded-xl p-6"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold">
                              {warkop.name}
                            </h3>
                            <p className="text-gray-600">{warkop.location}</p>
                            <p className="text-sm text-gray-500">
                              Owner: {owner?.name} ({owner?.email})
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-sm ${
                              owner?.isVerified
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {owner?.isVerified ? "Verified" : "Pending"}
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                          <span>
                            ⭐ {warkop.rating} ({warkop.totalReviews} ulasan)
                          </span>
                          <span>{warkop.categories.join(", ")}</span>
                        </div>

                        <div className="flex gap-2">
                          {!owner?.isVerified && (
                            <Button
                              onClick={() => handleVerifyWarkop(warkop.id)}
                              variant="primary"
                              size="sm"
                            >
                              Verifikasi
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            Lihat Detail
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Transactions Tab */}
            {activeTab === "transactions" && (
              <div>
                <h2 className="text-xl font-semibold mb-6">
                  Laporan Transaksi
                </h2>

                <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-4">Ringkasan</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-gray-600">Total Transaksi</p>
                      <p className="text-2xl font-bold">{orders.length}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-bold">
                        Rp {getTotalRevenue().toLocaleString("id-ID")}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Rata-rata per Transaksi</p>
                      <p className="text-2xl font-bold">
                        Rp{" "}
                        {Math.round(
                          getTotalRevenue() / orders.length
                        ).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4">ID Pesanan</th>
                        <th className="text-left py-3 px-4">Tanggal</th>
                        <th className="text-left py-3 px-4">Customer</th>
                        <th className="text-left py-3 px-4">Total</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Pembayaran</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => {
                        const customer = users.find(
                          (u) => u.id === order.userId
                        );
                        return (
                          <tr
                            key={order.id}
                            className="border-b border-gray-100"
                          >
                            <td className="py-3 px-4 font-medium">
                              {order.id}
                            </td>
                            <td className="py-3 px-4">
                              {new Date(order.orderDate).toLocaleDateString(
                                "id-ID"
                              )}
                            </td>
                            <td className="py-3 px-4">
                              {customer?.name || "Unknown"}
                            </td>
                            <td className="py-3 px-4 font-medium">
                              Rp {order.totalAmount.toLocaleString("id-ID")}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  order.status === "delivered"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {order.status === "delivered"
                                  ? "Selesai"
                                  : "Proses"}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                                {order.paymentMethod.toUpperCase()}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
