"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import WarkopCard from "../components/ui/WarkopCard";
import Button from "../components/ui/Button";
import { useFavorites } from "../hooks/useFavorites";
import { useNotification } from "../hooks/useNotification";
import { ToastContainer } from "../components/ui/Toast";
import { Warkop, Promo } from "../types";

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b]">
      <div className="text-center">
        <div className="text-6xl text-violet-500 mb-4 animate-pulse">☕</div>
        <div className="text-zinc-400">Loading...</div>
      </div>
    </div>
  );
}

function HomePageContent() {
  const router = useRouter();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { notifications, removeNotification, showSuccess } = useNotification();

  const [allWarkops, setAllWarkops] = useState<Warkop[]>([]);
  const [filteredWarkops, setFilteredWarkops] = useState<Warkop[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [categories, setCategories] = useState<string[]>(["all"]);
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch warkops from API
  const fetchWarkops = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/warkops?limit=50");
      if (res.ok) {
        const json = await res.json();
        const warkops: Warkop[] = (json.data?.warkops || []).map((w: any) => ({
          ...w,
          id: w._id || w.id,
        }));
        setAllWarkops(warkops);
        setFilteredWarkops(warkops);

        // Extract unique categories
        const cats = new Set<string>();
        warkops.forEach((w) => w.categories?.forEach((c: string) => cats.add(c)));
        setCategories(["all", ...Array.from(cats)]);
      }
    } catch (err) {
      console.error("Error fetching warkops:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch promos (placeholder – add API when available)
  const fetchPromos = useCallback(async () => {
    // TODO: replace with real /api/promos when implemented
    // For now show empty or static promos
    setPromos([]);
  }, []);

  useEffect(() => {
    fetchWarkops();
    fetchPromos();
  }, [fetchWarkops, fetchPromos]);

  // Filter warkops when category changes
  useEffect(() => {
    if (selectedCategory !== "all") {
      const filtered = allWarkops.filter((warkop) =>
        warkop.categories?.includes(selectedCategory)
      );
      setFilteredWarkops(filtered);
    } else {
      setFilteredWarkops(allWarkops);
    }
  }, [selectedCategory, allWarkops]);

  const handleViewDetail = (warkopId: string) => {
    router.push(`/warkop/${warkopId}`);
  };

  const handleToggleFavorite = (warkopId: string) => {
    toggleFavorite(warkopId);
    const warkop = allWarkops.find((w) => w.id === warkopId);
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
    <div className="min-h-screen bg-[#0a0a0b]">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden bg-gradient-to-br from-[#0a0a0b] via-[#121215] to-[#0a0a0b]">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>
        
        {/* Floating Icons */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-20 h-20 text-violet-400 text-6xl animate-float">
            ☕
          </div>
          <div className="absolute top-32 right-20 w-16 h-16 text-cyan-400 text-4xl animate-float" style={{ animationDelay: '0.5s' }}>
            🥐
          </div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 text-pink-400 text-3xl animate-float" style={{ animationDelay: '1s' }}>
            🍰
          </div>
        </div>

        <div className="container mx-auto text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Temukan
              <span className="block bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Warkop Terbaik
              </span>
              di Banda Aceh
            </h1>
            <p className="text-xl md:text-2xl text-zinc-400 mb-8 max-w-2xl mx-auto">
              Nikmati pengalaman memesan kopi dan makanan dari warkop favorit
              dengan tampilan modern dan mudah digunakan
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-300">
                Mulai Pesan Sekarang
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 border-white/20 text-white hover:bg-white/5 backdrop-blur-sm">
                Lihat Menu Populer
              </Button>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                50+
              </div>
              <div className="text-zinc-400">Warkop Partner</div>
            </div>
            <div className="text-center p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                1000+
              </div>
              <div className="text-zinc-400">Menu Tersedia</div>
            </div>
            <div className="text-center p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                4.8
              </div>
              <div className="text-zinc-400">Rating Rata-rata</div>
            </div>
            <div className="text-center p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                24/7
              </div>
              <div className="text-zinc-400">Layanan</div>
            </div>
          </div>
        </div>
      </section>

      {/* Promo Section */}
      {promos.length > 0 && (
      <section className="py-16 px-4 bg-[#121215]">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Promo Spesial Hari Ini
            </h2>
            <p className="text-zinc-400 text-lg">
              Jangan lewatkan penawaran menarik dari warkop favorit
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {promos.map((promo) => (
              <div
                key={promo.id}
                className="group relative rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 shadow-lg hover:shadow-violet-500/10 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-violet-500/30"
              >
                <div className="aspect-video rounded-xl overflow-hidden mb-4 bg-gradient-to-br from-violet-500 to-purple-600">
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-white text-4xl">🎉</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs font-medium">
                      {promo.discount}% OFF
                    </span>
                    <span className="text-zinc-500 text-xs">
                      Berlaku hingga{" "}
                      {new Date(promo.validUntil).toLocaleDateString("id-ID")}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    {promo.title}
                  </h3>
                  <p className="text-zinc-400 text-sm">
                    {promo.description}
                  </p>
                  {promo.minPurchase && promo.minPurchase > 0 && (
                    <p className="text-zinc-500 text-xs">
                      Min. pembelian Rp{" "}
                      {promo.minPurchase.toLocaleString("id-ID")}
                    </p>
                  )}
                  <Button variant="primary" className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700">
                    Gunakan Promo
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Filter Section */}
      <section className="py-8 px-4 sticky top-16 z-30 bg-[#0a0a0b]/80 backdrop-blur-xl border-b border-white/5 shadow-lg">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              Warkop Pilihan ({filteredWarkops.length})
            </h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="border-white/10 text-zinc-400 hover:bg-white/5 hover:text-white">
                Filter
              </Button>
              <Button variant="outline" size="sm" className="border-white/10 text-zinc-400 hover:bg-white/5 hover:text-white">
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
                    ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25"
                    : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white border border-white/10"
                }`}
              >
                {category === "all" ? "Semua" : category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Warkop Grid */}
      <section className="py-16 px-4 bg-[#0a0a0b]">
        <div className="container mx-auto">
          {filteredWarkops.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl text-violet-500 mb-4">☕</div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Tidak ada warkop ditemukan
              </h3>
              <p className="text-zinc-400 mb-6">
                Coba ubah filter atau kata kunci pencarian
              </p>
              <Button onClick={() => setSelectedCategory("all")} className="bg-gradient-to-r from-violet-500 to-purple-600">
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
