"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/hooks/useAuth";
import { useNotification } from "@/hooks/useNotification";
import { Warkop } from "@/types";
import { warkopList } from "@/data";
import WarkopCard from "@/components/ui/WarkopCard";
import Button from "@/components/ui/Button";

export default function FavoritesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { favorites, toggleFavorite, clearAllFavorites } = useFavorites();
  const { showSuccess } = useNotification();

  const [favoriteWarkops, setFavoriteWarkops] = useState<Warkop[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"name" | "rating" | "distance">("name");
  const [filterBy, setFilterBy] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!user) return;

    // Simulasi loading data
    setLoading(true);
    setTimeout(() => {
      // Filter warkop yang ada di favorites
      const filteredWarkops = warkopList.filter((warkop) =>
        favorites.includes(warkop.id)
      );
      setFavoriteWarkops(filteredWarkops);
      setLoading(false);
    }, 800);
  }, [favorites, user]);

  // Filter dan sort warkops
  const filteredAndSortedWarkops = favoriteWarkops
    .filter((warkop) => {
      // Filter berdasarkan pencarian
      const matchesSearch =
        warkop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        warkop.location.toLowerCase().includes(searchQuery.toLowerCase());

      // Filter berdasarkan kategori
      const matchesCategory =
        filterBy === "all" || warkop.categories.includes(filterBy);

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating;
        case "distance":
          return parseFloat(a.distance) - parseFloat(b.distance);
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const handleViewDetail = (warkopId: string) => {
    router.push(`/warkop/${warkopId}`);
  };

  const handleRemoveFromFavorites = (warkopId: string) => {
    toggleFavorite(warkopId);
    showSuccess("Dihapus", "Warkop berhasil dihapus dari favorit");
  };

  const handleClearAllFavorites = () => {
    if (favorites.length === 0) return;

    if (window.confirm("Apakah Anda yakin ingin menghapus semua favorit?")) {
      clearAllFavorites();
      showSuccess("Berhasil", "Semua favorit telah dihapus");
    }
  };

  const getUniqueCategories = () => {
    const categories = new Set<string>();
    favoriteWarkops.forEach((warkop) => {
      warkop.categories.forEach((category) => categories.add(category));
    });
    return Array.from(categories);
  };

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-amber-800 to-amber-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8 bg-amber-50/10 backdrop-blur-xl rounded-3xl border border-amber-200/20">
          <div className="text-6xl mb-6">🔒</div>
          <h1 className="text-2xl font-bold text-amber-50 mb-4">
            Login Diperlukan
          </h1>
          <p className="text-amber-200/80 mb-6">
            Silakan login terlebih dahulu untuk melihat daftar warkop favorit
            Anda.
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
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-amber-800 to-amber-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-amber-400 mx-auto"></div>
          <p className="mt-4 text-amber-200 text-lg">Memuat favorit Anda...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (favoriteWarkops.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-amber-800 to-amber-900 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center bg-amber-50/10 backdrop-blur-xl rounded-3xl border border-amber-200/20 p-12">
            <div className="text-8xl mb-6">💔</div>
            <h1 className="text-3xl font-bold text-amber-50 mb-4">
              Belum Ada Favorit
            </h1>
            <p className="text-amber-200/80 mb-8 max-w-md mx-auto">
              Anda belum menambahkan warkop ke favorit. Jelajahi warkop-warkop
              terbaik dan simpan yang Anda suka!
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
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-amber-800 to-amber-900 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-amber-50 flex items-center gap-3 mb-2">
                <span>💖</span>
                <span>Favorit Saya</span>
              </h1>
              <p className="text-amber-200/80">
                {favoriteWarkops.length} warkop tersimpan dalam favorit
              </p>
            </div>

            {favoriteWarkops.length > 0 && (
              <Button
                onClick={handleClearAllFavorites}
                variant="outline"
                className="text-red-300 border-red-300/50 hover:bg-red-500/20"
              >
                Hapus Semua
              </Button>
            )}
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Search */}
            <div className="md:col-span-1">
              <input
                type="text"
                placeholder="Cari warkop..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-amber-50/10 border border-amber-200/20 text-amber-50 placeholder-amber-200/50 focus:outline-none focus:ring-2 focus:ring-amber-500/50 backdrop-blur-xl"
              />
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-amber-50/10 border border-amber-200/20 text-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500/50 backdrop-blur-xl"
              >
                <option value="all">Semua Kategori</option>
                {getUniqueCategories().map((category) => (
                  <option key={category} value={category}>
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
                className="w-full px-4 py-3 rounded-xl bg-amber-50/10 border border-amber-200/20 text-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500/50 backdrop-blur-xl"
              >
                <option value="name">Urutkan: Nama</option>
                <option value="rating">Urutkan: Rating</option>
                <option value="distance">Urutkan: Jarak</option>
              </select>
            </div>
          </div>

          {/* Search Results Info */}
          {searchQuery && (
            <div className="mb-6">
              <p className="text-amber-200/80">
                Menampilkan {filteredAndSortedWarkops.length} hasil untuk &quot;
                {searchQuery}&quot;
              </p>
            </div>
          )}
        </div>

        {/* Warkop Grid */}
        {filteredAndSortedWarkops.length === 0 ? (
          <div className="bg-amber-50/10 backdrop-blur-xl rounded-3xl border border-amber-200/20 p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-amber-50 mb-2">
              Tidak Ditemukan
            </h3>
            <p className="text-amber-200/80">
              Tidak ada warkop favorit yang sesuai dengan pencarian atau filter
              Anda.
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
