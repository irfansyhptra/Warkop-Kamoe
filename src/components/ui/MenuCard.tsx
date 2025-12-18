import React from "react";
import Image from "next/image";
import { MenuItem } from "@/types";
import Button from "./Button";

interface MenuCardProps {
  menuItem: MenuItem;
  onAddToCart?: (item: MenuItem) => void;
  showAddButton?: boolean;
}

const MenuCard: React.FC<MenuCardProps> = ({
  menuItem,
  onAddToCart,
  showAddButton = true,
}) => {
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

  return (
    <div className="group bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/10 p-4 shadow-md hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-300 hover:border-violet-500/30">
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
          <div className="flex-1">
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
            className={`px-2 py-1 rounded-lg text-xs font-medium ${
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
