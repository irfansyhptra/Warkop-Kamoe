"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Warkop, MenuItem } from "@/types";
import { warkopList } from "@/data";
import { useCart } from "@/hooks/useCart";
import { useFavorites } from "@/hooks/useFavorites";
import { useNotification } from "@/hooks/useNotification";
import Button from "@/components/ui/Button";
import OptimizedImage from "@/components/ui/OptimizedImage";
import MenuCard from "@/components/ui/MenuCard";
import CheckoutModal from "@/components/ui/CheckoutModal";

export default function WarkopDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [warkop, setWarkop] = useState<Warkop | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [selectedImage, setSelectedImage] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [activeTab, setActiveTab] = useState<"menu" | "info" | "reviews">(
    "menu"
  );
  const [loading, setLoading] = useState(true);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  const { addToCart, cartItems, getTotalItems, getTotalPrice } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { showSuccess } = useNotification();

  useEffect(() => {
    setLoading(true);
    const warkopId = params.id as string;
    const foundWarkop = warkopList.find((w) => w.id === warkopId);

    setTimeout(() => {
      setWarkop(foundWarkop || null);
      setLoading(false);
    }, 500);
  }, [params.id]);

  const handleAddToCart = (menuItem: MenuItem) => {
    if (warkop) {
      addToCart(menuItem, warkop.id, warkop.name, 1);
      showSuccess("Berhasil", "Menu ditambahkan ke keranjang!");
    }
  };

  const getUniqueCategories = () => {
    if (!warkop?.menu) return ["Semua"];
    const categories = warkop.menu.map((item) => item.category);
    return ["Semua", ...Array.from(new Set(categories))];
  };

  const getFilteredMenu = () => {
    if (!warkop?.menu) return [];
    if (selectedCategory === "Semua") return warkop.menu;
    return warkop.menu.filter((item) => item.category === selectedCategory);
  };

  const formatTime = (time: string) => {
    return time.length === 4 ? `${time.slice(0, 2)}:${time.slice(2)}` : time;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-amber-200">Memuat detail warkop...</p>
        </div>
      </div>
    );
  }

  if (!warkop) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="text-6xl mb-6">☕</div>
          <h1 className="text-2xl font-bold text-white mb-4">
            Warkop Tidak Ditemukan
          </h1>
          <p className="text-gray-400 mb-8">
            Maaf, warkop yang Anda cari tidak tersedia atau telah dipindahkan.
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => router.back()}
              variant="primary"
              className="w-full"
            >
              ← Kembali
            </Button>
            <Button
              onClick={() => router.push("/")}
              variant="secondary"
              className="w-full"
            >
              🏠 Ke Beranda
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20">
      <div className="container mx-auto px-6 py-8">
        {/* Header Navigation */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-amber-200 hover:text-amber-100 transition-colors"
          >
            <span className="text-xl">←</span>
            <span>Kembali</span>
          </button>
          <button
            onClick={() => toggleFavorite(warkop.id)}
            className={`p-3 rounded-full transition-all ${
              isFavorite(warkop.id)
                ? "bg-red-500 text-white shadow-lg"
                : "bg-white/10 text-amber-200 hover:bg-white/20"
            }`}
          >
            <span className="text-xl">
              {isFavorite(warkop.id) ? "❤️" : "🤍"}
            </span>
          </button>
        </div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-[4/3] relative rounded-3xl overflow-hidden">
              <OptimizedImage
                src={
                  warkop.images?.[selectedImage] ||
                  "/images/placeholder-food.jpg"
                }
                alt={warkop.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            {warkop.images && warkop.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {warkop.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 aspect-square w-20 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? "border-amber-500"
                        : "border-transparent hover:border-amber-300"
                    }`}
                  >
                    <OptimizedImage
                      src={image}
                      alt={`${warkop.name} ${index + 1}`}
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Warkop Info */}
          <div className="space-y-6">
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                {warkop.badges?.map((badge, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-200 text-sm font-medium"
                  >
                    {badge}
                  </span>
                ))}
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">
                {warkop.name}
              </h1>
              <div className="flex items-center gap-4 text-gray-300 mb-4">
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400">⭐</span>
                  <span className="font-semibold">{warkop.rating}</span>
                  <span>({warkop.totalReviews} ulasan)</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>📍</span>
                  <span>{warkop.distance}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Deskripsi
                </h3>
                <p
                  className={`text-gray-300 leading-relaxed ${
                    showFullDescription ? "" : "line-clamp-3"
                  }`}
                >
                  {warkop.description}
                </p>
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="text-amber-400 hover:text-amber-300 text-sm mt-2"
                >
                  {showFullDescription ? "Sembunyikan" : "Selengkapnya"}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-2xl p-4">
                  <h4 className="text-white font-medium mb-2">Status</h4>
                  <p className="text-gray-300 text-sm">{warkop.busyLevel}</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-4">
                  <h4 className="text-white font-medium mb-2">Jam Buka</h4>
                  <p className="text-gray-300 text-sm">
                    {warkop.openingHours?.is24Hours
                      ? "24 Jam"
                      : `${formatTime(
                          warkop.openingHours?.open || ""
                        )} - ${formatTime(warkop.openingHours?.close || "")}`}
                  </p>
                </div>
              </div>

              {warkop.promo && (
                <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-2xl p-4 border border-amber-500/20">
                  <h4 className="text-amber-300 font-medium mb-1">
                    🎉 Promo Aktif
                  </h4>
                  <p className="text-white text-sm">{warkop.promo}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex gap-1 bg-white/5 rounded-2xl p-2 mb-8">
          {[
            { key: "menu", label: "Menu", icon: "🍽️" },
            { key: "info", label: "Info", icon: "ℹ️" },
            { key: "reviews", label: "Ulasan", icon: "⭐" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() =>
                setActiveTab(tab.key as "menu" | "info" | "reviews")
              }
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${
                activeTab === tab.key
                  ? "bg-amber-500 text-white"
                  : "text-gray-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <span>{tab.icon}</span>
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "menu" && (
          <div className="space-y-8">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {getUniqueCategories().map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full transition-all ${
                    selectedCategory === category
                      ? "bg-amber-500 text-white"
                      : "bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredMenu().map((menuItem) => (
                <MenuCard
                  key={menuItem.id}
                  menuItem={menuItem}
                  onAddToCart={handleAddToCart}
                  showAddButton={true}
                />
              ))}
            </div>

            {getFilteredMenu().length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🍽️</div>
                <p className="text-gray-400">Tidak ada menu di kategori ini</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "info" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-white/5 rounded-3xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">
                  📍 Lokasi
                </h3>
                <p className="text-gray-300 mb-4">{warkop.location}</p>
                <Button variant="secondary" className="w-full">
                  Buka di Maps
                </Button>
              </div>

              <div className="bg-white/5 rounded-3xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">
                  📞 Kontak
                </h3>
                <div className="space-y-3">
                  {warkop.contactInfo?.phone && (
                    <div className="flex items-center gap-3">
                      <span className="text-amber-400">📞</span>
                      <span className="text-gray-300">
                        {warkop.contactInfo.phone}
                      </span>
                    </div>
                  )}
                  {warkop.contactInfo?.whatsapp && (
                    <div className="flex items-center gap-3">
                      <span className="text-green-400">💬</span>
                      <span className="text-gray-300">
                        {warkop.contactInfo.whatsapp}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white/5 rounded-3xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">
                  🏷️ Kategori
                </h3>
                <div className="flex flex-wrap gap-2">
                  {warkop.categories?.map((category, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-200 text-sm"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>

              {warkop.facilities && warkop.facilities.length > 0 && (
                <div className="bg-white/5 rounded-3xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">
                    🏢 Fasilitas
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {warkop.facilities.map((facility, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-amber-400">✓</span>
                        <span className="text-gray-300 text-sm">
                          {facility}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="bg-white/5 rounded-3xl p-8 text-center">
            <div className="text-6xl mb-4">⭐</div>
            <h3 className="text-2xl font-semibold text-white mb-2">
              Rating {warkop.rating}/5.0
            </h3>
            <p className="text-gray-400 mb-6">
              Berdasarkan {warkop.totalReviews} ulasan pelanggan
            </p>
            <Button variant="primary">Tulis Ulasan</Button>
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      {getTotalItems() > 0 && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setIsCheckoutModalOpen(true)}
            className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-6 py-4 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center gap-3 group"
          >
            <div className="relative">
              <span className="text-2xl">🛒</span>
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {getTotalItems()}
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-medium">{getTotalItems()} Item</div>
              <div className="text-xs opacity-90">
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  minimumFractionDigits: 0,
                }).format(getTotalPrice())}
              </div>
            </div>
            <span className="text-sm group-hover:translate-x-1 transition-transform">
              →
            </span>
          </button>
        </div>
      )}

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        cartItems={cartItems}
        totalAmount={getTotalPrice()}
        onCheckout={() => {
          showSuccess("Berhasil", "Pesanan berhasil dibuat!");
          setIsCheckoutModalOpen(false);
          router.push("/checkout");
        }}
      />
    </div>
  );
}
