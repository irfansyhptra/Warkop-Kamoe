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
        method: "PATCH",
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
        const errorData = await response.json();
        alert(errorData.error || "Gagal mengupdate verifikasi");
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
        method: "PUT",
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
        const errorData = await response.json();
        alert(errorData.error || "Gagal mengupdate status");
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
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-violet-500 mx-auto mb-4"></div>
          <p className="text-zinc-400">Memuat data warkop...</p>
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
            <h1 className="text-3xl font-bold text-white">Kelola Warkop</h1>
            <p className="text-zinc-400 mt-1">Manage all warkops in the system</p>
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
                Filter by Status
              </label>
              <select
                value={filterVerified}
                onChange={(e) => setFilterVerified(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              >
                <option value="all" className="bg-[#121215]">Semua Status</option>
                <option value="verified" className="bg-[#121215]">Verified</option>
                <option value="unverified" className="bg-[#121215]">Unverified</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama atau kota..."
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#121215] rounded-2xl border border-white/10 p-6">
            <div className="text-sm text-zinc-400">Total Warkops</div>
            <div className="text-3xl font-bold text-white">{warkops.length}</div>
          </div>
          <div className="bg-[#121215] rounded-2xl border border-emerald-500/30 p-6 shadow-lg shadow-emerald-500/10">
            <div className="text-sm text-emerald-400">Verified</div>
            <div className="text-3xl font-bold text-white">
              {warkops.filter((w) => w.isVerified).length}
            </div>
          </div>
          <div className="bg-[#121215] rounded-2xl border border-amber-500/30 p-6 shadow-lg shadow-amber-500/10">
            <div className="text-sm text-amber-400">Pending</div>
            <div className="text-3xl font-bold text-white">
              {warkops.filter((w) => !w.isVerified).length}
            </div>
          </div>
          <div className="bg-[#121215] rounded-2xl border border-cyan-500/30 p-6 shadow-lg shadow-cyan-500/10">
            <div className="text-sm text-cyan-400">Active</div>
            <div className="text-3xl font-bold text-white">
              {warkops.filter((w) => w.isActive).length}
            </div>
          </div>
        </div>

        {/* Warkops Table */}
        <div className="bg-[#121215] rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase">
                    Warkop
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase">
                    Verified
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase">
                    Registered
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredWarkops.map((warkop) => (
                  <tr key={warkop._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                          <span className="text-white font-semibold text-lg">
                            {warkop.name?.charAt(0)?.toUpperCase() || "W"}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">
                            {warkop.name || "Unnamed Warkop"}
                          </div>
                          <div className="text-sm text-zinc-500">
                            {warkop.description ? warkop.description.substring(0, 50) + "..." : "No description"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{warkop.city || "-"}</div>
                      <div className="text-sm text-zinc-500">
                        {warkop.address ? warkop.address.substring(0, 30) + "..." : "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-zinc-300">{warkop.phone || "-"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-amber-400 mr-1">⭐</span>
                        <span className="text-sm font-medium text-white">{(warkop.rating || 0).toFixed(1)}</span>
                        <span className="text-sm text-zinc-500 ml-1">
                          ({warkop.reviewCount || 0})
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
                        <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-500/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                      </label>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {warkop.isVerified ? (
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Verified
                        </span>
                      ) : (
                        <button
                          onClick={() => handleVerifyWarkop(warkop._id, true)}
                          className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 transition-colors"
                        >
                          Verify Now
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">
                      {new Date(warkop.createdAt).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/warkop/${warkop._id}`}>
                        <span className="text-violet-400 hover:text-violet-300 mr-4">
                          View
                        </span>
                      </Link>
                      {warkop.isVerified && (
                        <button
                          onClick={() => handleVerifyWarkop(warkop._id, false)}
                          className="text-red-400 hover:text-red-300"
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
              <p className="text-zinc-500">Tidak ada warkop ditemukan</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
