"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 1234,
    totalWarkops: 45,
    totalOrders: 567,
    pendingOrders: 23,
    totalRevenue: 125000000,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800">
              {" "}
              Admin Dashboard
            </h1>
            <Link href="/">
              <Button variant="outline"> Beranda</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <p className="text-gray-600 text-sm">Total Pesanan</p>
            <p className="text-3xl font-bold text-gray-800 mt-2">
              {stats.totalOrders}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
            <p className="text-gray-600 text-sm">Pending</p>
            <p className="text-3xl font-bold text-gray-800 mt-2">
              {stats.pendingOrders}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <p className="text-gray-600 text-sm">Total Warkop</p>
            <p className="text-3xl font-bold text-gray-800 mt-2">
              {stats.totalWarkops}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
            <p className="text-gray-600 text-sm">Pendapatan</p>
            <p className="text-2xl font-bold text-gray-800 mt-2">
              Rp {stats.totalRevenue.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
