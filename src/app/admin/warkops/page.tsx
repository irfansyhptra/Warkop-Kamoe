"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import Button from "@/components/ui/Button";

interface Warkop {
  _id: string;
  name: string;
  description: string;
  ownerId: string;
  address: string;
  city: string;
  phone: string;
  isVerified: boolean;
  isActive: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
}

export default function AdminWarkopsPage() {
  const router = useRouter();
  const { user, isAuthenticated, authLoading } = useAuth();
  const [warkops, setWarkops] = useState<Warkop[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterVerified, setFilterVerified] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "admin")) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, authLoading, user, router]);

  useEffect(() => {
    fetchWarkops();
  }, []);

  const fetchWarkops = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("warkop-kamoe-token");
      const response = await fetch("/api/warkops", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setWarkops(data.data.warkops);
      }
    } catch (error) {
      console.error("Error fetching warkops:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyWarkop = async (warkopId: string, verify: boolean) => {
    try {
      const token = localStorage.getItem("warkop-kamoe-token");
      const response = await fetch(`/api/admin/warkops/${warkopId}/verify`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isVerified: verify }),
      });

      if (response.ok) {
        alert(verify ? "Warkop berhasil diverifikasi" : "Verifikasi warkop dibatalkan");
        fetchWarkops();
      } else {
        alert("Gagal mengupdate verifikasi");
      }
    } catch (error) {
      console.error("Error verifying warkop:", error);
      alert("Terjadi kesalahan");
    }
  };

  const handleToggleActive = async (warkopId: string, isActive: boolean) => {
    try {
      const token = localStorage.getItem("warkop-kamoe-token");
      const response = await fetch(`/api/warkops/${warkopId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive }),
      });

      if (response.ok) {
        alert(`Warkop berhasil di${isActive ? "aktifkan" : "nonaktifkan"}`);
        fetchWarkops();
      } else {
        alert("Gagal mengupdate status");
      }
    } catch (error) {
      console.error("Error toggling active:", error);
      alert("Terjadi kesalahan");
    }
  };

  const filteredWarkops = warkops
    .filter((w) => {
      if (filterVerified === "verified") return w.isVerified;
      if (filterVerified === "unverified") return !w.isVerified;
      return true;
    })
    .filter((w) =>
      searchTerm
        ? w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          w.city.toLowerCase().includes(searchTerm.toLowerCase())
        : true
    );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data warkop...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Kelola Warkop</h1>
            <p className="text-gray-600 mt-1">Manage all warkops in the system</p>
          </div>
          <Link href="/admin/dashboard">
            <Button variant="outline">← Kembali ke Dashboard</Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                value={filterVerified}
                onChange={(e) => setFilterVerified(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Semua Status</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama atau kota..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="text-sm text-gray-600">Total Warkops</div>
            <div className="text-3xl font-bold text-gray-900">{warkops.length}</div>
          </div>
          <div className="bg-green-50 rounded-2xl shadow-sm p-6">
            <div className="text-sm text-green-600">Verified</div>
            <div className="text-3xl font-bold text-green-900">
              {warkops.filter((w) => w.isVerified).length}
            </div>
          </div>
          <div className="bg-yellow-50 rounded-2xl shadow-sm p-6">
            <div className="text-sm text-yellow-600">Pending</div>
            <div className="text-3xl font-bold text-yellow-900">
              {warkops.filter((w) => !w.isVerified).length}
            </div>
          </div>
          <div className="bg-blue-50 rounded-2xl shadow-sm p-6">
            <div className="text-sm text-blue-600">Active</div>
            <div className="text-3xl font-bold text-blue-900">
              {warkops.filter((w) => w.isActive).length}
            </div>
          </div>
        </div>

        {/* Warkops Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Warkop
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Verified
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Registered
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredWarkops.map((warkop) => (
                  <tr key={warkop._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                          <span className="text-amber-600 font-semibold text-lg">
                            {warkop.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {warkop.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {warkop.description.substring(0, 50)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{warkop.city}</div>
                      <div className="text-sm text-gray-500">
                        {warkop.address.substring(0, 30)}...
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{warkop.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-yellow-400 mr-1">⭐</span>
                        <span className="text-sm font-medium">{warkop.rating.toFixed(1)}</span>
                        <span className="text-sm text-gray-500 ml-1">
                          ({warkop.reviewCount})
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={warkop.isActive}
                          onChange={(e) => handleToggleActive(warkop._id, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {warkop.isVerified ? (
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Verified
                        </span>
                      ) : (
                        <button
                          onClick={() => handleVerifyWarkop(warkop._id, true)}
                          className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                        >
                          Verify Now
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(warkop.createdAt).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/warkop/${warkop._id}`}>
                        <span className="text-indigo-600 hover:text-indigo-900 mr-4">
                          View
                        </span>
                      </Link>
                      {warkop.isVerified && (
                        <button
                          onClick={() => handleVerifyWarkop(warkop._id, false)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Unverify
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredWarkops.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Tidak ada warkop ditemukan</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
