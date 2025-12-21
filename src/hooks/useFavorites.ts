"use client";

import { useFavoritesContext } from "../contexts/FavoritesContext";

// Re-export the hook from FavoritesContext for backward compatibility
export const useFavorites = () => {
  const context = useFavoritesContext();
  
  // Return with aliases for backward compatibility
  return {
    // Original warkop-only interface
    favoriteWarkops: context.favoriteWarkops,
    favorites: context.favoriteWarkops, // Alias for compatibility
    addToFavorites: context.addWarkopToFavorites,
    removeFromFavorites: context.removeWarkopFromFavorites,
    toggleFavorite: context.toggleWarkopFavorite,
    isFavorite: context.isWarkopFavorite,
    clearAllFavorites: context.clearAllFavorites,
    getFavoritesCount: () => context.favoriteWarkops.length,
    
    // New menu favorites interface
    favoriteMenuItems: context.favoriteMenuItems,
    addMenuToFavorites: context.addMenuToFavorites,
    removeMenuFromFavorites: context.removeMenuFromFavorites,
    toggleMenuFavorite: context.toggleMenuFavorite,
    isMenuFavorite: context.isMenuFavorite,
    getTotalFavoritesCount: context.getTotalFavoritesCount,
  };
};
