"use client";

import React, { useState } from "react";
import { CartItem } from "@/types";
import Button from "./Button";
import Input from "./Input";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  totalAmount: number;
  onCheckout: (deliveryInfo: DeliveryInfo, paymentMethod: string) => void;
}

interface DeliveryInfo {
  name: string;
  phone: string;
  address: string;
  notes?: string;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  totalAmount,
  onCheckout,
}) => {
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({
    name: "",
    phone: "",
    address: "",
    notes: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<string>("cod");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      onCheckout(deliveryInfo, paymentMethod);
      onClose();
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setDeliveryInfo((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[#121215] rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-4 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Checkout</h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Order Summary */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <h3 className="font-semibold text-white mb-3">
              Ringkasan Pesanan
            </h3>
            <div className="space-y-2 mb-3">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between text-sm text-zinc-400"
                >
                  <span>
                    {item.menuItem.name} × {item.quantity}
                  </span>
                  <span className="font-medium text-white">
                    Rp{" "}
                    {(item.menuItem.price * item.quantity).toLocaleString(
                      "id-ID"
                    )}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-white/10 pt-2 flex justify-between font-bold text-white">
              <span>Total</span>
              <span className="text-violet-400">Rp {totalAmount.toLocaleString("id-ID")}</span>
            </div>
          </div>

          {/* Delivery Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">
              Informasi Pengiriman
            </h3>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">
                Nama Lengkap *
              </label>
              <Input
                type="text"
                name="name"
                value={deliveryInfo.name}
                onChange={handleInputChange}
                placeholder="Masukkan nama lengkap"
                required
                variant="dark"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">
                Nomor Telepon *
              </label>
              <Input
                type="tel"
                name="phone"
                value={deliveryInfo.phone}
                onChange={handleInputChange}
                placeholder="Contoh: 08123456789"
                required
                variant="dark"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">
                Alamat Lengkap *
              </label>
              <textarea
                name="address"
                value={deliveryInfo.address}
                onChange={handleInputChange}
                placeholder="Masukkan alamat lengkap pengiriman"
                required
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all bg-white/5 text-white placeholder-zinc-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">
                Catatan (Opsional)
              </label>
              <textarea
                name="notes"
                value={deliveryInfo.notes}
                onChange={handleInputChange}
                placeholder="Catatan tambahan untuk pesanan"
                rows={2}
                className="w-full px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all bg-white/5 text-white placeholder-zinc-500"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-3">
            <h3 className="font-semibold text-white">Metode Pembayaran</h3>

            <div className="space-y-2">
              <label className="flex items-center p-4 bg-white/5 rounded-xl border-2 border-white/10 cursor-pointer hover:border-violet-500/50 transition-colors">
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4 text-violet-500 accent-violet-500"
                />
                <span className="ml-3 font-medium text-white">
                  Cash on Delivery (COD)
                </span>
              </label>

              <label className="flex items-center p-4 bg-white/5 rounded-xl border-2 border-white/10 cursor-pointer hover:border-violet-500/50 transition-colors">
                <input
                  type="radio"
                  name="payment"
                  value="qris"
                  checked={paymentMethod === "qris"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4 text-violet-500 accent-violet-500"
                />
                <span className="ml-3 font-medium text-white">QRIS</span>
              </label>

              <label className="flex items-center p-4 bg-white/5 rounded-xl border-2 border-white/10 cursor-pointer hover:border-violet-500/50 transition-colors">
                <input
                  type="radio"
                  name="payment"
                  value="bank_transfer"
                  checked={paymentMethod === "bank_transfer"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4 text-violet-500 accent-violet-500"
                />
                <span className="ml-3 font-medium text-white">
                  Transfer Bank
                </span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isProcessing}
              className="flex-1"
            >
              {isProcessing ? "Memproses..." : "Konfirmasi Pesanan"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutModal;
