"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { useNotification } from "@/hooks/useNotification";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface WarkopData {
  _id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  phone: string;
  images: string[];
  facilities: string[];
  openingHours: Array<{
    day: string;
    open: string;
    close: string;
    isOpen: boolean;
  }>;
  isActive: boolean;
  isVerified: boolean;
}

export default function WarkopSettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, authLoading } = useAuth();
  const { showSuccess, showError } = useNotification();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [warkop, setWarkop] = useState<WarkopData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    phone: "",
  });

  const facilities = [
    "WiFi",
    "Parkir",
    "AC",
    "Musholla",
    "Toilet",
    "Live Music",
    "Outdoor Seating",
    "Non-Smoking Area",
    "Playground",
    "Meeting Room",
  ];

  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);

  // Check authentication
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || user?.role !== "warkop_owner") {
        router.push("/mywarkop");
        return;
      }

      if (user?.warkopId) {
        fetchWarkopData();
      } else {
        setLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authLoading, user, router]);

  const fetchWarkopData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("warkop-kamoe-token");

      const response = await fetch(`/api/warkops/${user?.warkopId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.warkop) {
          const w = data.data.warkop;
          setWarkop(w);
          setFormData({
            name: w.name || "",
            description: w.description || "",
            address: w.address || "",
            city: w.city || "",
            phone: w.phone || "",
          });
          setSelectedFacilities(w.facilities || []);
        }
      }
    } catch (error) {
      console.error("Error fetching warkop:", error);
      showError("Error", "Gagal memuat data warkop");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFacilityToggle = (facility: string) => {
    setSelectedFacilities((prev) =>
      prev.includes(facility)
        ? prev.filter((f) => f !== facility)
        : [...prev, facility]
    );
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      showError("Error", "Mohon pilih file gambar yang valid");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError("Error", "Ukuran file maksimal 5MB");
      return;
    }

    try {
      setUploadingImage(true);
      const token = localStorage.getItem("warkop-kamoe-token");

      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            image: base64,
            folder: "warkops",
          }),
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          if (uploadData.success && uploadData.data?.url) {
            // Add image to warkop
            const newImages = [...(warkop?.images || []), uploadData.data.url];

            // Update warkop with new image
            const updateResponse = await fetch(`/api/warkops/${warkop?._id}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ images: newImages }),
            });

            if (updateResponse.ok) {
              setWarkop((prev) =>
                prev ? { ...prev, images: newImages } : null
              );
              showSuccess("Berhasil", "Gambar berhasil diupload");
            } else {
              showError("Error", "Gagal menyimpan gambar");
            }
          }
        } else {
          showError("Error", "Gagal upload gambar");
        }
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading image:", error);
      showError("Error", "Terjadi kesalahan saat upload gambar");
      setUploadingImage(false);
    }
  };

  const handleDeleteImage = async (imageUrl: string) => {
    if (!confirm("Hapus gambar ini?")) return;

    try {
      const token = localStorage.getItem("warkop-kamoe-token");
      const newImages = (warkop?.images || []).filter(
        (img) => img !== imageUrl
      );

      const response = await fetch(`/api/warkops/${warkop?._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ images: newImages }),
      });

      if (response.ok) {
        setWarkop((prev) => (prev ? { ...prev, images: newImages } : null));
        showSuccess("Berhasil", "Gambar berhasil dihapus");
      } else {
        showError("Error", "Gagal menghapus gambar");
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      showError("Error", "Terjadi kesalahan");
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("warkop-kamoe-token");

      const response = await fetch(`/api/warkops/${warkop?._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          facilities: selectedFacilities,
        }),
      });

      if (response.ok) {
        showSuccess("Berhasil", "Pengaturan warkop berhasil disimpan");
        fetchWarkopData();
      } else {
        const errorData = await response.json();
        showError("Error", errorData.error || "Gagal menyimpan pengaturan");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      showError("Error", "Terjadi kesalahan saat menyimpan");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-amber-800">Memuat pengaturan...</p>
        </div>
      </div>
    );
  }

  if (!warkop) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="text-6xl mb-6">☕</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Warkop Belum Terdaftar
          </h1>
          <p className="text-gray-600 mb-6">
            Silakan daftarkan warkop Anda terlebih dahulu
          </p>
          <Button onClick={() => router.push("/warkop-owner/setup")}>
            Daftar Warkop
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Pengaturan Warkop
            </h1>
            <p className="text-gray-600 mt-1">
              Kelola informasi dan gambar warkop Anda
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push("/warkop-owner/dashboard")}
          >
            ← Kembali
          </Button>
        </div>

        {/* Images Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">📷 Foto Warkop</h2>
          <p className="text-gray-600 text-sm mb-4">
            Upload foto warkop Anda untuk menarik lebih banyak pelanggan
          </p>

          {/* Image Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {(warkop.images || []).map((image, index) => (
              <div key={index} className="relative group aspect-square">
                <Image
                  src={image}
                  alt={`Warkop ${index + 1}`}
                  fill
                  className="object-cover rounded-xl"
                />
                <button
                  onClick={() => handleDeleteImage(image)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Hapus gambar"
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
            ))}

            {/* Upload Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
              className="aspect-square border-2 border-dashed border-amber-300 rounded-xl flex flex-col items-center justify-center hover:border-amber-500 hover:bg-amber-50 transition-colors disabled:opacity-50"
            >
              {uploadingImage ? (
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-600"></div>
              ) : (
                <>
                  <svg
                    className="w-8 h-8 text-amber-500 mb-2"
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
                  <span className="text-sm text-amber-600">Tambah Foto</span>
                </>
              )}
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          <p className="text-xs text-gray-500">
            Format: JPG, PNG, WebP. Maksimal 5MB per file.
          </p>
        </div>

        {/* Basic Info Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">📋 Informasi Dasar</h2>

          <div className="space-y-4">
            <Input
              label="Nama Warkop"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Nama warkop Anda"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Ceritakan tentang warkop Anda..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
              />
            </div>

            <Input
              label="Alamat"
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Alamat lengkap"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Kota"
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="Nama kota"
              />
              <Input
                label="Nomor Telepon"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="021-12345678"
              />
            </div>
          </div>
        </div>

        {/* Facilities Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🏪 Fasilitas</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {facilities.map((facility) => (
              <label
                key={facility}
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedFacilities.includes(facility)
                    ? "border-amber-500 bg-amber-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedFacilities.includes(facility)}
                  onChange={() => handleFacilityToggle(facility)}
                  className="mr-2 accent-amber-600"
                />
                <span className="text-sm">{facility}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Status Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">📊 Status</h2>

          <div className="flex gap-4">
            <div
              className={`flex items-center px-4 py-2 rounded-full ${
                warkop.isVerified
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {warkop.isVerified ? "✓ Terverifikasi" : "⏳ Menunggu Verifikasi"}
            </div>
            <div
              className={`flex items-center px-4 py-2 rounded-full ${
                warkop.isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {warkop.isActive ? "✓ Aktif" : "✗ Nonaktif"}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSaveSettings} disabled={saving}>
            {saving ? "Menyimpan..." : "💾 Simpan Perubahan"}
          </Button>
        </div>
      </div>
    </div>
  );
}
