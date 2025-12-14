"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useNotification } from "@/hooks/useNotification";
import { useMidtrans, MidtransResult } from "@/hooks/useMidtrans";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

type PaymentMethodType = "cod" | "midtrans";

export default function CheckoutPage() {
  const [deliveryInfo, setDeliveryInfo] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    notes: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>("midtrans");
  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">("delivery");
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError, showInfo } = useNotification();
  const router = useRouter();

  // Initialize Midtrans
  const { isLoaded: midtransLoaded, pay: midtransPay } = useMidtrans({
    onSuccess: (result: MidtransResult) => {
      console.log("Payment success:", result);
      showSuccess("Pembayaran Berhasil", "Pesanan Anda sedang diproses");
      clearCart();
      router.push(`/order-tracking/${result.order_id}`);
    },
    onPending: (result: MidtransResult) => {
      console.log("Payment pending:", result);
      showInfo("Menunggu Pembayaran", "Silakan selesaikan pembayaran Anda");
      router.push(`/order-tracking/${result.order_id}`);
    },
    onError: (result: MidtransResult) => {
      console.error("Payment error:", result);
      showError("Pembayaran Gagal", result.status_message || "Terjadi kesalahan");
      setProcessingPayment(false);
    },
    onClose: () => {
      console.log("Payment popup closed");
      setProcessingPayment(false);
    },
  });

  // Pre-fill user info
  useEffect(() => {
    if (user) {
      setDeliveryInfo((prev) => ({
        ...prev,
        name: prev.name || user.name || "",
        phone: prev.phone || user.phone || "",
      }));
    }
  }, [user]);

  const deliveryFee = deliveryMethod === "delivery" ? 5000 : 0;
  const serviceFee = Math.round(getTotalPrice() * 0.01); // 1% service fee
  const totalAmount = getTotalPrice() + deliveryFee + serviceFee;

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

    if (!isAuthenticated || !user) {
      showError("Error", "Silakan login terlebih dahulu");
      router.push("/auth/login");
      return;
    }

    if (cartItems.length === 0) {
      showError("Error", "Keranjang kosong");
      return;
    }

    if (!deliveryInfo.name || !deliveryInfo.phone) {
      showError("Error", "Nama dan nomor telepon harus diisi");
      return;
    }

    if (deliveryMethod === "delivery" && !deliveryInfo.address) {
      showError("Error", "Alamat pengiriman harus diisi");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("warkop-kamoe-token");
      
      // Prepare order items
      const orderItems = cartItems.map((item) => ({
        menuItemId: item.id,
        warkopId: item.warkopId,
        name: item.menuItem.name,
        price: item.menuItem.price,
        quantity: item.quantity,
        notes: item.notes || "",
        image: item.menuItem.image || "",
      }));

      // Create transaction via API
      const response = await fetch("/api/payment/create-transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: orderItems,
          warkopId: cartItems[0]?.warkopId,
          warkopName: cartItems[0]?.warkopName,
          deliveryInfo: {
            name: deliveryInfo.name,
            phone: deliveryInfo.phone,
            address: deliveryInfo.address,
            city: deliveryInfo.city,
            notes: deliveryInfo.notes,
          },
          deliveryMethod,
          deliveryFee,
          paymentMethod,
          customerEmail: user.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal membuat pesanan");
      }

      // Handle payment based on method
      if (paymentMethod === "midtrans" && data.data?.snapToken) {
        setProcessingPayment(true);
        
        if (!midtransLoaded) {
          showError("Error", "Midtrans belum siap, silakan coba lagi");
          setLoading(false);
          return;
        }

        // Open Midtrans Snap popup
        try {
          await midtransPay(data.data.snapToken);
        } catch (paymentError) {
          console.error("Midtrans payment error:", paymentError);
          // Error handling is done in useMidtrans callbacks
        }
      } else {
        // COD - direct to order tracking
        showSuccess(
          "Pesanan Berhasil Dibuat",
          `Pesanan ${data.data.orderId} sedang diproses. Bayar saat pesanan diterima.`
        );
        clearCart();
        router.push(`/order-tracking/${data.data.orderId}`);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      showError(
        "Error",
        error instanceof Error ? error.message : "Terjadi kesalahan"
      );
    } finally {
      setLoading(false);
      setProcessingPayment(false);
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
                {/* Midtrans Payment */}
                <label
                  className={`flex items-center p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors ${
                    paymentMethod === "midtrans" ? "border-amber-500 bg-amber-50" : "border-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="midtrans"
                    checked={paymentMethod === "midtrans"}
                    onChange={() => setPaymentMethod("midtrans")}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                      paymentMethod === "midtrans"
                        ? "border-amber-600 bg-amber-600"
                        : "border-gray-300"
                    }`}
                  >
                    {paymentMethod === "midtrans" && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Pembayaran Online</div>
                    <div className="text-sm text-gray-600">
                      QRIS, GoPay, ShopeePay, Transfer Bank, Kartu Kredit
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">QRIS</span>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">GoPay</span>
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">ShopeePay</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Bank Transfer</span>
                    </div>
                  </div>
                  <div className="text-2xl">💳</div>
                </label>

                {/* COD Payment */}
                <label
                  className={`flex items-center p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors ${
                    paymentMethod === "cod" ? "border-amber-500 bg-amber-50" : "border-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                      paymentMethod === "cod"
                        ? "border-amber-600 bg-amber-600"
                        : "border-gray-300"
                    }`}
                  >
                    {paymentMethod === "cod" && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Cash on Delivery (COD)</div>
                    <div className="text-sm text-gray-600">
                      Bayar tunai saat pesanan diterima
                    </div>
                  </div>
                  <div className="text-2xl">💵</div>
                </label>
              </div>

              {/* Payment Info */}
              {paymentMethod === "midtrans" && (
                <div className="mt-4 p-3 bg-blue-50 rounded-xl">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-500">ℹ️</span>
                    <div className="text-sm text-blue-700">
                      <p className="font-medium">Pembayaran Aman via Midtrans</p>
                      <p className="mt-1">
                        Anda akan diarahkan ke halaman pembayaran Midtrans yang aman.
                        Pilih metode pembayaran favorit Anda.
                      </p>
                    </div>
                  </div>
                </div>
              )}
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
                <div className="flex justify-between text-sm">
                  <span>Biaya Layanan (1%)</span>
                  <span>Rp {serviceFee.toLocaleString("id-ID")}</span>
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
                disabled={loading || processingPayment}
              >
                {loading || processingPayment ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    {processingPayment ? "Memproses Pembayaran..." : "Memproses..."}
                  </span>
                ) : paymentMethod === "midtrans" ? (
                  "Bayar Sekarang"
                ) : (
                  "Buat Pesanan (COD)"
                )}
              </Button>

              {/* Payment Security Badge */}
              {paymentMethod === "midtrans" && (
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span>Pembayaran aman diproses oleh Midtrans</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
