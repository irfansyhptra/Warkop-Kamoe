"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import WarkopCard from "../components/ui/WarkopCard";
import Button from "../components/ui/Button";
import { warkopList, promos } from "../data";
import { useFavorites } from "../hooks/useFavorites";
import { useNotification } from "../hooks/useNotification";
import { ToastContainer } from "../components/ui/Toast";
import { Warkop } from "../types";

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-900 via-amber-800 to-amber-900">
      <div className="text-center">
        <div className="text-6xl text-amber-300/40 mb-4 animate-pulse">☕</div>
        <div className="text-amber-200">Loading...</div>
      </div>
    </div>
  );
}

function HomePageContent() {
  const router = useRouter();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { notifications, removeNotification, showSuccess } = useNotification();

  const [filteredWarkops, setFilteredWarkops] = useState<Warkop[]>(warkopList);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    "all",
    ...Array.from(new Set(warkopList.flatMap((warkop) => warkop.categories))),
  ];

  useEffect(() => {
    if (selectedCategory !== "all") {
      const filtered = warkopList.filter((warkop) =>
        warkop.categories.includes(selectedCategory)
      );
      setFilteredWarkops(filtered);
    } else {
      setFilteredWarkops(warkopList);
    }
  }, [selectedCategory]);

  const handleViewDetail = (warkopId: string) => {
    router.push(`/warkop/${warkopId}`);
  };

  const handleToggleFavorite = (warkopId: string) => {
    toggleFavorite(warkopId);
    const warkop = warkopList.find((w) => w.id === warkopId);
    if (warkop) {
      if (isFavorite(warkopId)) {
        showSuccess(
          "Dihapus dari Favorit",
          `${warkop.name} telah dihapus dari favorit`
        );
      } else {
        showSuccess(
          "Ditambah ke Favorit",
          `${warkop.name} telah ditambahkan ke favorit`
        );
      }
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 text-amber-400/20 text-6xl">
            ☕
          </div>
          <div className="absolute top-32 right-20 w-16 h-16 text-amber-300/15 text-4xl">
            🥐
          </div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 text-amber-500/20 text-3xl">
            🍰
          </div>
        </div>

        <div className="container mx-auto text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold text-amber-50 mb-6 leading-tight">
              Temukan
              <span className="block bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
                Warkop Terbaik
              </span>
              di Banda Aceh
            </h1>
            <p className="text-xl md:text-2xl text-amber-200/80 mb-8 max-w-2xl mx-auto">
              Nikmati pengalaman memesan kopi dan makanan dari warkop favorit
              dengan tampilan modern dan mudah digunakan
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8">
                Mulai Pesan Sekarang
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8">
                Lihat Menu Populer
              </Button>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-amber-300 mb-2">
                50+
              </div>
              <div className="text-amber-200/80">Warkop Partner</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-amber-300 mb-2">
                1000+
              </div>
              <div className="text-amber-200/80">Menu Tersedia</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-amber-300 mb-2">
                4.8
              </div>
              <div className="text-amber-200/80">Rating Rata-rata</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-amber-300 mb-2">
                24/7
              </div>
              <div className="text-amber-200/80">Layanan</div>
            </div>
          </div>
        </div>
      </section>

      {/* Promo Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-amber-50 mb-4">
              Promo Spesial Hari Ini
            </h2>
            <p className="text-amber-200/80 text-lg">
              Jangan lewatkan penawaran menarik dari warkop favorit
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {promos.map((promo) => (
              <div
                key={promo.id}
                className="group relative rounded-3xl border border-amber-200/20 bg-gradient-to-br from-red-500/10 to-pink-500/10 backdrop-blur-2xl p-6 shadow-[0_24px_64px_rgba(15,23,42,0.45)] hover:shadow-[0_32px_80px_rgba(15,23,42,0.55)] transition-all duration-300 hover:-translate-y-2"
              >
                <div className="aspect-video rounded-2xl overflow-hidden mb-4 bg-gradient-to-br from-red-400/20 to-pink-400/20">
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-red-200/40 text-4xl">🎉</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-red-500 text-white text-xs font-medium">
                      {promo.discount}% OFF
                    </span>
                    <span className="text-amber-200/60 text-xs">
                      Berlaku hingga{" "}
                      {new Date(promo.validUntil).toLocaleDateString("id-ID")}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-amber-50">
                    {promo.title}
                  </h3>
                  <p className="text-amber-200/80 text-sm">
                    {promo.description}
                  </p>
                  {promo.minPurchase && promo.minPurchase > 0 && (
                    <p className="text-amber-200/60 text-xs">
                      Min. pembelian Rp{" "}
                      {promo.minPurchase.toLocaleString("id-ID")}
                    </p>
                  )}
                  <Button variant="primary" className="w-full">
                    Gunakan Promo
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 px-4 sticky top-16 z-30 bg-gradient-to-r from-amber-900/40 to-amber-800/40 backdrop-blur-2xl border-b border-amber-200/20">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-amber-50">
              Warkop Pilihan ({filteredWarkops.length})
            </h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Filter
              </Button>
              <Button variant="outline" size="sm">
                Urutkan
              </Button>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? "bg-amber-500 text-white"
                    : "bg-amber-400/20 text-amber-200 hover:bg-amber-400/30"
                }`}
              >
                {category === "all" ? "Semua" : category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Warkop Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          {filteredWarkops.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl text-amber-200/40 mb-4">☕</div>
              <h3 className="text-2xl font-bold text-amber-100 mb-2">
                Tidak ada warkop ditemukan
              </h3>
              <p className="text-amber-200/80 mb-6">
                Coba ubah filter atau kata kunci pencarian
              </p>
              <Button onClick={() => setSelectedCategory("all")}>
                Reset Filter
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredWarkops.map((warkop) => (
                <WarkopCard
                  key={warkop.id}
                  warkop={warkop}
                  onViewDetail={handleViewDetail}
                  onToggleFavorite={handleToggleFavorite}
                  isFavorite={isFavorite(warkop.id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <ToastContainer
        notifications={notifications}
        onRemove={removeNotification}
      />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <HomePageContent />
    </Suspense>
  );
}
