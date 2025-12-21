"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import Button from "@/components/ui/Button";

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: "admin" | "customer" | "warkop_owner";
  isVerified: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, isAuthenticated, authLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "customer" | "warkop_owner" | "admin">("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "admin")) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, authLoading, user, router]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("warkop-kamoe-token");
      const response = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.data.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus user ini?")) return;

    try {
      const token = localStorage.getItem("warkop-kamoe-token");
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        alert("User berhasil dihapus");
        fetchUsers();
      } else {
        alert("Gagal menghapus user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Terjadi kesalahan");
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const token = localStorage.getItem("warkop-kamoe-token");
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        alert("Role berhasil diupdate");
        fetchUsers();
      } else {
        alert("Gagal mengupdate role");
      }
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Terjadi kesalahan");
    }
  };

  const filteredUsers = users
    .filter((u) => (filter === "all" ? true : u.role === filter))
    .filter((u) =>
      searchTerm
        ? u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase())
        : true
    );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-violet-500 mx-auto mb-4"></div>
          <p className="text-zinc-400">Memuat data users...</p>
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
            <h1 className="text-3xl font-bold text-white">Kelola Users</h1>
            <p className="text-zinc-400 mt-1">Manage all users in the system</p>
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
                Filter by Role
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as typeof filter)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              >
                <option value="all" className="bg-[#121215]">Semua Role</option>
                <option value="customer" className="bg-[#121215]">Customer</option>
                <option value="warkop_owner" className="bg-[#121215]">Warkop Owner</option>
                <option value="admin" className="bg-[#121215]">Admin</option>
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
                placeholder="Cari nama atau email..."
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#121215] rounded-2xl border border-white/10 p-6">
            <div className="text-sm text-zinc-400">Total Users</div>
            <div className="text-3xl font-bold text-white">{users.length}</div>
          </div>
          <div className="bg-[#121215] rounded-2xl border border-cyan-500/30 p-6 shadow-lg shadow-cyan-500/10">
            <div className="text-sm text-cyan-400">Customers</div>
            <div className="text-3xl font-bold text-white">
              {users.filter((u) => u.role === "customer").length}
            </div>
          </div>
          <div className="bg-[#121215] rounded-2xl border border-emerald-500/30 p-6 shadow-lg shadow-emerald-500/10">
            <div className="text-sm text-emerald-400">Warkop Owners</div>
            <div className="text-3xl font-bold text-white">
              {users.filter((u) => u.role === "warkop_owner").length}
            </div>
          </div>
          <div className="bg-[#121215] rounded-2xl border border-violet-500/30 p-6 shadow-lg shadow-violet-500/10">
            <div className="text-sm text-violet-400">Admins</div>
            <div className="text-3xl font-bold text-white">
              {users.filter((u) => u.role === "admin").length}
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-[#121215] rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Registered
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                          <span className="text-white font-semibold">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">
                            {user.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-zinc-300">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-zinc-300">
                        {user.phone || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.role}
                        onChange={(e) => handleUpdateRole(user._id, e.target.value)}
                        className="text-sm px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                      >
                        <option value="customer" className="bg-[#121215]">Customer</option>
                        <option value="warkop_owner" className="bg-[#121215]">Warkop Owner</option>
                        <option value="admin" className="bg-[#121215]">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.isVerified
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        }`}
                      >
                        {user.isVerified ? "Verified" : "Unverified"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">
                      {new Date(user.createdAt).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-zinc-500">Tidak ada user ditemukan</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
