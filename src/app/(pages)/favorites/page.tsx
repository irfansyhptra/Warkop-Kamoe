"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useFavorites } from "@/hooks/useFavorites";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useNotification } from "@/hooks/useNotification";
import { Warkop, MenuItem } from "@/types";
import WarkopCard from "@/components/ui/WarkopCard";
import Button from "@/components/ui/Button";

export default function FavoritesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { 
    favorites, 
    toggleFavorite, 
    clearAllFavorites,
    favoriteMenuItems,
    removeMenuFromFavorites,
  } = useFavorites();
  const { addToCart } = useCart();
  const { showSuccess } = useNotification();

  const [activeTab, setActiveTab] = useState<"warkops" | "menus">("warkops");
  const [favoriteWarkops, setFavoriteWarkops] = useState<Warkop[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"name" | "rating" | "distance">("name");
  const [filterBy, setFilterBy] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!user) return;
    // Fetch warkops from API then filter by favorites
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        // request a larger page size to include most warkops in one request
        const res = await fetch("/api/warkops?limit=100");
        if (!res.ok) {
          console.error("Failed fetching warkops for favorites", await res.text());
          setFavoriteWarkops([]);
          return;
        }

        const json = await res.json();
        const allWarkops: Warkop[] = json.data?.warkops || [];
        const filteredWarkops = allWarkops.filter((warkop) => {
          const docId = (warkop as Warkop & { _id?: string }).id || (warkop as Warkop & { _id?: string })._id || "";
          return favorites.includes(docId);
        });
        setFavoriteWarkops(filteredWarkops);
      } catch (err) {
        console.error("Error fetching favorite warkops:", err);
        setFavoriteWarkops([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [favorites, user]);

  // Filter dan sort warkops
  const filteredAndSortedWarkops = favoriteWarkops
    .filter((warkop) => {
      // Filter berdasarkan pencarian
      const matchesSearch =
        warkop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        warkop.location?.toLowerCase().includes(searchQuery.toLowerCase());

      // Filter berdasarkan kategori
      const matchesCategory =
        filterBy === "all" || warkop.categories?.includes(filterBy);

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating;
        case "distance":
          return parseFloat(a.distance || "0") - parseFloat(b.distance || "0");
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

  // Filter menu items
  const filteredMenuItems = favoriteMenuItems.filter((item) => {
    return (
      item.menuItem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.warkopName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleViewDetail = (warkopId: string) => {
    router.push(`/warkop/${warkopId}`);
  };

  const handleRemoveFromFavorites = (warkopId: string) => {
    toggleFavorite(warkopId);
    showSuccess("Dihapus", "Warkop berhasil dihapus dari favorit");
  };

  const handleRemoveMenuFromFavorites = (menuItemId: string) => {
    removeMenuFromFavorites(menuItemId);
    showSuccess("Dihapus", "Menu berhasil dihapus dari favorit");
  };

  const handleAddToCart = (menuItem: MenuItem, warkopId: string, warkopName: string) => {
    addToCart(menuItem, warkopId, warkopName, 1);
    showSuccess("Berhasil", "Menu ditambahkan ke keranjang!");
    router.push("/cart");
  };

  const handleClearAllFavorites = () => {
    const totalFavorites = favorites.length + favoriteMenuItems.length;
    if (totalFavorites === 0) return;

    if (window.confirm("Apakah Anda yakin ingin menghapus semua favorit?")) {
      clearAllFavorites();
      showSuccess("Berhasil", "Semua favorit telah dihapus");
    }
  };

  const getUniqueCategories = () => {
    const categories = new Set<string>();
    favoriteWarkops.forEach((warkop) => {
      warkop.categories?.forEach((category) => categories.add(category));
    });
    return Array.from(categories);
  };

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl">
          <div className="text-6xl mb-6">🔒</div>
          <h1 className="text-2xl font-bold text-white mb-4">
            Login Diperlukan
          </h1>
          <p className="text-zinc-400 mb-6">
            Silakan login terlebih dahulu untuk melihat daftar favorit Anda.
          </p>
          <Link href="/auth/login">
            <Button variant="primary" size="lg">
              Login Sekarang
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-violet-500 mx-auto"></div>
          <p className="mt-4 text-zinc-400 text-lg">Memuat favorit Anda...</p>
        </div>
      </div>
    );
  }

  const totalFavorites = favorites.length + favoriteMenuItems.length;

  // Empty state
  if (totalFavorites === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-12">
            <div className="text-8xl mb-6">💔</div>
            <h1 className="text-3xl font-bold text-white mb-4">
              Belum Ada Favorit
            </h1>
            <p className="text-zinc-400 mb-8 max-w-md mx-auto">
              Anda belum menambahkan warkop atau menu ke favorit. Jelajahi dan simpan yang Anda suka!
            </p>
            <Link href="/">
              <Button variant="primary" size="lg">
                Jelajahi Warkop
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white flex items-center gap-3 mb-2">
                <span>💖</span>
                <span>Favorit Saya</span>
              </h1>
              <p className="text-zinc-400">
                {favorites.length} warkop & {favoriteMenuItems.length} menu tersimpan
              </p>
            </div>

            {totalFavorites > 0 && (
              <Button
                onClick={handleClearAllFavorites}
                variant="outline"
                className="text-red-400 border-red-500/30 hover:bg-red-500/10"
              >
                Hapus Semua
              </Button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 bg-white/5 backdrop-blur-sm rounded-xl p-1.5 mb-6 border border-white/10 w-fit">
            <button
              onClick={() => setActiveTab("warkops")}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === "warkops"
                  ? "bg-violet-500 text-white shadow-lg shadow-violet-500/25"
                  : "text-zinc-400 hover:text-white hover:bg-white/10"
              }`}
            >
              🏪 Warkop ({favorites.length})
            </button>
            <button
              onClick={() => setActiveTab("menus")}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === "menus"
                  ? "bg-violet-500 text-white shadow-lg shadow-violet-500/25"
                  : "text-zinc-400 hover:text-white hover:bg-white/10"
              }`}
            >
              🍽️ Menu ({favoriteMenuItems.length})
            </button>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Search */}
            <div className="md:col-span-1">
              <input
                type="text"
                placeholder={activeTab === "warkops" ? "Cari warkop..." : "Cari menu..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
              />
            </div>

            {activeTab === "warkops" && (
              <>
                {/* Category Filter */}
                <div>
                  <select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
                  >
                    <option value="all" className="bg-[#121215] text-white">Semua Kategori</option>
                    {getUniqueCategories().map((category) => (
                      <option key={category} value={category} className="bg-[#121215] text-white">
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort */}
                <div>
                  <select
                    value={sortBy}
                    onChange={(e) =>
                      setSortBy(e.target.value as "name" | "rating" | "distance")
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
                  >
                    <option value="name" className="bg-[#121215] text-white">Urutkan: Nama</option>
                    <option value="rating" className="bg-[#121215] text-white">Urutkan: Rating</option>
                    <option value="distance" className="bg-[#121215] text-white">Urutkan: Jarak</option>
                  </select>
                </div>
              </>
            )}
          </div>

          {/* Search Results Info */}
          {searchQuery && (
            <div className="mb-6">
              <p className="text-zinc-400">
                Menampilkan {activeTab === "warkops" ? filteredAndSortedWarkops.length : filteredMenuItems.length} hasil untuk &quot;{searchQuery}&quot;
              </p>
            </div>
          )}
        </div>

        {/* Warkops Tab */}
        {activeTab === "warkops" && (
          <>
            {filteredAndSortedWarkops.length === 0 ? (
              <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-12 text-center">
                <div className="text-6xl mb-4">🏪</div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {searchQuery ? "Tidak Ditemukan" : "Belum Ada Warkop Favorit"}
                </h3>
                <p className="text-zinc-400">
                  {searchQuery 
                    ? "Tidak ada warkop favorit yang sesuai dengan pencarian." 
                    : "Jelajahi warkop dan tambahkan ke favorit!"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedWarkops.map((warkop) => (
                  <WarkopCard
                    key={warkop.id}
                    warkop={warkop}
                    onViewDetail={handleViewDetail}
                    onToggleFavorite={handleRemoveFromFavorites}
                    isFavorite={true}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Menus Tab */}
        {activeTab === "menus" && (
          <>
            {filteredMenuItems.length === 0 ? (
              <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-12 text-center">
                <div className="text-6xl mb-4">🍽️</div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {searchQuery ? "Tidak Ditemukan" : "Belum Ada Menu Favorit"}
                </h3>
                <p className="text-zinc-400">
                  {searchQuery 
                    ? "Tidak ada menu favorit yang sesuai dengan pencarian." 
                    : "Jelajahi menu dan klik ❤️ untuk menambahkan ke favorit!"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMenuItems.map((item) => (
                  <div
                    key={item.menuItem.id}
                    className="group bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/10 p-4 shadow-md hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-300 hover:border-violet-500/30"
                  >
                    {/* Image */}
                    <div className="aspect-video rounded-lg overflow-hidden bg-zinc-900 mb-4 relative">
                      {item.menuItem.image ? (
                        <Image
                          src={item.menuItem.image}
                          alt={item.menuItem.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600">
                          <span className="text-white text-4xl">🍽️</span>
                        </div>
                      )}
                      
                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveMenuFromFavorites(item.menuItem.id)}
                        className="absolute top-3 right-3 p-2 rounded-full bg-pink-500/20 text-pink-500 border border-pink-500/30 hover:bg-pink-500/30 transition-all"
                        title="Hapus dari favorit"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                      <div>
                        <h3 className="font-semibold text-white mb-1 group-hover:text-violet-400 transition-colors">
                          {item.menuItem.name}
                        </h3>
                        <Link 
                          href={`/warkop/${item.warkopId}`}
                          className="text-violet-400 text-sm hover:text-violet-300 transition-colors"
                        >
                          📍 {item.warkopName}
                        </Link>
                      </div>

                      <p className="text-zinc-500 text-sm line-clamp-2">
                        {item.menuItem.description}
                      </p>

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-lg font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                          Rp {item.menuItem.price.toLocaleString("id-ID")}
                        </span>

                        {item.menuItem.availability === "available" && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleAddToCart(item.menuItem, item.warkopId, item.warkopName)}
                            className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg shadow-violet-500/20"
                          >
                            + Tambah
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link href="/">
            <Button variant="outline">
              <span className="mr-2">←</span>
              Kembali ke Beranda
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
