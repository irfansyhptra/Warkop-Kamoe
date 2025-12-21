"use client";
import Script from "next/script";
import { ReactNode } from "react";
import { CartProvider } from "@/contexts/CartContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <FavoritesProvider>
        <Script src="https://app.sandbox.midtrans.com/snap/snap.js" data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}        strategy="lazyOnload"
        >
        </Script>
      <CartProvider>{children}</CartProvider>
    </FavoritesProvider>
  );
}
