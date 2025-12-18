"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { MenuItem } from "@/types";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";

interface MenuItemForm {
  name: string;
  description: string;
  price: number;
  category: string;
  availability: "available" | "unavailable" | "limited";
  image?: string;
  preparationTime?: string;
  spicyLevel?: number;
  isRecommended?: boolean;
}

const WarkopOwnerMenuManagement: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated, authLoading } = useAuth();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // Image upload states
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [formData, setFormData] = useState<MenuItemForm>({
    name: "",
    description: "",
    price: 0,
    category: "Kopi",
    availability: "available",
    preparationTime: "10-15 menit",
    spicyLevel: 0,
    isRecommended: false,
  });

  // Check authentication and role
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || user?.role !== "warkop_owner") {
        router.push("/mywarkop");
        return;
      }
      
      // If authenticated as warkop owner but no warkopId, redirect to setup
      if (user && user.role === "warkop_owner" && !user.warkopId) {
        router.push("/warkop-owner/setup");
        return;
      }
      
      // If everything is ok, fetch menu items
      if (user && user.warkopId) {
        fetchMenuItems();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authLoading, user, router]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("warkop-kamoe-token");

      if (!user?.warkopId) {
        console.warn("No warkopId found");
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/menu?warkopId=${user.warkopId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // API returns { success: true, data: { menuItems: [...] } }
        const menuData = Array.isArray(data.data?.menuItems) ? data.data.menuItems : [];
        // Map _id to id for consistency
        const mappedMenu = menuData.map((item: MenuItem & { _id?: string }) => ({
          ...item,
          id: item._id || item.id,
        }));
        setMenuItems(mappedMenu);
      } else {
        // If response not ok, set empty array
        console.warn("Failed to fetch menu items:", response.status);
        setMenuItems([]);
      }
    } catch (error) {
      console.error("Error fetching menu items:", error);
      // On error, set empty array to prevent crashes
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    setFormData({
      ...formData,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.checked,
    });
  };

  // Handle image file selection with compression
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Mohon pilih file gambar yang valid");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran file maksimal 5MB");
      return;
    }

    try {
      // Compress image if it's too large
      let processedFile = file;
      if (file.size > 1 * 1024 * 1024) {
        // Compress if larger than 1MB
        processedFile = await compressImage(file);
      }

      // Set selected file and create preview
      setSelectedImageFile(processedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(processedFile);
    } catch (error) {
      console.error("Error processing image:", error);
      alert("Gagal memproses gambar. Silakan coba lagi.");
    }
  };

  // Compress image client-side
  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = document.createElement("img");
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Resize if too large (max 1200px)
          const maxSize = 1200;
          if (width > height && width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                reject(new Error("Failed to compress image"));
              }
            },
            "image/jpeg",
            0.8 // Quality 80%
          );
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  // Clear selected image
  const handleClearImage = () => {
    setSelectedImageFile(null);
    setImagePreview(null);
    setFormData({ ...formData, image: undefined });
  };

  // Upload image to Cloudinary
  const uploadImageToCloudinary = async (): Promise<string | null> => {
    if (!selectedImageFile) return null;

    try {
      setIsUploadingImage(true);
      const token = localStorage.getItem("warkop-kamoe-token");

      const formDataUpload = new FormData();
      formDataUpload.append("file", selectedImageFile);
      formDataUpload.append("folder", "menu-items");

      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataUpload,
      });

      if (!response.ok) {
        throw new Error("Gagal upload gambar");
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error("Upload image error:", error);
      throw error;
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const token = localStorage.getItem("warkop-kamoe-token");
      
      // Upload image first if there's a new image selected
      let imageUrl = formData.image;
      if (selectedImageFile) {
        const uploadedUrl = await uploadImageToCloudinary();
        if (!uploadedUrl) {
          alert("Gagal upload gambar. Silakan coba lagi.");
          setIsSaving(false);
          return;
        }
        imageUrl = uploadedUrl;
      }

      const url = editingItem ? `/api/menu/${editingItem.id}` : "/api/menu";
      const method = editingItem ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          image: imageUrl,
          warkopId: user?.warkopId,
        }),
      });

      if (response.ok) {
        alert(
          editingItem
            ? "Menu berhasil diperbarui!"
            : "Menu berhasil ditambahkan!"
        );
        resetForm();
        fetchMenuItems();
      } else {
        const data = await response.json();
        alert(data.error || "Gagal menyimpan menu");
      }
    } catch (error) {
      console.error("Error saving menu:", error);
      alert("Terjadi kesalahan saat menyimpan menu");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      availability: item.availability,
      image: item.image,
      preparationTime: item.preparationTime || "10-15 menit",
      spicyLevel: item.spicyLevel || 0,
      isRecommended: item.isRecommended || false,
    });
    // Set existing image as preview
    if (item.image) {
      setImagePreview(item.image);
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus menu ini?")) {
      return;
    }

    try {
      const token = localStorage.getItem("warkop-kamoe-token");
      const response = await fetch(`/api/menu/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert("Menu berhasil dihapus!");
        fetchMenuItems();
      } else {
        alert("Gagal menghapus menu");
      }
    } catch (error) {
      console.error("Error deleting menu:", error);
      alert("Terjadi kesalahan saat menghapus menu");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      category: "Kopi",
      availability: "available",
      preparationTime: "10-15 menit",
      spicyLevel: 0,
      isRecommended: false,
    });
    setEditingItem(null);
    setIsModalOpen(false);
    // Clear image states
    setSelectedImageFile(null);
    setImagePreview(null);
  };

  const categories = [
    "Kopi",
    "Teh",
    "Makanan",
    "Snack",
    "Minuman Dingin",
    "Minuman Panas",
    "Dessert",
  ];

  // Ensure menuItems is always an array
  const menuItemsArray = Array.isArray(menuItems) ? menuItems : [];

  const filteredMenuItems = menuItemsArray.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const uniqueCategories = Array.from(
    new Set(menuItemsArray.map((item) => item.category))
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500 mx-auto mb-4"></div>
          <p className="text-zinc-400">Memuat data menu...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "warkop_owner") {
    return null;
  }

  // If user doesn't have warkopId, show setup message
  if (!user.warkopId) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
            <svg
              className="w-16 h-16 text-violet-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h2 className="text-2xl font-bold text-white mb-2">
              Setup Warkop Diperlukan
            </h2>
            <p className="text-zinc-400 mb-6">
              Anda perlu melengkapi setup warkop terlebih dahulu sebelum bisa
              mengelola menu.
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push("/warkop-owner/setup")}
            >
              Setup Warkop Sekarang
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Kelola Menu
              </h1>
              <p className="text-zinc-400">
                Tambah, edit, atau hapus menu item warkop Anda
              </p>
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Tambah Menu Baru
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-violet-500/20 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-violet-400"
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
              </div>
              <div>
                <p className="text-zinc-400 text-sm">Total Menu</p>
                <p className="text-2xl font-bold text-white">
                  {menuItemsArray.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-emerald-500/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-emerald-400"
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
              <div>
                <p className="text-zinc-400 text-sm">Tersedia</p>
                <p className="text-2xl font-bold text-white">
                  {
                    menuItemsArray.filter((m) => m.availability === "available")
                      .length
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-orange-500/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-orange-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-zinc-400 text-sm">Terbatas</p>
                <p className="text-2xl font-bold text-white">
                  {
                    menuItemsArray.filter((m) => m.availability === "limited")
                      .length
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-red-500/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <div>
                <p className="text-zinc-400 text-sm">Tidak Tersedia</p>
                <p className="text-2xl font-bold text-white">
                  {
                    menuItemsArray.filter(
                      (m) => m.availability === "unavailable"
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 mb-6 border border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Cari Menu
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari nama atau deskripsi menu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pr-10 bg-white/5 border border-white/10 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
                />
                <svg
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter Kategori
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
              >
                <option value="all">Semua Kategori</option>
                {uniqueCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMenuItems.length === 0 ? (
            <div className="col-span-full bg-white rounded-xl shadow-lg p-12 text-center">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
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
              <p className="text-gray-600 text-lg mb-2">Belum ada menu item</p>
              <p className="text-gray-500 mb-6">
                Mulai tambahkan menu untuk warkop Anda
              </p>
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsModalOpen(true)}
              >
                Tambah Menu Pertama
              </Button>
            </div>
          ) : (
            filteredMenuItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Image */}
                <div className="relative h-48 bg-gradient-to-br from-amber-200 to-amber-300">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg
                        className="w-16 h-16 text-amber-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-3 right-3 flex gap-2">
                    {item.isRecommended && (
                      <span className="px-3 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold rounded-full shadow-lg">
                        ⭐ Rekomendasi
                      </span>
                    )}
                    <span
                      className={`px-3 py-1 text-white text-xs font-bold rounded-full shadow-md ${
                        item.availability === "available"
                          ? "bg-green-600"
                          : item.availability === "limited"
                          ? "bg-orange-600"
                          : "bg-red-600"
                      }`}
                    >
                      {item.availability === "available"
                        ? "Tersedia"
                        : item.availability === "limited"
                        ? "Terbatas"
                        : "Habis"}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="mb-3">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Harga</p>
                      <p className="text-2xl font-bold text-amber-600">
                        Rp {item.price.toLocaleString("id-ID")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Kategori</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {item.category}
                      </p>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="flex items-center gap-3 mb-4 text-xs text-gray-600">
                    {item.preparationTime && (
                      <div className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
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
                        {item.preparationTime}
                      </div>
                    )}
                    {item.spicyLevel && item.spicyLevel > 0 && (
                      <div className="flex items-center gap-1">
                        <span>🌶️</span>
                        <span>Level {item.spicyLevel}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(item)}
                      className="flex-1"
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      className="flex-1 text-red-600 hover:bg-red-50"
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Hapus
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add/Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={resetForm}
          title={editingItem ? "Edit Menu Item" : "Tambah Menu Baru"}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Menu *
              </label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Contoh: Kopi Hitam Gayo"
                required
                variant="light"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                placeholder="Deskripsi singkat tentang menu..."
                required
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Harga (Rp) *
                </label>
                <Input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="15000"
                  required
                  min="0"
                  variant="light"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 text-gray-800 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ketersediaan *
                </label>
                <select
                  name="availability"
                  value={formData.availability}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 text-gray-800 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="available">Tersedia</option>
                  <option value="limited">Terbatas</option>
                  <option value="unavailable">Tidak Tersedia</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Waktu Persiapan
                </label>
                <Input
                  type="text"
                  name="preparationTime"
                  value={formData.preparationTime}
                  onChange={handleInputChange}
                  placeholder="10-15 menit"
                  variant="light"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Level Pedas (0-5)
                </label>
                <Input
                  type="number"
                  name="spicyLevel"
                  value={formData.spicyLevel}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  max="5"
                  variant="light"
                />
              </div>

              <div className="flex items-center pt-8">
                <input
                  type="checkbox"
                  id="isRecommended"
                  name="isRecommended"
                  checked={formData.isRecommended}
                  onChange={handleCheckboxChange}
                  className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                />
                <label
                  htmlFor="isRecommended"
                  className="ml-2 text-sm text-gray-700"
                >
                  Menu Rekomendasi
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gambar Menu
              </label>
              
              {/* Image Preview */}
              {imagePreview && (
                <div className="mb-4 relative">
                  <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleClearImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              )}

              {/* Upload Button */}
              <div className="flex gap-2">
                <label className="flex-1">
                  <div className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-amber-500 hover:bg-amber-50 transition-all">
                    <svg
                      className="w-5 h-5 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-sm text-gray-600">
                      {selectedImageFile ? selectedImageFile.name : "Pilih Gambar"}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Format: JPG, PNG, GIF (Max 5MB). Gambar akan otomatis di-upload saat menyimpan menu.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isSaving || isUploadingImage}
                className="flex-1"
              >
                {isUploadingImage
                  ? "Upload gambar..."
                  : isSaving
                  ? "Menyimpan..."
                  : editingItem
                  ? "Update Menu"
                  : "Tambah Menu"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={resetForm}
                disabled={isSaving}
                className="flex-1"
              >
                Batal
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default WarkopOwnerMenuManagement;
