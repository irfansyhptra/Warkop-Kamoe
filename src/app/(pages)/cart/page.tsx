"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
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
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  // Redirect ke login jika tidak authenticated
  if (!isAuthenticated) {
    router.push("/auth/login");
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
    // Handle checkout logic here
    console.log("Checkout confirmed:", { deliveryInfo, paymentMethod });
    // Clear cart after successful checkout
    clearCart();
    // Redirect to order tracking or success page
    router.push("/order-tracking/new");
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-6">🛒</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Keranjang Kosong
          </h1>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Belum ada item di keranjang Anda. Mari jelajahi warkop-warkop
            terbaik dan temukan menu favorit Anda!
          </p>
          <Link href="/">
            <Button variant="primary" size="lg">
              Mulai Belanja
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Keranjang Belanja
            </h1>
            <p className="text-gray-600">
              {getTotalItems()} item dari {Object.keys(itemsByWarkop).length}{" "}
              warkop
            </p>
          </div>
          <Button
            onClick={() => clearCart()}
            variant="outline"
            className="text-red-600 border-red-600 hover:bg-red-50"
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
                  className="bg-white rounded-2xl shadow-sm overflow-hidden"
                >
                  {/* Warkop Header */}
                  <div className="bg-amber-50 px-6 py-4 border-b border-amber-100">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {warkopName}
                    </h2>
                  </div>

                  {/* Items */}
                  <div className="p-6 space-y-4">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="border-b border-gray-100 pb-4 last:border-b-0"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">
                              {item.menuItem.name}
                            </h3>
                            <p className="text-gray-600 text-sm mt-1">
                              {item.menuItem.description}
                            </p>
                            <p className="font-bold text-amber-600 mt-2">
                              Rp {item.menuItem.price.toLocaleString("id-ID")} ×{" "}
                              {item.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">
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
                            <span className="text-sm text-gray-700">
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
                                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                              >
                                -
                              </button>
                              <span className="w-8 text-center font-medium">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  handleQuantityChange(
                                    item.id,
                                    item.quantity + 1
                                  )
                                }
                                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
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
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-6">
              <h3 className="text-lg font-semibold mb-4">Ringkasan Pesanan</h3>

              {/* Items Summary */}
              <div className="space-y-2 mb-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="flex-1 truncate">
                      {item.menuItem.name} × {item.quantity}
                    </span>
                    <span className="font-medium">
                      Rp{" "}
                      {(item.menuItem.price * item.quantity).toLocaleString(
                        "id-ID"
                      )}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal ({getTotalItems()} item)</span>
                  <span>Rp {getTotalPrice().toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Biaya Pengiriman</span>
                  <span>Rp {deliveryFee.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span className="text-amber-600">
                    Rp {totalAmount.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <Button
                onClick={handleCheckout}
                variant="primary"
                size="lg"
                className="w-full mt-6"
              >
                Checkout Sekarang
              </Button>

              {/* Additional Info */}
              <div className="mt-4 text-xs text-gray-500 space-y-1">
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
            <Button variant="outline">← Lanjut Belanja</Button>
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
