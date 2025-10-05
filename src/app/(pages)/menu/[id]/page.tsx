"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MenuItem, Warkop } from "@/types";
import { useCart } from "@/hooks/useCart";
import { useFavorites } from "@/hooks/useFavorites";
import { useNotification } from "@/hooks/useNotification";
import { useAuth } from "@/hooks/useAuth";
import Button from "@/components/ui/Button";

// Enhanced Mock data untuk menu item detail
const mockMenuItem: MenuItem = {
  id: "menu-1",
  name: "Kopi Hitam Special",
  price: 12000,
  description:
    "Kopi hitam robusta pilihan dari Lampung dengan rasa yang kuat dan aroma yang harum. Diseduh dengan teknik pour over untuk cita rasa terbaik yang memanjakan lidah para pecinta kopi sejati.",
  category: "Kopi",
  image: "/images/kopi-hitam.jpg",
  availability: "available",
  isRecommended: true,
  ingredients: [
    "Biji Kopi Robusta Lampung Premium",
    "Air Mineral Berkualitas Tinggi",
  ],
  nutrition: {
    calories: 5,
    caffeine: "95mg",
    fat: "0g",
    carbs: "1g",
  },
  spicyLevel: 0,
  preparationTime: "3-5 menit",
  allergens: [],
  tags: ["Halal", "Vegan", "Organik", "Fair Trade"],
};

const mockWarkop: Warkop = {
  id: "warkop-1",
  name: "Kopi Kita",
  description:
    "Warkop legendaris dengan cita rasa kopi tradisional yang autentik",
  location: "Jl. Sudirman No. 123, Jakarta Pusat",
  coordinates: { lat: -6.2088, lng: 106.8456 },
  rating: 4.5,
  totalReviews: 150,
  categories: ["Kopi", "Snack", "Makanan Berat"],
  distance: "1.2 km",
  badges: ["Populer", "Buka 24 Jam"],
  busyLevel: "Ramai",
  promo: "Diskon 20% untuk pembelian di atas 50rb",
  images: ["/images/warkop-1.jpg"],
  openingHours: { open: "06:00", close: "23:00", is24Hours: false },
  contactInfo: { phone: "021-12345678", whatsapp: "08123456789" },
  facilities: ["WiFi", "Parkir", "AC", "Musholla"],
  menu: [],
};

// Mock reviews untuk menu item
const mockMenuReviews = [
  {
    id: "review-1",
    userName: "Ahmad Rizky",
    userAvatar: "/images/avatar-1.jpg",
    rating: 5,
    comment:
      "Kopi hitamnya mantap banget! Rasa pahit yang pas, aromanya wangi. Recommended untuk yang suka kopi strong.",
    date: "2024-12-20",
    helpful: 8,
    images: ["/images/review-kopi-1.jpg"],
  },
  {
    id: "review-2",
    userName: "Siti Nurhaliza",
    userAvatar: "/images/avatar-2.jpg",
    rating: 4,
    comment:
      "Enak tapi agak terlalu strong buat saya. Mungkin next time minta yang lebih light.",
    date: "2024-12-18",
    helpful: 5,
    images: [],
  },
  {
    id: "review-3",
    userName: "Budi Santoso",
    userAvatar: "/images/avatar-3.jpg",
    rating: 5,
    comment:
      "Sudah langganan dari dulu. Konsisten rasanya, barista juga ramah. Tempatnya cozy buat kerja.",
    date: "2024-12-15",
    helpful: 12,
    images: [],
  },
];

export default function MenuDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { showSuccess, showError } = useNotification();

  const [menuItem, setMenuItem] = useState<MenuItem | null>(null);
  const [warkop, setWarkop] = useState<Warkop | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [activeTab, setActiveTab] = useState("details");
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });

  useEffect(() => {
    // Simulasi loading data menu item
    setLoading(true);
    setTimeout(() => {
      setMenuItem(mockMenuItem);
      setWarkop(mockWarkop);
      setLoading(false);
    }, 1000);
  }, [params.id]);

  const handleAddToCart = () => {
    if (!user) {
      showError(
        "Login Required",
        "Silakan login terlebih dahulu untuk menambah item ke keranjang"
      );
      router.push("/auth/login");
      return;
    }

    if (!menuItem || !warkop) return;

    if (menuItem.availability === "unavailable") {
      showError("Tidak Tersedia", "Maaf, item ini sedang tidak tersedia");
      return;
    }

    addToCart(menuItem, warkop.id, warkop.name, quantity, notes);
    showSuccess(
      "Berhasil",
      `${menuItem.name} (${quantity}x) ditambahkan ke keranjang`
    );

    // Reset form
    setQuantity(1);
    setNotes("");
  };

  const handleToggleFavorite = () => {
    if (!user) {
      showError(
        "Login Required",
        "Silakan login terlebih dahulu untuk menambah favorit"
      );
      router.push("/auth/login");
      return;
    }

    if (warkop) {
      toggleFavorite(warkop.id);
      showSuccess(
        isFavorite(warkop.id) ? "Dihapus dari Favorit" : "Ditambah ke Favorit",
        `${warkop.name} ${
          isFavorite(warkop.id) ? "dihapus dari" : "ditambahkan ke"
        } daftar favorit`
      );
    }
  };

  const handleSubmitReview = () => {
    if (!user) {
      showError(
        "Login Required",
        "Silakan login terlebih dahulu untuk memberikan review"
      );
      return;
    }
    if (newReview.comment.trim()) {
      showSuccess("Review Berhasil", "Terima kasih atas review Anda!");
      setNewReview({ rating: 5, comment: "" });
    }
  };

  const getSpicyLevelText = (level: number) => {
    switch (level) {
      case 0:
        return "Tidak Pedas";
      case 1:
        return "Sedikit Pedas";
      case 2:
        return "Pedas";
      case 3:
        return "Sangat Pedas";
      default:
        return "Tidak Pedas";
    }
  };

  const formatPrice = (price: number) => {
    return `Rp ${price.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Memuat detail menu...</p>
        </div>
      </div>
    );
  }

  if (!menuItem || !warkop) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-6">🍽️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Menu Tidak Ditemukan
          </h1>
          <p className="text-gray-600 mb-6">
            Menu item yang Anda cari tidak ditemukan atau tidak tersedia.
          </p>
          <Link href="/">
            <Button className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3">
              Kembali ke Beranda
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalPrice = quantity * menuItem.price;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-amber-600 hover:text-amber-700">
              Beranda
            </Link>
            <span className="text-gray-500">→</span>
            <Link
              href={`/warkop/${warkop.id}`}
              className="text-amber-600 hover:text-amber-700"
            >
              {warkop.name}
            </Link>
            <span className="text-gray-500">→</span>
            <span className="text-gray-700">{menuItem.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Section */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative h-96 bg-gray-200 rounded-xl overflow-hidden">
              <Image
                src={menuItem.image || "/images/placeholder-food.jpg"}
                alt={menuItem.name}
                fill
                className="object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "/images/placeholder-food.jpg";
                }}
              />

              {/* Availability Status */}
              {menuItem.availability === "unavailable" && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold text-lg">
                    Tidak Tersedia
                  </div>
                </div>
              )}

              {/* Recommended Badge */}
              {menuItem.isRecommended && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold flex items-center gap-2">
                  ⭐ Rekomendasi
                </div>
              )}
            </div>

            {/* Warkop Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                🏪 Dari {warkop.name}
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <span className="flex items-center gap-1">
                      <span className="text-yellow-500">⭐</span>
                      <span className="font-medium">{warkop.rating}</span>
                      <span>({warkop.totalReviews} ulasan)</span>
                    </span>
                    <span>📏 {warkop.distance}</span>
                  </div>
                  <p className="text-gray-600 text-sm">📍 {warkop.location}</p>
                </div>
                <Link href={`/warkop/${warkop.id}`}>
                  <Button
                    variant="outline"
                    className="text-amber-600 border-amber-600"
                  >
                    Lihat Warkop
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    {menuItem.name}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-medium">
                      {menuItem.category}
                    </span>
                    {menuItem.preparationTime && (
                      <span className="flex items-center gap-1">
                        ⏱️ {menuItem.preparationTime}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleToggleFavorite}
                  className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                  title={
                    isFavorite(warkop.id)
                      ? "Hapus dari favorit"
                      : "Tambah ke favorit"
                  }
                >
                  {isFavorite(warkop.id) ? "💖" : "🤍"}
                </button>
              </div>

              <div className="text-3xl font-bold text-amber-600 mb-4">
                {formatPrice(menuItem.price)}
              </div>

              <p className="text-gray-700 leading-relaxed mb-6">
                {menuItem.description}
              </p>

              {/* Tags */}
              {menuItem.tags && menuItem.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap mb-6">
                  {menuItem.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      ✓ {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="border-b">
              <div className="flex space-x-8">
                {[
                  { id: "details", label: "📋 Detail", icon: "📋" },
                  { id: "nutrition", label: "📊 Nutrisi", icon: "📊" },
                  { id: "reviews", label: "⭐ Ulasan", icon: "⭐" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? "border-amber-500 text-amber-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="min-h-[200px]">
              {activeTab === "details" && (
                <div className="space-y-6">
                  {/* Ingredients */}
                  {menuItem.ingredients && menuItem.ingredients.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        🥘 Bahan-bahan
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {menuItem.ingredients.map((ingredient, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                          >
                            <span className="text-green-500">•</span>
                            <span className="text-gray-700 text-sm">
                              {ingredient}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Additional Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {menuItem.spicyLevel !== undefined &&
                      menuItem.spicyLevel > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                            🌶️ Level Pedas
                          </h4>
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[1, 2, 3].map((level) => (
                                <span
                                  key={level}
                                  className={`text-lg ${
                                    level <= menuItem.spicyLevel!
                                      ? "text-red-500"
                                      : "text-gray-300"
                                  }`}
                                >
                                  🌶️
                                </span>
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">
                              {getSpicyLevelText(menuItem.spicyLevel)}
                            </span>
                          </div>
                        </div>
                      )}

                    {menuItem.allergens && menuItem.allergens.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                          ⚠️ Alergen
                        </h4>
                        <div className="flex gap-2 flex-wrap">
                          {menuItem.allergens.map((allergen, index) => (
                            <span
                              key={index}
                              className="bg-red-100 text-red-800 px-2 py-1 rounded-lg text-sm"
                            >
                              {allergen}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "nutrition" && menuItem.nutrition && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    📊 Informasi Nutrisi
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {menuItem.nutrition.calories && (
                      <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {menuItem.nutrition.calories}
                        </div>
                        <div className="text-sm text-gray-600">Kalori</div>
                      </div>
                    )}
                    {menuItem.nutrition.protein && (
                      <div className="bg-green-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {menuItem.nutrition.protein}
                        </div>
                        <div className="text-sm text-gray-600">Protein</div>
                      </div>
                    )}
                    {menuItem.nutrition.caffeine && (
                      <div className="bg-amber-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-amber-600">
                          {menuItem.nutrition.caffeine}
                        </div>
                        <div className="text-sm text-gray-600">Kafein</div>
                      </div>
                    )}
                    {menuItem.nutrition.fat && (
                      <div className="bg-red-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {menuItem.nutrition.fat}
                        </div>
                        <div className="text-sm text-gray-600">Lemak</div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <strong>Catatan:</strong> Nilai nutrisi dapat bervariasi
                      tergantung metode penyajian dan porsi. Konsultasikan
                      dengan ahli gizi untuk kebutuhan diet khusus.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="space-y-6">
                  {/* Review Summary */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-800">
                        ⭐ Ulasan untuk {menuItem.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-amber-600">
                          4.7
                        </span>
                        <div className="text-yellow-400">⭐⭐⭐⭐⭐</div>
                        <span className="text-gray-600 text-sm">
                          (25 ulasan)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Write Review */}
                  {user && (
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-3">Tulis Ulasan</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Rating
                          </label>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() =>
                                  setNewReview((prev) => ({
                                    ...prev,
                                    rating: star,
                                  }))
                                }
                                className={`text-2xl ${
                                  star <= newReview.rating
                                    ? "text-yellow-400"
                                    : "text-gray-300"
                                } hover:text-yellow-400`}
                              >
                                ⭐
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Komentar
                          </label>
                          <textarea
                            value={newReview.comment}
                            onChange={(e) =>
                              setNewReview((prev) => ({
                                ...prev,
                                comment: e.target.value,
                              }))
                            }
                            placeholder="Bagikan pengalaman Anda dengan menu ini..."
                            className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                            rows={3}
                          />
                        </div>
                        <Button
                          onClick={handleSubmitReview}
                          className="bg-amber-600 hover:bg-amber-700"
                        >
                          Kirim Ulasan
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Reviews List */}
                  <div className="space-y-4">
                    {mockMenuReviews.map((review) => (
                      <div key={review.id} className="border rounded-lg p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-lg">👤</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h4 className="font-semibold">
                                  {review.userName}
                                </h4>
                                <div className="flex items-center gap-2">
                                  <div className="text-yellow-400">
                                    {"⭐".repeat(review.rating)}
                                  </div>
                                  <span className="text-gray-500 text-sm">
                                    {review.date}
                                  </span>
                                </div>
                              </div>
                              <button className="text-gray-400 hover:text-gray-600">
                                👍 {review.helpful}
                              </button>
                            </div>
                            <p className="text-gray-700">{review.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Add to Cart Section */}
            <div className="bg-white border rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                🛒 Tambah ke Keranjang
              </h3>

              <div className="space-y-4">
                {/* Quantity Selector */}
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Jumlah:</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-lg font-bold transition-colors"
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-bold text-lg">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-lg font-bold transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block font-medium text-gray-700 mb-2">
                    Catatan (opsional):
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Contoh: Gula sedikit, es banyak, pedas sedang..."
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    rows={2}
                  />
                </div>

                {/* Total Price */}
                <div className="flex items-center justify-between py-3 border-t">
                  <span className="text-lg font-medium text-gray-700">
                    Total:
                  </span>
                  <span className="text-2xl font-bold text-amber-600">
                    {formatPrice(totalPrice)}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={handleAddToCart}
                    disabled={menuItem.availability === "unavailable"}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 text-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {menuItem.availability === "unavailable"
                      ? "Tidak Tersedia"
                      : `🛒 Tambah ke Keranjang - ${formatPrice(totalPrice)}`}
                  </Button>

                  <div className="flex gap-3">
                    <Link href={`/warkop/${warkop.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        Lihat Menu Lain
                      </Button>
                    </Link>
                    <Link href="/cart" className="flex-1">
                      <Button variant="outline" className="w-full">
                        Lihat Keranjang
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
