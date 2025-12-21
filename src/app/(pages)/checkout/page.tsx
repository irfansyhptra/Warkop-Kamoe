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
      clearCart();
      router.push(`/order-tracking/${result.order_id}`);
    },
    onError: (result: MidtransResult) => {
      console.error("Payment error:", result);
      showError("Pembayaran Gagal", result.status_message || "Terjadi kesalahan");
      setProcessingPayment(false);
    },
    onClose: () => {
      console.log("Payment popup closed");
      showInfo("Pembayaran Dibatalkan", "Anda menutup halaman pembayaran");
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
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Keranjang Kosong
          </h1>
          <p className="text-zinc-400 mb-6">
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
    <div className="min-h-screen bg-[#0a0a0b] py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-white mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Checkout */}
          <div className="lg:col-span-2 space-y-6">
            {/* Metode Pengiriman */}
            <div className="bg-[#121215] rounded-2xl border border-white/10 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Metode Pengiriman</h2>
              <div className="grid grid-cols-2 gap-4">
                <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                  deliveryMethod === "delivery" 
                    ? "border-violet-500/50 bg-violet-500/10" 
                    : "border-white/10 hover:bg-white/5"
                }`}>
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
                        ? "border-violet-500 bg-violet-500"
                        : "border-white/30"
                    }`}
                  >
                    {deliveryMethod === "delivery" && (
                      <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-white">Diantar</div>
                    <div className="text-sm text-zinc-400">+ Rp 5.000</div>
                  </div>
                </label>

                <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                  deliveryMethod === "pickup" 
                    ? "border-violet-500/50 bg-violet-500/10" 
                    : "border-white/10 hover:bg-white/5"
                }`}>
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
                        ? "border-violet-500 bg-violet-500"
                        : "border-white/30"
                    }`}
                  >
                    {deliveryMethod === "pickup" && (
                      <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-white">Ambil Sendiri</div>
                    <div className="text-sm text-zinc-400">Gratis</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Informasi Pengiriman */}
            <div className="bg-[#121215] rounded-2xl border border-white/10 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
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
                  variant="dark"
                  required
                />

                <Input
                  label="Nomor Telepon"
                  type="tel"
                  name="phone"
                  value={deliveryInfo.phone}
                  onChange={handleInputChange}
                  placeholder="Nomor telepon"
                  variant="dark"
                  required
                />

                {deliveryMethod === "delivery" && (
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Alamat Pengiriman *
                    </label>
                    <textarea
                      name="address"
                      value={deliveryInfo.address}
                      onChange={handleInputChange}
                      placeholder="Alamat lengkap untuk pengiriman"
                      rows={3}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 resize-none"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Catatan Tambahan
                  </label>
                  <textarea
                    name="notes"
                    value={deliveryInfo.notes}
                    onChange={handleInputChange}
                    placeholder="Catatan khusus untuk pesanan (opsional)"
                    rows={2}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 resize-none"
                  />
                </div>
              </form>
            </div>

            {/* Metode Pembayaran */}
            <div className="bg-[#121215] rounded-2xl border border-white/10 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Metode Pembayaran</h2>
              
              {/* Payment Method Cards */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {/* Online Payment Button */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("midtrans")}
                  className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                    paymentMethod === "midtrans"
                      ? "border-violet-500 bg-violet-500/10 ring-2 ring-violet-500/20"
                      : "border-white/10 hover:border-white/30 hover:bg-white/5"
                  }`}
                >
                  {paymentMethod === "midtrans" && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  <div className="text-3xl mb-2">💳</div>
                  <div className="font-semibold text-white text-sm">Online Payment</div>
                  <div className="text-xs text-zinc-400 mt-1">Bayar langsung</div>
                </button>

                {/* COD Button */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cod")}
                  className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                    paymentMethod === "cod"
                      ? "border-violet-500 bg-violet-500/10 ring-2 ring-violet-500/20"
                      : "border-white/10 hover:border-white/30 hover:bg-white/5"
                  }`}
                >
                  {paymentMethod === "cod" && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  <div className="text-3xl mb-2">💵</div>
                  <div className="font-semibold text-white text-sm">Bayar di Tempat</div>
                  <div className="text-xs text-zinc-400 mt-1">Cash on Delivery</div>
                </button>
              </div>

              {/* Payment Methods Detail - Online */}
              {paymentMethod === "midtrans" && (
                <div className="space-y-3">
                  <div className="text-sm font-medium text-zinc-300 mb-2">Pilih saat pembayaran:</div>
                  
                  {/* E-Wallets */}
                  <div className="bg-white/5 rounded-xl p-3">
                    <div className="text-xs text-zinc-400 mb-2 font-medium">E-Wallet</div>
                    <div className="flex flex-wrap gap-2">
                      <div className="flex items-center gap-2 px-3 py-2 bg-[#00AA13]/10 border border-[#00AA13]/30 rounded-lg">
                        <div className="w-6 h-6 bg-[#00AA13] rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">G</span>
                        </div>
                        <span className="text-[#00AA13] text-sm font-medium">GoPay</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2 bg-[#EE4D2D]/10 border border-[#EE4D2D]/30 rounded-lg">
                        <div className="w-6 h-6 bg-[#EE4D2D] rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">S</span>
                        </div>
                        <span className="text-[#EE4D2D] text-sm font-medium">ShopeePay</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2 bg-[#00AED6]/10 border border-[#00AED6]/30 rounded-lg">
                        <div className="w-6 h-6 bg-[#00AED6] rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">D</span>
                        </div>
                        <span className="text-[#00AED6] text-sm font-medium">DANA</span>
                      </div>
                    </div>
                  </div>

                  {/* QRIS */}
                  <div className="bg-white/5 rounded-xl p-3">
                    <div className="text-xs text-zinc-400 mb-2 font-medium">Scan QR</div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-[#e4002b]/10 to-[#00529f]/10 border border-[#e4002b]/30 rounded-lg w-fit">
                      <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
                        <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zm8-2v8h8V3h-8zm6 6h-4V5h4v4zM3 21h8v-8H3v8zm2-6h4v4H5v-4zm13 0h1v2h-2v-1h1v-1zm-3-2h2v1h-1v1h-1v-2zm2 3v1h1v1h-2v-2h1zm1-1h2v2h-1v-1h-1v-1zm-1 3h1v1h-1v-1zm2 1h2v1h-2v-1zm0-2h2v1h-2v-1zm-4 2h2v1h-2v-1zm-1-1h1v1h-1v-1z"/>
                        </svg>
                      </div>
                      <span className="text-white text-sm font-medium">QRIS</span>
                      <span className="text-zinc-400 text-xs">(Semua E-Wallet & Bank)</span>
                    </div>
                  </div>

                  {/* Bank Transfer */}
                  <div className="bg-white/5 rounded-xl p-3">
                    <div className="text-xs text-zinc-400 mb-2 font-medium">Transfer Bank</div>
                    <div className="flex flex-wrap gap-2">
                      <div className="flex items-center gap-2 px-3 py-2 bg-[#003D79]/10 border border-[#003D79]/30 rounded-lg">
                        <div className="w-6 h-6 bg-[#003D79] rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">B</span>
                        </div>
                        <span className="text-[#4A90D9] text-sm font-medium">BCA</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2 bg-[#F37021]/10 border border-[#F37021]/30 rounded-lg">
                        <div className="w-6 h-6 bg-[#F37021] rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">B</span>
                        </div>
                        <span className="text-[#F37021] text-sm font-medium">BNI</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2 bg-[#005BAA]/10 border border-[#005BAA]/30 rounded-lg">
                        <div className="w-6 h-6 bg-[#005BAA] rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">M</span>
                        </div>
                        <span className="text-[#4A90D9] text-sm font-medium">Mandiri</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2 bg-[#00529C]/10 border border-[#00529C]/30 rounded-lg">
                        <div className="w-6 h-6 bg-[#00529C] rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">B</span>
                        </div>
                        <span className="text-[#4A90D9] text-sm font-medium">BRI</span>
                      </div>
                    </div>
                  </div>

                  {/* Credit/Debit Card */}
                  <div className="bg-white/5 rounded-xl p-3">
                    <div className="text-xs text-zinc-400 mb-2 font-medium">Kartu Kredit/Debit</div>
                    <div className="flex flex-wrap gap-2">
                      <div className="flex items-center gap-2 px-3 py-2 bg-[#1A1F71]/10 border border-[#1A1F71]/30 rounded-lg">
                        <div className="w-6 h-6 bg-gradient-to-br from-[#1A1F71] to-[#F7B600] rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">V</span>
                        </div>
                        <span className="text-[#1A1F71] text-sm font-medium">Visa</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2 bg-[#EB001B]/10 border border-[#EB001B]/30 rounded-lg">
                        <div className="w-6 h-6 bg-gradient-to-br from-[#EB001B] to-[#F79E1B] rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">M</span>
                        </div>
                        <span className="text-[#EB001B] text-sm font-medium">Mastercard</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2 bg-[#006FCF]/10 border border-[#006FCF]/30 rounded-lg">
                        <div className="w-6 h-6 bg-[#006FCF] rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">A</span>
                        </div>
                        <span className="text-[#006FCF] text-sm font-medium">Amex</span>
                      </div>
                    </div>
                  </div>

                  {/* Security Info */}
                  <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-emerald-400">Pembayaran 100% Aman</p>
                        <p className="text-xs text-emerald-500/80">Diproses oleh Midtrans - PCI DSS Certified</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* COD Detail */}
              {paymentMethod === "cod" && (
                <div className="space-y-3">
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-amber-400">Bayar Tunai</p>
                        <p className="text-sm text-amber-300/70 mt-1">
                          Siapkan uang pas sebesar <span className="font-semibold text-amber-300">Rp {totalAmount.toLocaleString("id-ID")}</span> saat menerima pesanan
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 rounded-xl p-3">
                    <div className="flex items-center gap-2 text-zinc-400 text-sm">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Pesanan akan dikonfirmasi setelah pembayaran diterima</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Ringkasan Pesanan */}
          <div className="lg:col-span-1">
            <div className="bg-[#121215] rounded-2xl border border-white/10 p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-white mb-4">Ringkasan Pesanan</h2>

              <div className="space-y-3 mb-4">
                {cartItems.map((item) => (
                  <div
                    key={`${item.warkopId}-${item.id}`}
                    className="flex justify-between text-sm"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-white">{item.menuItem.name}</div>
                      <div className="text-zinc-400">
                        {item.warkopName} × {item.quantity}
                      </div>
                      {item.notes && (
                        <div className="text-zinc-500 text-xs italic">
                          Catatan: {item.notes}
                        </div>
                      )}
                    </div>
                    <div className="font-medium text-white">
                      Rp{" "}
                      {(item.menuItem.price * item.quantity).toLocaleString(
                        "id-ID"
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-zinc-300">
                  <span>Subtotal</span>
                  <span>Rp {getTotalPrice().toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between text-sm text-zinc-300">
                  <span>Ongkir</span>
                  <span>Rp {deliveryFee.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between text-sm text-zinc-300">
                  <span>Biaya Layanan (1%)</span>
                  <span>Rp {serviceFee.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t border-white/10 pt-2">
                  <span className="text-white">Total</span>
                  <span className="text-violet-400">
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
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Bayar Sekarang
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    Buat Pesanan (COD)
                  </span>
                )}
              </Button>

              {/* Payment Security Badge */}
              {paymentMethod === "midtrans" && (
                <div className="mt-4 flex flex-col items-center gap-2">
                  <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <span>Pembayaran aman diproses oleh Midtrans</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 opacity-60">
                    <span className="text-[10px] text-zinc-500 font-medium px-2 py-1 bg-white/5 rounded">PCI DSS</span>
                    <span className="text-[10px] text-zinc-500 font-medium px-2 py-1 bg-white/5 rounded">SSL 256-bit</span>
                    <span className="text-[10px] text-zinc-500 font-medium px-2 py-1 bg-white/5 rounded">3D Secure</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
