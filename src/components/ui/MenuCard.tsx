"use client";

import React from "react";
import Image from "next/image";
import { MenuItem } from "@/types";
import { useFavorites } from "@/hooks/useFavorites";
import Button from "./Button";

interface MenuCardProps {
  menuItem: MenuItem;
  warkopId?: string;
  warkopName?: string;
  onAddToCart?: (item: MenuItem) => void;
  showAddButton?: boolean;
  showFavoriteButton?: boolean;
}

const MenuCard: React.FC<MenuCardProps> = ({
  menuItem,
  warkopId = "",
  warkopName = "",
  onAddToCart,
  showAddButton = true,
  showFavoriteButton = true,
}) => {
  const { toggleMenuFavorite, isMenuFavorite } = useFavorites();
  const isFavorite = isMenuFavorite(menuItem.id);

  const availabilityColors = {
    available: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    unavailable: "bg-red-500/10 text-red-400 border border-red-500/20",
    limited: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  };

  const availabilityText = {
    available: "Tersedia",
    unavailable: "Habis",
    limited: "Terbatas",
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleMenuFavorite(menuItem, warkopId, warkopName);
  };

  return (
    <div className="group relative bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/10 p-4 shadow-md hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-300 hover:border-violet-500/30">
      {/* Favorite Button */}
      {showFavoriteButton && (
        <button
          onClick={handleToggleFavorite}
          className={`absolute top-6 right-6 z-10 p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${
            isFavorite
              ? "bg-pink-500/20 text-pink-500 shadow-lg shadow-pink-500/20 border border-pink-500/30"
              : "bg-black/50 text-zinc-400 hover:text-pink-500 hover:bg-pink-500/10 border border-white/10"
          }`}
          title={isFavorite ? "Hapus dari favorit" : "Tambah ke favorit"}
        >
          <svg
            className="w-5 h-5"
            fill={isFavorite ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
      )}

      {/* Image */}
      <div className="aspect-video rounded-lg overflow-hidden bg-zinc-900 mb-4 relative">
        {menuItem.image ? (
          <Image
            src={menuItem.image}
            alt={menuItem.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={(e) => {
              // Fallback if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
              target.parentElement?.classList.add("flex", "items-center", "justify-center");
              const fallback = document.createElement("span");
              fallback.className = "text-violet-400 text-4xl";
              fallback.textContent = "🍽️";
              target.parentElement?.appendChild(fallback);
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600">
            <span className="text-white text-4xl">🍽️</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <div className="flex-1 pr-2">
            <h3 className="font-semibold text-white mb-1 group-hover:text-violet-400 transition-colors">
              {menuItem.name}
            </h3>
            {menuItem.isRecommended && (
              <span className="inline-block px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-medium mb-2 border border-amber-500/20">
                ⭐ Rekomendasi
              </span>
            )}
          </div>
          <span
            className={`px-2 py-1 rounded-lg text-xs font-medium flex-shrink-0 ${
              availabilityColors[menuItem.availability]
            }`}
          >
            {availabilityText[menuItem.availability]}
          </span>
        </div>

        <p className="text-zinc-500 text-sm line-clamp-2">
          {menuItem.description}
        </p>

        <div className="flex items-center justify-between pt-2">
          <span className="text-lg font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
            Rp {menuItem.price.toLocaleString("id-ID")}
          </span>

          {showAddButton &&
            onAddToCart &&
            menuItem.availability === "available" && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onAddToCart(menuItem)}
                className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg shadow-violet-500/20"
              >
                + Tambah
              </Button>
            )}
        </div>
      </div>
    </div>
  );
};

export default MenuCard;
