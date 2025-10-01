"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useNotification } from "@/hooks/useNotification";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function CheckoutPage() {
  const [deliveryInfo, setDeliveryInfo] = useState({
    name: "",
    phone: "",
    address: "",
    notes: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<
    "cod" | "qris" | "bank_transfer"
  >("cod");
  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">(
    "delivery"
  );
  const [loading, setLoading] = useState(false);

  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const router = useRouter();

  const deliveryFee = deliveryMethod === "delivery" ? 5000 : 0;
  const totalAmount = getTotalPrice() + deliveryFee;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setDeliveryInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (cartItems.length === 0) {
      showError("Error", "Keranjang kosong");
      return;
    }

    if (deliveryMethod === "delivery" && !deliveryInfo.address) {
      showError("Error", "Alamat pengiriman harus diisi");
      return;
    }

    setLoading(true);

    try {
      // Simulasi API call untuk membuat order
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Buat order ID
      const orderId = `ORDER-${Date.now()}`;

      showSuccess(
        "Pesanan Berhasil Dibuat",
        `Pesanan Anda dengan ID ${orderId} sedang diproses`
      );

      clearCart();
      router.push(`/order-tracking/${orderId}`);
    } catch (error) {
      showError("Error", "Terjadi kesalahan saat memproses pesanan");
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Keranjang Kosong
          </h1>
          <p className="text-gray-600 mb-6">
            Tambahkan item ke keranjang untuk melanjutkan
          </p>
          <Button onClick={() => router.push("/")} variant="primary">
            Kembali Berbelanja
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Checkout */}
          <div className="lg:col-span-2 space-y-6">
            {/* Metode Pengiriman */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Metode Pengiriman</h2>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="delivery"
                    checked={deliveryMethod === "delivery"}
                    onChange={(e) =>
                      setDeliveryMethod(e.target.value as "delivery" | "pickup")
                    }
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 rounded-full border-2 mr-3 ${
                      deliveryMethod === "delivery"
                        ? "border-amber-600 bg-amber-600"
                        : "border-gray-300"
                    }`}
                  >
                    {deliveryMethod === "delivery" && (
                      <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium">Diantar</div>
                    <div className="text-sm text-gray-600">+ Rp 5.000</div>
                  </div>
                </label>

                <label className="flex items-center p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="pickup"
                    checked={deliveryMethod === "pickup"}
                    onChange={(e) =>
                      setDeliveryMethod(e.target.value as "delivery" | "pickup")
                    }
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 rounded-full border-2 mr-3 ${
                      deliveryMethod === "pickup"
                        ? "border-amber-600 bg-amber-600"
                        : "border-gray-300"
                    }`}
                  >
                    {deliveryMethod === "pickup" && (
                      <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium">Ambil Sendiri</div>
                    <div className="text-sm text-gray-600">Gratis</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Informasi Pengiriman */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">
                {deliveryMethod === "delivery"
                  ? "Informasi Pengiriman"
                  : "Informasi Pemesan"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Nama"
                  type="text"
                  name="name"
                  value={deliveryInfo.name}
                  onChange={handleInputChange}
                  placeholder="Nama lengkap"
                  required
                />

                <Input
                  label="Nomor Telepon"
                  type="tel"
                  name="phone"
                  value={deliveryInfo.phone}
                  onChange={handleInputChange}
                  placeholder="Nomor telepon"
                  required
                />

                {deliveryMethod === "delivery" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alamat Pengiriman *
                    </label>
                    <textarea
                      name="address"
                      value={deliveryInfo.address}
                      onChange={handleInputChange}
                      placeholder="Alamat lengkap untuk pengiriman"
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catatan Tambahan
                  </label>
                  <textarea
                    name="notes"
                    value={deliveryInfo.notes}
                    onChange={handleInputChange}
                    placeholder="Catatan khusus untuk pesanan (opsional)"
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
                  />
                </div>
              </form>
            </div>

            {/* Metode Pembayaran */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Metode Pembayaran</h2>
              <div className="space-y-3">
                {[
                  {
                    value: "cod",
                    label: "Cash on Delivery (COD)",
                    desc: "Bayar saat pesanan diterima",
                  },
                  {
                    value: "qris",
                    label: "QRIS",
                    desc: "Bayar dengan scan QR code",
                  },
                  {
                    value: "bank_transfer",
                    label: "Transfer Bank",
                    desc: "Transfer ke rekening toko",
                  },
                ].map((method) => (
                  <label
                    key={method.value}
                    className="flex items-center p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.value}
                      checked={paymentMethod === method.value}
                      onChange={(e) =>
                        setPaymentMethod(e.target.value as typeof paymentMethod)
                      }
                      className="sr-only"
                    />
                    <div
                      className={`w-4 h-4 rounded-full border-2 mr-3 ${
                        paymentMethod === method.value
                          ? "border-amber-600 bg-amber-600"
                          : "border-gray-300"
                      }`}
                    >
                      {paymentMethod === method.value && (
                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{method.label}</div>
                      <div className="text-sm text-gray-600">{method.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Ringkasan Pesanan */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-6">
              <h2 className="text-xl font-semibold mb-4">Ringkasan Pesanan</h2>

              <div className="space-y-3 mb-4">
                {cartItems.map((item) => (
                  <div
                    key={`${item.warkopId}-${item.id}`}
                    className="flex justify-between text-sm"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{item.menuItem.name}</div>
                      <div className="text-gray-600">
                        {item.warkopName} × {item.quantity}
                      </div>
                      {item.notes && (
                        <div className="text-gray-500 text-xs italic">
                          Catatan: {item.notes}
                        </div>
                      )}
                    </div>
                    <div className="font-medium">
                      Rp{" "}
                      {(item.menuItem.price * item.quantity).toLocaleString(
                        "id-ID"
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>Rp {getTotalPrice().toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Ongkir</span>
                  <span>Rp {deliveryFee.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span className="text-amber-600">
                    Rp {totalAmount.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                variant="primary"
                size="lg"
                className="w-full mt-6"
                disabled={loading}
              >
                {loading ? "Memproses..." : "Buat Pesanan"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
