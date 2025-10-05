"use client";

import { useState, useCallback, useEffect } from "react";

const FAVORITES_STORAGE_KEY = "warkop-kamoe-favorites";

export const useFavorites = () => {
  const [favoriteWarkops, setFavoriteWarkops] = useState<string[]>([]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (savedFavorites) {
      try {
        setFavoriteWarkops(JSON.parse(savedFavorites));
      } catch (error) {
        console.error("Error loading favorites from localStorage:", error);
      }
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify(favoriteWarkops)
    );
  }, [favoriteWarkops]);

  const addToFavorites = useCallback((warkopId: string) => {
    setFavoriteWarkops((prev) => {
      if (!prev.includes(warkopId)) {
        return [...prev, warkopId];
      }
      return prev;
    });
  }, []);

  const removeFromFavorites = useCallback((warkopId: string) => {
    setFavoriteWarkops((prev) => prev.filter((id) => id !== warkopId));
  }, []);

  const toggleFavorite = useCallback((warkopId: string) => {
    setFavoriteWarkops((prev) => {
      if (prev.includes(warkopId)) {
        return prev.filter((id) => id !== warkopId);
      } else {
        return [...prev, warkopId];
      }
    });
  }, []);

  const clearAllFavorites = useCallback(() => {
    setFavoriteWarkops([]);
  }, []);

  const isFavorite = useCallback(
    (warkopId: string) => {
      return favoriteWarkops.includes(warkopId);
    },
    [favoriteWarkops]
  );

  const getFavoritesCount = useCallback(() => {
    return favoriteWarkops.length;
  }, [favoriteWarkops]);

  return {
    favoriteWarkops,
    favorites: favoriteWarkops, // Alias for compatibility
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    clearAllFavorites,
    isFavorite,
    getFavoritesCount,
  };
};
