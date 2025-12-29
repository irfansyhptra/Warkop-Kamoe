import React from "react";

type StatusKey =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "on_delivery"
  | "delivered"
  | "cancelled";

interface Event {
  key: StatusKey;
  time?: string; // ISO or formatted string
  notes?: string;
}

interface Props {
  currentStatus: StatusKey;
  events?: Event[];
  className?: string;
}

const STEPS: { key: StatusKey; label: string; icon?: string }[] = [
  { key: "pending", label: "Menunggu Pembayaran", icon: "⏳" },
  { key: "confirmed", label: "Pesanan Dikonfirmasi", icon: "✅" },
  { key: "preparing", label: "Sedang Disiapkan", icon: "👨‍🍳" },
  { key: "ready", label: "Siap Diambil/Diantar", icon: "📦" },
  { key: "on_delivery", label: "Sedang Diantar", icon: "🛵" },
  { key: "delivered", label: "Selesai", icon: "🎉" },
  { key: "cancelled", label: "Dibatalkan", icon: "❌" },
];

export default function DeliveryTimeline({ currentStatus, events = [], className = "" }: Props) {
  const activeIndex = STEPS.findIndex((s) => s.key === currentStatus);

  const timeFor = (key: StatusKey) => {
    const ev = events.find((e) => e.key === key);
    if (!ev || !ev.time) return null;
    try {
      return new Date(ev.time).toLocaleString("id-ID", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short", year: "numeric" });
    } catch {
      return ev.time;
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="relative">
        <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-white/10"></div>
        <div className="absolute left-6 top-12 w-0.5 bg-violet-500 transition-all duration-500" style={{ height: `${(Math.max(0, activeIndex) / (STEPS.length - 1)) * 100}%` }}></div>

        <div className="space-y-6">
          {STEPS.map((step, index) => {
            const isCompleted = index <= activeIndex && currentStatus !== "cancelled";
            const isCurrent = index === activeIndex;
            const cancelledState = currentStatus === "cancelled" && step.key === "cancelled";

            return (
              <div key={step.key} className="relative flex items-center">
                <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center text-xl ${isCompleted || cancelledState ? "bg-violet-500 text-white" : "bg-white/10 text-zinc-500"} ${isCurrent ? "ring-4 ring-violet-500/30" : ""}`}>
                  <span>{step.icon || (isCompleted ? "✓" : index + 1)}</span>
                </div>

                <div className="ml-4">
                  <h3 className={`font-medium ${isCompleted || cancelledState ? "text-white" : "text-zinc-500"}`}>{step.label}</h3>
                  {isCurrent && <p className="text-sm text-violet-400 font-medium">Sedang diproses...</p>}
                  {timeFor(step.key as StatusKey) && <p className="text-xs text-zinc-400 mt-1">{timeFor(step.key as StatusKey)}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
