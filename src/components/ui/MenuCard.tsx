import React from "react";
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
    available: "bg-green-500/20 text-green-200",
    unavailable: "bg-red-500/20 text-red-200",
    limited: "bg-yellow-500/20 text-yellow-200",
  };

  const availabilityText = {
    available: "Tersedia",
    unavailable: "Habis",
    limited: "Terbatas",
  };

  return (
    <div className="bg-amber-50/10 backdrop-blur-xl rounded-2xl border border-amber-200/20 p-4 hover:shadow-lg transition-all duration-300">
      {/* Image Placeholder */}
      <div className="aspect-video rounded-xl overflow-hidden bg-amber-100/10 mb-4 flex items-center justify-center">
        <span className="text-amber-200/40 text-4xl">🍽️</span>
      </div>

      {/* Content */}
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-amber-50 mb-1">
              {menuItem.name}
            </h3>
            {menuItem.isRecommended && (
              <span className="inline-block px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-200 text-xs font-medium mb-2">
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

        <p className="text-amber-200/70 text-sm line-clamp-2">
          {menuItem.description}
        </p>

        <div className="flex items-center justify-between pt-2">
          <span className="text-lg font-bold text-amber-300">
            Rp {menuItem.price.toLocaleString("id-ID")}
          </span>

          {showAddButton &&
            onAddToCart &&
            menuItem.availability === "available" && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onAddToCart(menuItem)}
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
