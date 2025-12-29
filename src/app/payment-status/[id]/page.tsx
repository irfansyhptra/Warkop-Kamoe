"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Loading from "@/components/ui/Loading";
import { useMidtrans } from "@/hooks/useMidtrans";

type PaymentDetails = {
  paymentStatus: string;
  paymentType?: string;
  paymentMethod?: string;
  vaNumber?: string;
  bank?: string;
  snapToken?: string;
  snapRedirectUrl?: string;
  paidAt?: string;
  amount?: number;
};

export default function PaymentStatusPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params as { id: string };
  const { pay: midtransPay, isLoaded: midtransLoaded } = useMidtrans();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PaymentDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/payment/status/${id}`);
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Failed to fetch status");
      }
      const json = await res.json();
      setData(json.data || json);
      setError(null);
    } catch (err: any) {
      console.error("Fetch payment status error:", err);
      setError(err.message || "Error fetching status");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchStatus();
    // poll while pending
    const iv = setInterval(async () => {
      if (data && data.paymentStatus !== "pending") return;
      await fetchStatus();
    }, 10000);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleRetry = async () => {
    if (!data?.snapToken) return;
    setRetrying(true);
    try {
      await midtransPay(data.snapToken);
      // after payment popup, refetch status
      await fetchStatus();
    } catch (err) {
      console.error("Retry payment error:", err);
    } finally {
      setRetrying(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loading /></div>;

  return (
    <div className="min-h-screen bg-[#0a0a0b] py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-[#121215] rounded-2xl border border-white/10 p-6">
          <h1 className="text-2xl font-bold text-white mb-2">Status Pembayaran</h1>
          <p className="text-sm text-zinc-400 mb-4">Order ID: {id}</p>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded mb-4">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {data ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-zinc-400 text-sm">Status</span>
                  <div className="mt-1">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      data.paymentStatus === "paid" ? "bg-emerald-500/20 text-emerald-400" :
                      data.paymentStatus === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                      "bg-white/10 text-zinc-400"
                    }`}>
                      {data.paymentStatus}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm text-zinc-400">Metode</span>
                  <div className="mt-1 font-medium text-white">
                    {data.paymentMethod || data.paymentType || "-"}
                  </div>
                </div>
              </div>

              {data.vaNumber && (
                <div className="p-4 bg-white/5 rounded border border-white/10">
                  <p className="text-sm text-zinc-400">Virtual Account ({data.bank?.toUpperCase() || "VA"})</p>
                  <p className="font-mono font-bold text-lg text-white">{data.vaNumber}</p>
                </div>
              )}

              <div className="flex gap-3">
                {data.paymentStatus === "pending" && data.snapToken && (
                  <Button onClick={handleRetry} disabled={retrying || !midtransLoaded} variant="primary">
                    {retrying ? "Memproses..." : "Bayar Sekarang"}
                  </Button>
                )}

                <Button variant="outline" onClick={() => router.push(`/order-tracking/${id}`)}>
                  Lihat Detail Pesanan
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-white/5 rounded border border-white/10">
              <p className="text-zinc-400">Tidak ada informasi pembayaran untuk order ini.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
