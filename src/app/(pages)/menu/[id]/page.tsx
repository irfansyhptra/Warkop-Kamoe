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

// Mock reviews untuk menu item (will be replaced with real data later)
const mockMenuReviews = [
  {
    id: "review-1",
    userName: "Ahmad Rizky",
    userAvatar: "",
    rating: 5,
    comment:
      "Kopi hitamnya mantap banget! Rasa pahit yang pas, aromanya wangi. Recommended untuk yang suka kopi strong.",
    date: "2024-12-20",
    helpful: 8,
    images: [],
  },
  {
    id: "review-2",
    userName: "Siti Nurhaliza",
    userAvatar: "",
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
    userAvatar: "",
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
    const fetchMenuData = async () => {
      try {
        setLoading(true);
        const menuId = params.id as string;
        
        // Fetch menu item detail
        const menuRes = await fetch(`/api/menu/${menuId}`);
        if (menuRes.ok) {
          const menuJson = await menuRes.json();
          const menuData = menuJson.data?.menuItem || null;
          
          if (menuData) {
            setMenuItem({
              ...menuData,
              id: menuData._id || menuId,
            });
            
            // Fetch warkop data if warkopId exists
            if (menuData.warkopId) {
              const warkopRes = await fetch(`/api/warkops/${menuData.warkopId}`);
              if (warkopRes.ok) {
                const warkopJson = await warkopRes.json();
                const warkopData = warkopJson.data?.warkop;
                if (warkopData) {
                  setWarkop({
                    ...warkopData,
                    id: warkopData._id || menuData.warkopId,
                  });
                }
              }
            }
          } else {
            setMenuItem(null);
          }
        } else if (menuRes.status === 404) {
          setMenuItem(null);
        } else {
          console.error("Failed to fetch menu item");
          setMenuItem(null);
        }
      } catch (error) {
        console.error("Error fetching menu data:", error);
        setMenuItem(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuData();
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

    // Reset form and redirect to cart
    setQuantity(1);
    setNotes("");
    router.push("/cart");
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
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-violet-500 mx-auto"></div>
          <p className="mt-4 text-zinc-400 text-lg">Memuat detail menu...</p>
        </div>
      </div>
    );
  }

  if (!menuItem || !warkop) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10">
          <div className="text-6xl mb-6">🍽️</div>
          <h1 className="text-2xl font-bold text-white mb-4">
            Menu Tidak Ditemukan
          </h1>
          <p className="text-zinc-400 mb-6">
            Menu item yang Anda cari tidak ditemukan atau tidak tersedia.
          </p>
          <Link href="/">
            <Button variant="primary" className="px-8 py-3">
              Kembali ke Beranda
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalPrice = quantity * menuItem.price;

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      {/* Breadcrumb */}
      <div className="bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-violet-400 hover:text-violet-300">
              Beranda
            </Link>
            <span className="text-zinc-500">→</span>
            <Link
              href={`/warkop/${warkop.id}`}
              className="text-violet-400 hover:text-violet-300"
            >
              {warkop.name}
            </Link>
            <span className="text-zinc-500">→</span>
            <span className="text-white">{menuItem.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Section */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative h-96 bg-white/5 rounded-2xl overflow-hidden border border-white/10">
              <Image
                src={menuItem.image || "/images/cappuccino.jpg"}
                alt={menuItem.name}
                fill
                className="object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "/images/cappuccino.jpg";
                }}
              />

              {/* Availability Status */}
              {menuItem.availability === "unavailable" && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <div className="bg-red-500 text-white px-6 py-3 rounded-xl font-bold text-lg">
                    Tidak Tersedia
                  </div>
                </div>
              )}

              {/* Recommended Badge */}
              {menuItem.isRecommended && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white px-4 py-2 rounded-full font-bold flex items-center gap-2 shadow-lg shadow-violet-500/25">
                  ⭐ Rekomendasi
                </div>
              )}
            </div>

            {/* Warkop Info */}
            <div className="bg-[#121215] rounded-2xl border border-white/10 p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                🏪 Dari {warkop.name}
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-4 text-sm text-zinc-400 mb-2">
                    <span className="flex items-center gap-1">
                      <span className="text-yellow-500">⭐</span>
                      <span className="font-medium text-white">{warkop.rating}</span>
                      <span>({warkop.totalReviews} ulasan)</span>
                    </span>
                    <span>📏 {warkop.distance}</span>
                  </div>
                  <p className="text-zinc-400 text-sm">📍 {warkop.location}</p>
                </div>
                <Link href={`/warkop/${warkop.id}`}>
                  <Button variant="outline">
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
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {menuItem.name}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-zinc-400 mb-3">
                    <span className="bg-violet-500/20 text-violet-400 px-3 py-1 rounded-full font-medium border border-violet-500/30">
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
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/10"
                  title={
                    isFavorite(warkop.id)
                      ? "Hapus dari favorit"
                      : "Tambah ke favorit"
                  }
                >
                  {isFavorite(warkop.id) ? "💖" : "🤍"}
                </button>
              </div>

              <div className="text-3xl font-bold text-violet-400 mb-4">
                {formatPrice(menuItem.price)}
              </div>

              <p className="text-zinc-300 leading-relaxed mb-6">
                {menuItem.description}
              </p>

              {/* Tags */}
              {menuItem.tags && menuItem.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap mb-6">
                  {menuItem.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm font-medium border border-emerald-500/30"
                    >
                      ✓ {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="border-b border-white/10">
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
                        ? "border-violet-500 text-violet-400"
                        : "border-transparent text-zinc-500 hover:text-zinc-300"
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
                      <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                        🥘 Bahan-bahan
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {menuItem.ingredients.map((ingredient, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 p-2 bg-white/5 rounded-lg border border-white/10"
                          >
                            <span className="text-emerald-400">•</span>
                            <span className="text-zinc-300 text-sm">
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
                          <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
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
                                      : "text-zinc-600"
                                  }`}
                                >
                                  🌶️
                                </span>
                              ))}
                            </div>
                            <span className="text-sm text-zinc-400">
                              {getSpicyLevelText(menuItem.spicyLevel)}
                            </span>
                          </div>
                        </div>
                      )}

                    {menuItem.allergens && menuItem.allergens.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                          ⚠️ Alergen
                        </h4>
                        <div className="flex gap-2 flex-wrap">
                          {menuItem.allergens.map((allergen, index) => (
                            <span
                              key={index}
                              className="bg-red-500/20 text-red-400 px-2 py-1 rounded-lg text-sm border border-red-500/30"
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
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    📊 Informasi Nutrisi
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {menuItem.nutrition.calories && (
                      <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-xl text-center">
                        <div className="text-2xl font-bold text-blue-400">
                          {menuItem.nutrition.calories}
                        </div>
                        <div className="text-sm text-zinc-400">Kalori</div>
                      </div>
                    )}
                    {menuItem.nutrition.protein && (
                      <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl text-center">
                        <div className="text-2xl font-bold text-emerald-400">
                          {menuItem.nutrition.protein}
                        </div>
                        <div className="text-sm text-zinc-400">Protein</div>
                      </div>
                    )}
                    {menuItem.nutrition.caffeine && (
                      <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl text-center">
                        <div className="text-2xl font-bold text-amber-400">
                          {menuItem.nutrition.caffeine}
                        </div>
                        <div className="text-sm text-zinc-400">Kafein</div>
                      </div>
                    )}
                    {menuItem.nutrition.fat && (
                      <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl text-center">
                        <div className="text-2xl font-bold text-red-400">
                          {menuItem.nutrition.fat}
                        </div>
                        <div className="text-sm text-zinc-400">Lemak</div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-sm text-zinc-400">
                      <strong className="text-white">Catatan:</strong> Nilai nutrisi dapat bervariasi
                      tergantung metode penyajian dan porsi. Konsultasikan
                      dengan ahli gizi untuk kebutuhan diet khusus.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="space-y-6">
                  {/* Review Summary */}
                  <div className="bg-white/5 rounded-xl border border-white/10 p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-white">
                        ⭐ Ulasan untuk {menuItem.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-violet-400">
                          4.7
                        </span>
                        <div className="text-yellow-400">⭐⭐⭐⭐⭐</div>
                        <span className="text-zinc-500 text-sm">
                          (25 ulasan)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Write Review */}
                  {user && (
                    <div className="bg-[#121215] border border-white/10 rounded-xl p-4">
                      <h4 className="font-semibold text-white mb-3">Tulis Ulasan</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-zinc-300 mb-1">
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
                                    : "text-zinc-600"
                                } hover:text-yellow-400`}
                              >
                                ⭐
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-300 mb-1">
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
                            className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500"
                            rows={3}
                          />
                        </div>
                        <Button
                          onClick={handleSubmitReview}
                          variant="primary"
                        >
                          Kirim Ulasan
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Reviews List */}
                  <div className="space-y-4">
                    {mockMenuReviews.map((review) => (
                      <div key={review.id} className="bg-[#121215] border border-white/10 rounded-xl p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                            <span className="text-lg">👤</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h4 className="font-semibold text-white">
                                  {review.userName}
                                </h4>
                                <div className="flex items-center gap-2">
                                  <div className="text-yellow-400">
                                    {"⭐".repeat(review.rating)}
                                  </div>
                                  <span className="text-zinc-500 text-sm">
                                    {review.date}
                                  </span>
                                </div>
                              </div>
                              <button className="text-zinc-500 hover:text-zinc-300">
                                👍 {review.helpful}
                              </button>
                            </div>
                            <p className="text-zinc-300">{review.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Add to Cart Section */}
            <div className="bg-[#121215] border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                🛒 Tambah ke Keranjang
              </h3>

              <div className="space-y-4">
                {/* Quantity Selector */}
                <div className="flex items-center justify-between">
                  <span className="font-medium text-zinc-300">Jumlah:</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-lg font-bold text-white transition-colors border border-white/10"
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-bold text-lg text-white">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-lg font-bold text-white transition-colors border border-white/10"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block font-medium text-zinc-300 mb-2">
                    Catatan (opsional):
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Contoh: Gula sedikit, es banyak, pedas sedang..."
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500"
                    rows={2}
                  />
                </div>

                {/* Total Price */}
                <div className="flex items-center justify-between py-3 border-t border-white/10">
                  <span className="text-lg font-medium text-zinc-300">
                    Total:
                  </span>
                  <span className="text-2xl font-bold text-violet-400">
                    {formatPrice(totalPrice)}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={handleAddToCart}
                    disabled={menuItem.availability === "unavailable"}
                    variant="primary"
                    className="w-full py-3 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
