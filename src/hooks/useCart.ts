"use client";

import { useCartContext } from "../contexts/CartContext";

// Re-export the hook from CartContext for backward compatibility
export const useCart = useCartContext;
