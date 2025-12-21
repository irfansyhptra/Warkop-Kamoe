"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import Button from "@/components/ui/Button";

interface ChartData {
  dailyRevenue: Array<{ date: string; revenue: number; orders: number }>;
  weeklyRevenue: Array<{ week: string; revenue: number; orders: number }>;
  monthlyRevenue: Array<{ month: string; revenue: number; orders: number }>;
  topSellingItems: Array<{ name: string; quantity: number; revenue: number }>;
  ordersByStatus: Array<{ status: string; count: number }>;
  revenueByPaymentMethod: Array<{ method: string; revenue: number; count: number }>;
}

export default function WarkopOwnerChartsPage() {
  const router = useRouter();
  const { user, isAuthenticated, authLoading } = useAuth();
  const [chartData, setChartData] = useState<ChartData>({
    dailyRevenue: [],
    weeklyRevenue: [],
    monthlyRevenue: [],
    topSellingItems: [],
    ordersByStatus: [],
    revenueByPaymentMethod: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");

  // Check authentication
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || user?.role !== "warkop_owner") {
        router.push("/mywarkop");
        return;
      }
    }
  }, [isAuthenticated, authLoading, user, router]);

  // Fetch chart data
  const fetchChartData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("warkop-kamoe-token");

      const response = await fetch(`/api/warkop-owner/charts?range=${timeRange}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setChartData(data.data);
        } else {
          setError(data.error || "Gagal memuat data chart");
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Gagal memuat data chart");
      }
    } catch (err) {
      console.error("Error fetching chart data:", err);
      setError("Terjadi kesalahan saat memuat data");
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    if (user && user.role === "warkop_owner") {
      fetchChartData();
    }
  }, [user, fetchChartData]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "warkop_owner") {
    return null;
  }

  const maxRevenue = Math.max(
    ...chartData.dailyRevenue.map((d) => d.revenue),
    1
  );
  const maxOrders = Math.max(
    ...chartData.dailyRevenue.map((d) => d.orders),
    1
  );

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500",
    confirmed: "bg-blue-500",
    preparing: "bg-orange-500",
    ready: "bg-green-500",
    delivered: "bg-gray-500",
    cancelled: "bg-red-500",
  };

  const statusLabels: Record<string, string> = {
    pending: "Menunggu",
    confirmed: "Dikonfirmasi",
    preparing: "Diproses",
    ready: "Siap",
    delivered: "Selesai",
    cancelled: "Dibatalkan",
  };
  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      {/* Header */}
      <div className="bg-[#121215] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Analitik & Grafik</h1>
              <p className="text-zinc-400 mt-1">Visualisasi data penjualan warkop Anda</p>
            </div>
            <div className="flex gap-3">
              <Link href="/warkop-owner/dashboard">
                <Button variant="outline" size="md">
                  ← Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Time Range Selector */}
        <div className="mb-8 flex items-center gap-4">
          <span className="text-zinc-300 font-medium">Periode:</span>
          <div className="flex gap-2">
            {[
              { value: "7d", label: "7 Hari" },
              { value: "30d", label: "30 Hari" },
              { value: "90d", label: "90 Hari" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setTimeRange(option.value as "7d" | "30d" | "90d")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  timeRange === option.value
                    ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30"
                    : "bg-white/5 text-zinc-300 hover:bg-white/10 border border-white/10"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 p-4 rounded-lg">
            <p className="text-red-400 font-medium">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-violet-500"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Daily Revenue Chart */}
            <div className="bg-[#121215] rounded-2xl border border-white/10 p-6">
              <h2 className="text-xl font-bold text-white mb-6">Pendapatan Harian</h2>
              {chartData.dailyRevenue.length === 0 ? (
                <div className="text-center py-12 text-zinc-400">
                  <div className="text-4xl mb-2">📊</div>
                  <p>Belum ada data pendapatan</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Bar Chart */}
                  <div className="flex items-end gap-2 h-64 border-b border-white/10 pb-4">
                    {chartData.dailyRevenue.map((day, index) => (
                      <div
                        key={index}
                        className="flex-1 flex flex-col items-center group"
                      >
                        <div className="relative w-full flex flex-col items-center">
                          {/* Tooltip */}
                          <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            <div>Rp {day.revenue.toLocaleString("id-ID")}</div>
                            <div>{day.orders} pesanan</div>
                          </div>
                          {/* Revenue Bar */}
                          <div
                            className="w-full bg-gradient-to-t from-violet-500 to-purple-600 rounded-t-lg transition-all duration-300 hover:from-violet-600 hover:to-purple-700"
                            style={{
                              height: `${(day.revenue / maxRevenue) * 200}px`,
                              minHeight: day.revenue > 0 ? "8px" : "0px",
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* X-axis labels */}
                  <div className="flex gap-2">
                    {chartData.dailyRevenue.map((day, index) => (
                      <div key={index} className="flex-1 text-center text-xs text-zinc-400">
                        {new Date(day.date).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Top Selling Items */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Menu Terlaris
                </h2>
                {chartData.topSellingItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">🍽️</div>
                    <p>Belum ada data penjualan</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {chartData.topSellingItems.slice(0, 5).map((item, index) => {
                      const maxQty = chartData.topSellingItems[0]?.quantity || 1;
                      const percentage = (item.quantity / maxQty) * 100;
                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium text-gray-900">
                              {index + 1}. {item.name}
                            </span>
                            <span className="text-gray-600">
                              {item.quantity} terjual
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <div className="text-right text-xs text-gray-500">
                            Rp {item.revenue.toLocaleString("id-ID")}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Orders by Status */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Status Pesanan
                </h2>
                {chartData.ordersByStatus.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">📦</div>
                    <p>Belum ada data pesanan</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Pie-like visualization */}
                    <div className="flex items-center justify-center gap-2 flex-wrap mb-6">
                      {chartData.ordersByStatus.map((status, index) => {
                        const total = chartData.ordersByStatus.reduce(
                          (sum, s) => sum + s.count,
                          0
                        );
                        const percentage =
                          total > 0 ? (status.count / total) * 100 : 0;
                        return (
                          <div
                            key={index}
                            className={`${
                              statusColors[status.status] || "bg-gray-500"
                            } text-white rounded-lg px-4 py-2 text-sm font-medium`}
                            style={{
                              flex: `${Math.max(percentage, 10)}%`,
                              minWidth: "80px",
                            }}
                          >
                            {percentage.toFixed(0)}%
                          </div>
                        );
                      })}
                    </div>
                    {/* Legend */}
                    <div className="grid grid-cols-2 gap-3">
                      {chartData.ordersByStatus.map((status, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                statusColors[status.status] || "bg-gray-500"
                              }`}
                            />
                            <span className="text-sm text-gray-700">
                              {statusLabels[status.status] || status.status}
                            </span>
                          </div>
                          <span className="font-bold text-gray-900">
                            {status.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Revenue by Payment Method */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Pendapatan per Metode Pembayaran
              </h2>
              {chartData.revenueByPaymentMethod.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">💳</div>
                  <p>Belum ada data pembayaran</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {chartData.revenueByPaymentMethod.map((method, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100"
                    >
                      <div className="text-sm text-blue-600 font-medium uppercase tracking-wide mb-2">
                        {method.method === "cod" ? "Cash on Delivery" : method.method === "midtrans" ? "Midtrans" : method.method}
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        Rp {method.revenue.toLocaleString("id-ID")}
                      </div>
                      <div className="text-sm text-gray-600">
                        {method.count} transaksi
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
                <div className="text-green-100 text-sm font-medium mb-1">
                  Total Pendapatan
                </div>
                <div className="text-3xl font-bold">
                  Rp{" "}
                  {chartData.dailyRevenue
                    .reduce((sum, d) => sum + d.revenue, 0)
                    .toLocaleString("id-ID")}
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
                <div className="text-blue-100 text-sm font-medium mb-1">
                  Total Pesanan
                </div>
                <div className="text-3xl font-bold">
                  {chartData.dailyRevenue.reduce((sum, d) => sum + d.orders, 0)}
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white">
                <div className="text-purple-100 text-sm font-medium mb-1">
                  Rata-rata per Hari
                </div>
                <div className="text-3xl font-bold">
                  Rp{" "}
                  {chartData.dailyRevenue.length > 0
                    ? Math.round(
                        chartData.dailyRevenue.reduce((sum, d) => sum + d.revenue, 0) /
                          chartData.dailyRevenue.length
                      ).toLocaleString("id-ID")
                    : 0}
                </div>
              </div>
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white">
                <div className="text-amber-100 text-sm font-medium mb-1">
                  Menu Terlaris
                </div>
                <div className="text-xl font-bold truncate">
                  {chartData.topSellingItems[0]?.name || "-"}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
