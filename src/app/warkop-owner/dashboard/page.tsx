"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import Button from "@/components/ui/Button";

interface DashboardStats {
  totalMenuItems: number;
  availableItems: number;
  totalOrders: number;
  pendingOrders: number;
  todayRevenue: number;
  monthlyRevenue: number;
  topSellingItems: Array<{
    menuItem: {
      name: string;
      price: number;
    };
    quantity: number;
    revenue: number;
  }>;
  recentOrders: Array<{
    id: string;
    customerName: string;
    totalPrice: number;
    status: string;
    createdAt: string;
  }>;
}

export default function WarkopOwnerDashboardPro() {
  const router = useRouter();
  const { user, isAuthenticated, authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalMenuItems: 0,
    availableItems: 0,
    totalOrders: 0,
    pendingOrders: 0,
    todayRevenue: 0,
    monthlyRevenue: 0,
    topSellingItems: [],
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check authentication
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || user?.role !== "warkop_owner") {
        router.push("/mywarkop");
        return;
      }
      
      // If authenticated as warkop owner, fetch stats
      if (user && user.role === "warkop_owner") {
        fetchStats();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authLoading, user, router]);

  // Fetch dashboard stats
  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("warkop-kamoe-token");

      const response = await fetch("/api/warkop-owner/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.data);
        } else {
          setError(data.error || "Gagal memuat data dashboard");
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Gagal memuat data dashboard");
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
      setError("Terjadi kesalahan saat memuat data");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-violet-500 mx-auto mb-4"></div>
          <p className="text-zinc-400 font-medium">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "warkop_owner") {
    return null;
  }

  // Show setup prompt if no warkop yet
  if (!loading && stats.totalMenuItems === 0 && stats.totalOrders === 0 && !user.warkopId) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-8 text-center">
            <div className="w-20 h-20 bg-violet-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-violet-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Selamat Datang!
            </h2>
            <p className="text-zinc-400 mb-6">
              Anda belum melengkapi setup warkop. Silakan lengkapi informasi warkop Anda untuk mulai berjualan.
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push("/warkop-owner/setup")}
              className="w-full bg-gradient-to-r from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25"
            >
              Setup Warkop Sekarang
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      confirmed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      preparing: "bg-orange-500/10 text-orange-400 border-orange-500/20",
      ready: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      delivered: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
      cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: "Menunggu",
      confirmed: "Dikonfirmasi",
      preparing: "Diproses",
      ready: "Siap",
      delivered: "Selesai",
      cancelled: "Dibatalkan",
    };
    return labels[status as keyof typeof labels] || status;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      {/* Header */}
      <div className="bg-black/40 backdrop-blur-xl border-b border-white/5 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Dashboard Warkop Owner
              </h1>
              <p className="text-zinc-400 mt-1">
                Selamat datang, <span className="font-semibold text-violet-400">{user.name}</span>
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/warkop-owner/settings">
                <Button variant="outline" size="md" className="border-white/10 text-zinc-400 hover:text-white hover:bg-white/5">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Pengaturan
                </Button>
              </Link>
              <Link href="/warkop-owner/charts">
                <Button variant="outline" size="md" className="border-white/10 text-zinc-400 hover:text-white hover:bg-white/5">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  Grafik
                </Button>
              </Link>
              <Link href="/warkop-owner/menu">
                <Button variant="primary" size="md" className="bg-gradient-to-r from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  Kelola Menu
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" size="md" className="border-white/10 text-zinc-400 hover:text-white hover:bg-white/5">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  Beranda
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-500/10 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="flex items-center">
              <svg
                className="w-6 h-6 text-red-400 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-red-400 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Stats Cards Row 1 - Revenue */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Today Revenue */}
          <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-emerald-500/20">
            <div className="p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-emerald-400 text-sm font-semibold uppercase tracking-wide">
                    Pendapatan Hari Ini
                  </p>
                  <p className="text-4xl font-bold mt-2 text-white">
                    Rp {stats.todayRevenue.toLocaleString("id-ID")}
                  </p>
                  <p className="text-zinc-400 text-sm mt-2">
                    {stats.totalOrders} pesanan hari ini
                  </p>
                </div>
                <div className="w-20 h-20 bg-emerald-500/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <svg
                    className="w-10 h-10 text-emerald-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Revenue */}
          <div className="bg-gradient-to-br from-violet-500/20 to-purple-600/10 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-violet-500/20">
            <div className="p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-violet-400 text-sm font-semibold uppercase tracking-wide">
                    Pendapatan Bulan Ini
                  </p>
                  <p className="text-4xl font-bold mt-2 text-white">
                    Rp {stats.monthlyRevenue.toLocaleString("id-ID")}
                  </p>
                  <p className="text-zinc-400 text-sm mt-2">
                    Total semua transaksi
                  </p>
                </div>
                <div className="w-20 h-20 bg-violet-500/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards Row 2 - Operations */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Menu */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group border border-[#e8dcc8]">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#8b6f5c] uppercase tracking-wide">
                    Total Menu
                  </p>
                  <p className="text-3xl font-bold text-[#5c3d2e] mt-2">
                    {stats.totalMenuItems}
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-[#c49a6c] to-[#b8956b] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-[#c49a6c] to-[#b8956b]"></div>
          </div>

          {/* Available Items */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group border border-[#e8dcc8]">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#8b6f5c] uppercase tracking-wide">
                    Tersedia
                  </p>
                  <p className="text-3xl font-bold text-[#5c3d2e] mt-2">
                    {stats.availableItems}
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
          </div>

          {/* Total Orders */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group border border-[#e8dcc8]">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#8b6f5c] uppercase tracking-wide">
                    Pesanan
                  </p>
                  <p className="text-3xl font-bold text-[#5c3d2e] mt-2">
                    {stats.totalOrders}
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
          </div>

          {/* Pending Orders */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group border border-[#e8dcc8]">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#8b6f5c] uppercase tracking-wide">
                    Pending
                  </p>
                  <p className="text-3xl font-bold text-[#5c3d2e] mt-2">
                    {stats.pendingOrders}
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-yellow-500 to-orange-500"></div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Selling Items */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-[#e8dcc8]">
            <div className="bg-gradient-to-r from-[#c49a6c] to-[#b8956b] px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center">
                <svg
                  className="w-6 h-6 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
                Menu Terlaris
              </h2>
            </div>
            <div className="p-6">
              {stats.topSellingItems.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-[#8b6f5c]">Belum ada data penjualan</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.topSellingItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-[#f5ede3] rounded-xl border border-[#e8dcc8] hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#c49a6c] to-[#b8956b] rounded-full flex items-center justify-center text-white font-bold text-lg">
                          #{index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-[#5c3d2e]">
                            {item.menuItem.name}
                          </p>
                          <p className="text-sm text-[#8b6f5c]">
                            {item.quantity} terjual • Rp{" "}
                            {item.revenue.toLocaleString("id-ID")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-[#8b6f5c]">Harga</p>
                        <p className="font-semibold text-[#c49a6c]">
                          Rp {item.menuItem.price.toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center">
                <svg
                  className="w-6 h-6 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Pesanan Terbaru
              </h2>
            </div>
            <div className="p-6">
              {stats.recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Belum ada pesanan</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-100"
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-gray-900">
                            {order.customerName}
                          </p>
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(
                              order.status
                            )}`}
                          >
                            {getStatusLabel(order.status)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600">
                            {new Date(order.createdAt).toLocaleString("id-ID")}
                          </p>
                          <p className="font-semibold text-indigo-600">
                            Rp {order.totalPrice.toLocaleString("id-ID")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
