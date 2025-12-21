"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { MenuItem } from "../types";

const FAVORITES_STORAGE_KEY = "warkop-kamoe-favorites";
const MENU_FAVORITES_STORAGE_KEY = "warkop-kamoe-menu-favorites";

interface FavoriteMenuItem {
  menuItem: MenuItem;
  warkopId: string;
  warkopName: string;
  addedAt: string;
}

interface FavoritesContextType {
  // Warkop favorites
  favoriteWarkops: string[];
  addWarkopToFavorites: (warkopId: string) => void;
  removeWarkopFromFavorites: (warkopId: string) => void;
  toggleWarkopFavorite: (warkopId: string) => void;
  isWarkopFavorite: (warkopId: string) => boolean;
  
  // Menu item favorites
  favoriteMenuItems: FavoriteMenuItem[];
  addMenuToFavorites: (menuItem: MenuItem, warkopId: string, warkopName: string) => void;
  removeMenuFromFavorites: (menuItemId: string) => void;
  toggleMenuFavorite: (menuItem: MenuItem, warkopId: string, warkopName: string) => void;
  isMenuFavorite: (menuItemId: string) => boolean;
  
  // General
  clearAllFavorites: () => void;
  getTotalFavoritesCount: () => number;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [favoriteWarkops, setFavoriteWarkops] = useState<string[]>([]);
  const [favoriteMenuItems, setFavoriteMenuItems] = useState<FavoriteMenuItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load favorites from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Load warkop favorites
      const savedWarkopFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (savedWarkopFavorites) {
        try {
          setFavoriteWarkops(JSON.parse(savedWarkopFavorites));
        } catch (error) {
          console.error("Error loading warkop favorites:", error);
        }
      }
      
      // Load menu favorites
      const savedMenuFavorites = localStorage.getItem(MENU_FAVORITES_STORAGE_KEY);
      if (savedMenuFavorites) {
        try {
          setFavoriteMenuItems(JSON.parse(savedMenuFavorites));
        } catch (error) {
          console.error("Error loading menu favorites:", error);
        }
      }
      
      setIsHydrated(true);
    }
  }, []);

  // Save warkop favorites to localStorage
  useEffect(() => {
    if (isHydrated && typeof window !== "undefined") {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteWarkops));
    }
  }, [favoriteWarkops, isHydrated]);

  // Save menu favorites to localStorage
  useEffect(() => {
    if (isHydrated && typeof window !== "undefined") {
      localStorage.setItem(MENU_FAVORITES_STORAGE_KEY, JSON.stringify(favoriteMenuItems));
    }
  }, [favoriteMenuItems, isHydrated]);

  // Warkop favorites functions
  const addWarkopToFavorites = useCallback((warkopId: string) => {
    setFavoriteWarkops((prev) => {
      if (!prev.includes(warkopId)) {
        return [...prev, warkopId];
      }
      return prev;
    });
  }, []);

  const removeWarkopFromFavorites = useCallback((warkopId: string) => {
    setFavoriteWarkops((prev) => prev.filter((id) => id !== warkopId));
  }, []);

  const toggleWarkopFavorite = useCallback((warkopId: string) => {
    setFavoriteWarkops((prev) => {
      if (prev.includes(warkopId)) {
        return prev.filter((id) => id !== warkopId);
      } else {
        return [...prev, warkopId];
      }
    });
  }, []);

  const isWarkopFavorite = useCallback(
    (warkopId: string) => favoriteWarkops.includes(warkopId),
    [favoriteWarkops]
  );

  // Menu item favorites functions
  const addMenuToFavorites = useCallback(
    (menuItem: MenuItem, warkopId: string, warkopName: string) => {
      setFavoriteMenuItems((prev) => {
        const exists = prev.some((item) => item.menuItem.id === menuItem.id);
        if (!exists) {
          return [
            ...prev,
            {
              menuItem,
              warkopId,
              warkopName,
              addedAt: new Date().toISOString(),
            },
          ];
        }
        return prev;
      });
    },
    []
  );

  const removeMenuFromFavorites = useCallback((menuItemId: string) => {
    setFavoriteMenuItems((prev) =>
      prev.filter((item) => item.menuItem.id !== menuItemId)
    );
  }, []);

  const toggleMenuFavorite = useCallback(
    (menuItem: MenuItem, warkopId: string, warkopName: string) => {
      setFavoriteMenuItems((prev) => {
        const exists = prev.some((item) => item.menuItem.id === menuItem.id);
        if (exists) {
          return prev.filter((item) => item.menuItem.id !== menuItem.id);
        } else {
          return [
            ...prev,
            {
              menuItem,
              warkopId,
              warkopName,
              addedAt: new Date().toISOString(),
            },
          ];
        }
      });
    },
    []
  );

  const isMenuFavorite = useCallback(
    (menuItemId: string) =>
      favoriteMenuItems.some((item) => item.menuItem.id === menuItemId),
    [favoriteMenuItems]
  );

  // General functions
  const clearAllFavorites = useCallback(() => {
    setFavoriteWarkops([]);
    setFavoriteMenuItems([]);
  }, []);

  const getTotalFavoritesCount = useCallback(() => {
    return favoriteWarkops.length + favoriteMenuItems.length;
  }, [favoriteWarkops, favoriteMenuItems]);

  return (
    <FavoritesContext.Provider
      value={{
        favoriteWarkops,
        addWarkopToFavorites,
        removeWarkopFromFavorites,
        toggleWarkopFavorite,
        isWarkopFavorite,
        favoriteMenuItems,
        addMenuToFavorites,
        removeMenuFromFavorites,
        toggleMenuFavorite,
        isMenuFavorite,
        clearAllFavorites,
        getTotalFavoritesCount,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavoritesContext = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavoritesContext must be used within a FavoritesProvider");
  }
  return context;
};
