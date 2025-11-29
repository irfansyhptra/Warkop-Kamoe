"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useOrderTracking } from "@/hooks/useOrderTracking";
import { useNotification } from "@/hooks/useNotification";
import { Order, MenuItem, SalesReport } from "@/types";
import Button from "@/components/ui/Button";

// Mock data
const mockMenuItems: MenuItem[] = [
  {
    id: "menu-1",
    name: "Kopi Hitam",
    price: 8000,
    description: "Kopi hitam robusta pilihan",
    category: "Kopi",
    availability: "available",
    isRecommended: true,
  },
  {
    id: "menu-2",
    name: "Kopi Susu",
    price: 12000,
    description: "Perpaduan kopi robusta dengan susu segar",
    category: "Kopi",
    availability: "available",
  },
];

const mockSalesReport: SalesReport = {
  date: new Date().toISOString(),
  totalOrders: 25,
  totalRevenue: 450000,
  topSellingItems: [
    {
      menuItem: mockMenuItems[0],
      quantity: 15,
      revenue: 120000,
    },
    {
      menuItem: mockMenuItems[1],
      quantity: 10,
      revenue: 120000,
    },
  ],
};

export default function WarkopOwnerDashboard() {
  const [activeTab, setActiveTab] = useState<"orders" | "menu" | "reports">(
    "orders"
  );
  const [menuItems, setMenuItems] = useState<MenuItem[]>(mockMenuItems);
  const [salesReport] = useState<SalesReport>(mockSalesReport);
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);
  const [newMenuItem, setNewMenuItem] = useState({
    name: "",
    price: 0,
    description: "",
    category: "Kopi",
    availability: "available" as MenuItem["availability"],
  });

  const { user } = useAuth();
  const { orders, updateOrderStatus } = useOrderTracking();
  const { showSuccess, showError } = useNotification();

  const handleStatusUpdate = (orderId: string, newStatus: Order["status"]) => {
    updateOrderStatus(orderId, newStatus);
    showSuccess("Status Diperbarui", `Pesanan ${orderId} telah diperbarui`);
  };

  const handleAddMenuItem = () => {
    if (!newMenuItem.name || !newMenuItem.price) {
      showError("Error", "Nama dan harga menu harus diisi");
      return;
    }

    const menuItem: MenuItem = {
      id: `menu-${Date.now()}`,
      ...newMenuItem,
    };

    setMenuItems([...menuItems, menuItem]);
    setNewMenuItem({
      name: "",
      price: 0,
      description: "",
      category: "Kopi",
      availability: "available",
    });
    showSuccess("Menu Ditambahkan", `${menuItem.name} berhasil ditambahkan`);
  };

  const handleEditMenuItem = (menuItem: MenuItem) => {
    setEditingMenu(menuItem);
  };

  const handleUpdateMenuItem = () => {
    if (!editingMenu) return;

    setMenuItems(
      menuItems.map((item) => (item.id === editingMenu.id ? editingMenu : item))
    );
    setEditingMenu(null);
    showSuccess("Menu Diperbarui", "Menu berhasil diperbarui");
  };

  const handleDeleteMenuItem = (menuId: string) => {
    setMenuItems(menuItems.filter((item) => item.id !== menuId));
    showSuccess("Menu Dihapus", "Menu berhasil dihapus");
  };

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "preparing":
        return "bg-orange-100 text-orange-800";
      case "ready":
        return "bg-green-100 text-green-800";
      case "delivered":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "Menunggu";
      case "confirmed":
        return "Dikonfirmasi";
      case "preparing":
        return "Diproses";
      case "ready":
        return "Siap";
      case "delivered":
        return "Selesai";
      default:
        return status;
    }
  };

  if (!user || user.role !== "warkop_owner") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Akses Ditolak</h1>
          <p className="text-gray-600 mt-2">
            Anda harus login sebagai pemilik warkop
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Warkop</h1>
          <p className="text-gray-600">Selamat datang, {user.name}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-amber-100 rounded-full">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Pesanan Hari Ini</p>
                <p className="text-2xl font-bold text-gray-900">
                  {salesReport.totalOrders}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <span className="text-2xl">💰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Pendapatan Hari Ini</p>
                <p className="text-2xl font-bold text-gray-900">
                  Rp {salesReport.totalRevenue.toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <span className="text-2xl">🍽️</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Menu</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {menuItems.length}
                  </p>
                </div>
              </div>
              <Link href="/warkop-owner/menu">
                <Button variant="ghost" size="sm">
                  Kelola Menu →
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {[
                { id: "orders", label: "Pesanan", icon: "📋" },
                { id: "menu", label: "Kelola Menu", icon: "🍽️" },
                { id: "reports", label: "Laporan", icon: "📊" },
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
            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Pesanan Masuk</h2>
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">📋</div>
                    <p className="text-gray-600">Belum ada pesanan</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="border border-gray-200 rounded-xl p-4"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold">
                              Pesanan #{order.id}
                            </h3>
                            <p className="text-gray-600 text-sm">
                              {new Date(order.orderDate).toLocaleDateString(
                                "id-ID"
                              )}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {getStatusLabel(order.status)}
                          </span>
                        </div>

                        <div className="space-y-2 mb-4">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex justify-between text-sm"
                            >
                              <span>
                                {item.menuItem.name} × {item.quantity}
                              </span>
                              <span>
                                Rp{" "}
                                {(
                                  item.menuItem.price * item.quantity
                                ).toLocaleString("id-ID")}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="text-sm text-gray-600">
                            <p>
                              {order.deliveryInfo.name} -{" "}
                              {order.deliveryInfo.phone}
                            </p>
                            <p>{order.deliveryInfo.address}</p>
                          </div>

                          <div className="flex gap-2">
                            {order.status === "pending" && (
                              <Button
                                onClick={() =>
                                  handleStatusUpdate(order.id, "confirmed")
                                }
                                variant="primary"
                                size="sm"
                              >
                                Konfirmasi
                              </Button>
                            )}
                            {order.status === "confirmed" && (
                              <Button
                                onClick={() =>
                                  handleStatusUpdate(order.id, "preparing")
                                }
                                variant="primary"
                                size="sm"
                              >
                                Mulai Proses
                              </Button>
                            )}
                            {order.status === "preparing" && (
                              <Button
                                onClick={() =>
                                  handleStatusUpdate(order.id, "ready")
                                }
                                variant="primary"
                                size="sm"
                              >
                                Siap Diantar
                              </Button>
                            )}
                            {order.status === "ready" && (
                              <Button
                                onClick={() =>
                                  handleStatusUpdate(order.id, "delivered")
                                }
                                variant="primary"
                                size="sm"
                              >
                                Selesai
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Menu Tab */}
            {activeTab === "menu" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Kelola Menu</h2>
                  <Button
                    onClick={() =>
                      setEditingMenu({
                        id: "",
                        name: "",
                        price: 0,
                        description: "",
                        category: "Kopi",
                        availability: "available",
                      })
                    }
                    variant="primary"
                  >
                    + Tambah Menu
                  </Button>
                </div>

                {/* Add/Edit Form */}
                {(editingMenu || newMenuItem.name) && (
                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <h3 className="font-semibold mb-4">
                      {editingMenu?.id ? "Edit Menu" : "Tambah Menu Baru"}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Nama Menu"
                        value={
                          editingMenu ? editingMenu.name : newMenuItem.name
                        }
                        onChange={(e) =>
                          editingMenu
                            ? setEditingMenu({
                                ...editingMenu,
                                name: e.target.value,
                              })
                            : setNewMenuItem({
                                ...newMenuItem,
                                name: e.target.value,
                              })
                        }
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <input
                        type="number"
                        placeholder="Harga"
                        value={
                          editingMenu ? editingMenu.price : newMenuItem.price
                        }
                        onChange={(e) =>
                          editingMenu
                            ? setEditingMenu({
                                ...editingMenu,
                                price: Number(e.target.value),
                              })
                            : setNewMenuItem({
                                ...newMenuItem,
                                price: Number(e.target.value),
                              })
                        }
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <select
                        value={
                          editingMenu
                            ? editingMenu.category
                            : newMenuItem.category
                        }
                        onChange={(e) =>
                          editingMenu
                            ? setEditingMenu({
                                ...editingMenu,
                                category: e.target.value,
                              })
                            : setNewMenuItem({
                                ...newMenuItem,
                                category: e.target.value,
                              })
                        }
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="Kopi">Kopi</option>
                        <option value="Makanan Berat">Makanan Berat</option>
                        <option value="Snack">Snack</option>
                        <option value="Minuman">Minuman</option>
                      </select>
                      <select
                        value={
                          editingMenu
                            ? editingMenu.availability
                            : newMenuItem.availability
                        }
                        onChange={(e) =>
                          editingMenu
                            ? setEditingMenu({
                                ...editingMenu,
                                availability: e.target
                                  .value as MenuItem["availability"],
                              })
                            : setNewMenuItem({
                                ...newMenuItem,
                                availability: e.target
                                  .value as MenuItem["availability"],
                              })
                        }
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="available">Tersedia</option>
                        <option value="limited">Terbatas</option>
                        <option value="unavailable">Habis</option>
                      </select>
                      <textarea
                        placeholder="Deskripsi"
                        value={
                          editingMenu
                            ? editingMenu.description
                            : newMenuItem.description
                        }
                        onChange={(e) =>
                          editingMenu
                            ? setEditingMenu({
                                ...editingMenu,
                                description: e.target.value,
                              })
                            : setNewMenuItem({
                                ...newMenuItem,
                                description: e.target.value,
                              })
                        }
                        className="md:col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        onClick={
                          editingMenu?.id
                            ? handleUpdateMenuItem
                            : handleAddMenuItem
                        }
                        variant="primary"
                        size="sm"
                      >
                        {editingMenu?.id ? "Update" : "Tambah"}
                      </Button>
                      <Button
                        onClick={() => {
                          setEditingMenu(null);
                          setNewMenuItem({
                            name: "",
                            price: 0,
                            description: "",
                            category: "Kopi",
                            availability: "available",
                          });
                        }}
                        variant="outline"
                        size="sm"
                      >
                        Batal
                      </Button>
                    </div>
                  </div>
                )}

                {/* Menu List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {menuItems.map((menuItem) => (
                    <div
                      key={menuItem.id}
                      className="border border-gray-200 rounded-xl p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{menuItem.name}</h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            menuItem.availability === "available"
                              ? "bg-green-100 text-green-800"
                              : menuItem.availability === "limited"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {menuItem.availability === "available"
                            ? "Tersedia"
                            : menuItem.availability === "limited"
                            ? "Terbatas"
                            : "Habis"}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">
                        {menuItem.description}
                      </p>
                      <p className="font-bold text-amber-600 mb-3">
                        Rp {menuItem.price.toLocaleString("id-ID")}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEditMenuItem(menuItem)}
                          variant="outline"
                          size="sm"
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDeleteMenuItem(menuItem.id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          Hapus
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === "reports" && (
              <div>
                <h2 className="text-xl font-semibold mb-6">
                  Laporan Penjualan
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="font-semibold mb-4">Ringkasan Hari Ini</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Pesanan:</span>
                        <span className="font-medium">
                          {salesReport.totalOrders}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Pendapatan:</span>
                        <span className="font-medium">
                          Rp {salesReport.totalRevenue.toLocaleString("id-ID")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rata-rata per Pesanan:</span>
                        <span className="font-medium">
                          Rp{" "}
                          {Math.round(
                            salesReport.totalRevenue / salesReport.totalOrders
                          ).toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="font-semibold mb-4">Menu Terlaris</h3>
                    <div className="space-y-3">
                      {salesReport.topSellingItems.map((item, index) => (
                        <div
                          key={item.menuItem.id}
                          className="flex justify-between items-center"
                        >
                          <div>
                            <span className="font-medium">
                              {index + 1}. {item.menuItem.name}
                            </span>
                            <p className="text-sm text-gray-600">
                              {item.quantity} terjual
                            </p>
                          </div>
                          <span className="font-medium">
                            Rp {item.revenue.toLocaleString("id-ID")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
