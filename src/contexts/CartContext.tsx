"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { CartItem, MenuItem } from "../types";

const CART_STORAGE_KEY = "warkop-kamoe-cart";

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (
    menuItem: MenuItem,
    warkopId: string,
    warkopName: string,
    quantity?: number,
    notes?: string
  ) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateNotes: (itemId: string, notes: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getItemsByWarkop: () => {
    [warkopId: string]: { warkopName: string; items: CartItem[] };
  };
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load cart from localStorage on mount (client-side only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        try {
          const parsed = JSON.parse(savedCart);
          setCartItems(parsed);
        } catch (error) {
          console.error("Error loading cart from localStorage:", error);
        }
      }
      setIsHydrated(true);
    }
  }, []);

  // Save cart to localStorage whenever it changes (only after hydration)
  useEffect(() => {
    if (isHydrated && typeof window !== "undefined") {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    }
  }, [cartItems, isHydrated]);

  const addToCart = useCallback(
    (
      menuItem: MenuItem,
      warkopId: string,
      warkopName: string,
      quantity: number = 1,
      notes?: string
    ) => {
      setCartItems((prevItems) => {
        const existingItemIndex = prevItems.findIndex(
          (item) =>
            item.menuItem.id === menuItem.id && item.warkopId === warkopId
        );

        if (existingItemIndex > -1) {
          // Update existing item
          const updatedItems = [...prevItems];
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + quantity,
            notes: notes || updatedItems[existingItemIndex].notes,
          };
          return updatedItems;
        } else {
          // Add new item
          const newItem: CartItem = {
            id: `${menuItem.id}-${warkopId}-${Date.now()}`,
            menuItem,
            warkopId,
            warkopName,
            quantity,
            notes,
          };
          return [...prevItems, newItem];
        }
      });
    },
    []
  );

  const removeFromCart = useCallback((itemId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  }, []);

  const updateQuantity = useCallback(
    (itemId: string, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(itemId);
        return;
      }

      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        )
      );
    },
    [removeFromCart]
  );

  const updateNotes = useCallback((itemId: string, notes: string) => {
    setCartItems((prevItems) =>
      prevItems.map((item) => (item.id === itemId ? { ...item, notes } : item))
    );
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const getTotalItems = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  const getTotalPrice = useCallback(() => {
    return cartItems.reduce(
      (total, item) => total + item.menuItem.price * item.quantity,
      0
    );
  }, [cartItems]);

  const getItemsByWarkop = useCallback(() => {
    const itemsByWarkop: {
      [warkopId: string]: { warkopName: string; items: CartItem[] };
    } = {};

    cartItems.forEach((item) => {
      if (!itemsByWarkop[item.warkopId]) {
        itemsByWarkop[item.warkopId] = {
          warkopName: item.warkopName,
          items: [],
        };
      }
      itemsByWarkop[item.warkopId].items.push(item);
    });

    return itemsByWarkop;
  }, [cartItems]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateNotes,
        clearCart,
        getTotalItems,
        getTotalPrice,
        getItemsByWarkop,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCartContext must be used within a CartProvider");
  }
  return context;
};
