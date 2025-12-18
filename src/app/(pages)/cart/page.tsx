"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useNotification } from "@/hooks/useNotification";
import Button from "@/components/ui/Button";
import CheckoutModal from "@/components/ui/CheckoutModal";

export default function CartPage() {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    updateNotes,
    clearCart,
    getTotalPrice,
    getTotalItems,
    getItemsByWarkop,
  } = useCart();
  const { isAuthenticated, authLoading } = useAuth();
  const { showError } = useNotification();
  const router = useRouter();
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-violet-500 mx-auto mb-4"></div>
          <p className="text-zinc-400">Memuat...</p>
        </div>
      </div>
    );
  }

  // Redirect ke login jika tidak authenticated (only after loading is done)
  if (!isAuthenticated) {
    router.push("/auth/login");
    return null;
  }

  const itemsByWarkop = getItemsByWarkop();
  const deliveryFee = 5000;
  const totalAmount = getTotalPrice() + deliveryFee;

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleNotesChange = (itemId: string, notes: string) => {
    updateNotes(itemId, notes);
  };

  const handleCheckout = () => {
    setIsCheckoutModalOpen(true);
  };

  const handleCheckoutConfirm = (
    deliveryInfo: {
      name: string;
      phone: string;
      address: string;
      notes?: string;
    },
    paymentMethod: string
  ) => {
    (async () => {
      try {
        // Build orders per warkop (one order per warkop)
        const itemsByWarkop = getItemsByWarkop();
        const createdOrders: Array<{ orderId?: string; _id?: string }> = [];

        for (const [warkopId, payload] of Object.entries(itemsByWarkop)) {
          const { warkopName, items } = payload as any;
          const subtotal = items.reduce(
            (s: number, it: any) => s + it.menuItem.price * it.quantity,
            0
          );
          const deliveryFee = 5000; // keep same fee used in UI, could be dynamic
          const totalAmount = subtotal + deliveryFee;

          const body = {
            items: items.map((it: any) => ({
              menuItemId: it.id,
              warkopId,
              name: it.menuItem.name,
              price: it.menuItem.price,
              quantity: it.quantity,
              notes: it.notes || "",
              image: it.menuItem.image || "",
            })),
            subtotal,
            deliveryFee,
            totalAmount,
            deliveryInfo,
            paymentMethod,
            warkopId,
            warkopName,
          };

          const token = localStorage.getItem("warkop-kamoe-token");
          const res = await fetch("/api/orders", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(body),
          });

          if (!res.ok) {
            const errText = await res.text();
            throw new Error(`Failed to create order: ${errText}`);
          }

          const json = await res.json();
          createdOrders.push(json.data?.order || {});
        }

        // All orders created successfully
        clearCart();
        const firstOrder = createdOrders[0];
        const redirectId = firstOrder?.orderId || firstOrder?._id;
        if (redirectId) {
          router.push(`/order-tracking/${redirectId}`);
        } else {
          router.push("/order-tracking/new");
        }
      } catch (err) {
        console.error("Checkout error:", err);
        showError("Checkout Gagal", (err as Error).message || "Terjadi kesalahan saat checkout");
      }
    })();
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-6">🛒</div>
          <h1 className="text-3xl font-bold text-white mb-4">
            Keranjang Kosong
          </h1>
          <p className="text-zinc-400 mb-8 max-w-md mx-auto">
            Belum ada item di keranjang Anda. Mari jelajahi warkop-warkop
            terbaik dan temukan menu favorit Anda!
          </p>
          <Link href="/">
            <Button variant="primary" size="lg" className="bg-gradient-to-r from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25">
              Mulai Belanja
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Keranjang Belanja
            </h1>
            <p className="text-zinc-400">
              {getTotalItems()} item dari {Object.keys(itemsByWarkop).length}{" "}
              warkop
            </p>
          </div>
          <Button
            onClick={() => clearCart()}
            variant="outline"
            className="text-red-400 border-red-500/30 hover:bg-red-500/10"
          >
            Kosongkan Keranjang
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {Object.entries(itemsByWarkop).map(
              ([warkopId, { warkopName, items }]) => (
                <div
                  key={warkopId}
                  className="bg-white/5 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-white/10"
                >
                  {/* Warkop Header */}
                  <div className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 px-6 py-4 border-b border-white/5">
                    <h2 className="text-lg font-semibold text-white">
                      {warkopName}
                    </h2>
                  </div>

                  {/* Items */}
                  <div className="p-6 space-y-4">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="border-b border-white/5 pb-4 last:border-b-0"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-white">
                              {item.menuItem.name}
                            </h3>
                            <p className="text-zinc-500 text-sm mt-1">
                              {item.menuItem.description}
                            </p>
                            <p className="font-bold text-violet-400 mt-2">
                              Rp {item.menuItem.price.toLocaleString("id-ID")} ×{" "}
                              {item.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg text-white">
                              Rp{" "}
                              {(
                                item.menuItem.price * item.quantity
                              ).toLocaleString("id-ID")}
                            </p>
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-zinc-400">
                              Jumlah:
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  handleQuantityChange(
                                    item.id,
                                    item.quantity - 1
                                  )
                                }
                                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors text-white"
                              >
                                -
                              </button>
                              <span className="w-8 text-center font-medium text-white">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  handleQuantityChange(
                                    item.id,
                                    item.quantity + 1
                                  )
                                }
                                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors text-white"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-400 hover:text-red-300 text-sm font-medium"
                          >
                            Hapus
                          </button>
                        </div>

                        {/* Notes */}
                        <div className="mt-3">
                          <input
                            type="text"
                            placeholder="Catatan khusus untuk item ini (opsional)"
                            value={item.notes || ""}
                            onChange={(e) =>
                              handleNotesChange(item.id, e.target.value)
                            }
                            className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 bg-white/5 text-white placeholder-zinc-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl shadow-lg p-6 sticky top-6 border border-white/10">
              <h3 className="text-lg font-semibold mb-4 text-white">Ringkasan Pesanan</h3>

              {/* Items Summary */}
              <div className="space-y-2 mb-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="flex-1 truncate text-zinc-400">
                      {item.menuItem.name} × {item.quantity}
                    </span>
                    <span className="font-medium text-zinc-300">
                      Rp{" "}
                      {(item.menuItem.price * item.quantity).toLocaleString(
                        "id-ID"
                      )}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-white/10 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Subtotal ({getTotalItems()} item)</span>
                  <span className="text-zinc-300">Rp {getTotalPrice().toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Biaya Pengiriman</span>
                  <span className="text-zinc-300">Rp {deliveryFee.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t border-white/10 pt-2">
                  <span className="text-white">Total</span>
                  <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                    Rp {totalAmount.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <Button
                onClick={handleCheckout}
                variant="primary"
                size="lg"
                className="w-full mt-6 bg-gradient-to-r from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25"
              >
                Checkout Sekarang
              </Button>

              {/* Additional Info */}
              <div className="mt-4 text-xs text-zinc-500 space-y-1">
                <p>✅ Pembayaran aman dengan berbagai metode</p>
                <p>🚚 Estimasi pengiriman 30-45 menit</p>
                <p>📞 Customer service 24/7</p>
              </div>
            </div>
          </div>
        </div>

        {/* Continue Shopping */}
        <div className="mt-8 text-center">
          <Link href="/">
            <Button variant="outline" className="border-white/20 text-zinc-400 hover:text-white hover:bg-white/5">← Lanjut Belanja</Button>
          </Link>
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        cartItems={cartItems}
        totalAmount={totalAmount}
        onCheckout={handleCheckoutConfirm}
      />
    </div>
  );
}
