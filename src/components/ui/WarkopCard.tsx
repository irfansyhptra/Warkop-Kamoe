import React from "react";
import Image from "next/image";
import { Warkop } from "../../types";
import Button from "./Button";

interface WarkopCardProps {
  warkop: Warkop;
  onViewDetail: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  isFavorite?: boolean;
}

const WarkopCard: React.FC<WarkopCardProps> = ({
  warkop,
  onViewDetail,
  onToggleFavorite,
  isFavorite = false,
}) => {
  const StarIcon = () => (
    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );

  const HeartIcon = ({ filled }: { filled: boolean }) => (
    <svg
      className="w-5 h-5"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  );

  const LocationIcon = () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );

  return (
    <div className="group relative rounded-2xl bg-white/[0.03] backdrop-blur-sm border border-white/10 p-6 shadow-lg hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-300 hover:-translate-y-2 hover:border-violet-500/30">
      {/* Favorite Button */}
      {onToggleFavorite && (
        <button
          onClick={() => onToggleFavorite(warkop.id)}
          className={`absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 backdrop-blur-sm transition-all duration-200 ${
            isFavorite
              ? "text-pink-500 hover:text-pink-400 shadow-lg shadow-pink-500/20"
              : "text-zinc-400 hover:text-pink-500"
          }`}
        >
          <HeartIcon filled={isFavorite} />
        </button>
      )}

      {/* Warkop Image */}
      <div className="relative mb-4 aspect-video rounded-xl overflow-hidden bg-zinc-900">
        {warkop.images && warkop.images.length > 0 ? (
          <Image
            src={warkop.images[0]}
            alt={warkop.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <span className="text-white text-4xl">☕</span>
          </div>
        )}
        {warkop.promo && (
          <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs font-medium shadow-lg shadow-violet-500/30">
            PROMO
          </div>
        )}
      </div>

      {/* Warkop Info */}
      <div className="space-y-3">
        <div>
          <h3 className="text-xl font-bold text-white mb-1 group-hover:text-violet-400 transition-colors">
            {warkop.name}
          </h3>
          <div className="flex items-center gap-2 text-zinc-500 text-sm">
            <LocationIcon />
            <span>{warkop.location}</span>
            <span>•</span>
            <span>{warkop.distance}</span>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-amber-400">
            <StarIcon />
            <span className="text-white font-medium">{warkop.rating}</span>
          </div>
          <span className="text-zinc-500 text-sm">
            ({warkop.totalReviews} reviews)
          </span>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {(warkop.categories || []).slice(0, 2).map((category, index) => (
            <span
              key={index}
              className="px-3 py-1 rounded-full bg-white/5 text-zinc-400 text-xs border border-white/10"
            >
              {category}
            </span>
          ))}
          {(warkop.categories || []).length > 2 && (
            <span className="px-3 py-1 rounded-full bg-white/5 text-zinc-400 text-xs border border-white/10">
              +{(warkop.categories || []).length - 2} more
            </span>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          {(warkop.badges || []).slice(0, 3).map((badge, index) => (
            <span
              key={index}
              className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20"
            >
              {badge}
            </span>
          ))}
        </div>

        {/* Status & Operating Hours */}
        <div className="flex items-center justify-between text-sm">
          {/* Status Indicator */}
          {(() => {
            // Check if warkop is active
            if (warkop.isActive === false) {
              return (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  Tutup
                </span>
              );
            }
            
            // Check opening hours
            let isOpen = true;
            let currentSchedule = null;
            
            if (Array.isArray(warkop.openingHours)) {
              const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
              const today = days[new Date().getDay()];
              currentSchedule = warkop.openingHours.find((h) => h.day === today);
              
              if (currentSchedule && !currentSchedule.isOpen) {
                isOpen = false;
              } else if (currentSchedule) {
                const now = new Date();
                const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                isOpen = currentTime >= currentSchedule.open && currentTime <= currentSchedule.close;
              }
            }
            
            // Determine busy level
            const busyLevel = warkop.busyLevel?.toLowerCase() || "";
            const isBusy = busyLevel.includes("ramai") || busyLevel.includes("busy");
            
            if (!isOpen) {
              return (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  Tutup
                </span>
              );
            }
            
            if (isBusy) {
              return (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  Ramai
                </span>
              );
            }
            
            return (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Buka
              </span>
            );
          })()}
          
          {/* Operating Hours */}
          <span className="text-zinc-500">
            {(() => {
              if (Array.isArray(warkop.openingHours)) {
                const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
                const today = days[new Date().getDay()];
                const schedule = warkop.openingHours.find((h) => h.day === today);
                if (schedule && schedule.isOpen) {
                  return `${schedule.open} - ${schedule.close}`;
                }
                return "Tutup hari ini";
              } else if (warkop.openingHours) {
                const hours = warkop.openingHours as { open: string; close: string; is24Hours?: boolean };
                if (hours.is24Hours) return "24 Jam";
                return `${hours.open} - ${hours.close}`;
              }
              return "";
            })()}
          </span>
        </div>

        {/* Promo */}
        {warkop.promo && (
          <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20">
            <p className="text-violet-400 text-sm font-medium">{warkop.promo}</p>
          </div>
        )}

        {/* Action Button */}
        <Button
          onClick={() => onViewDetail(warkop.id)}
          variant="primary"
          className="w-full mt-4 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg shadow-violet-500/20"
        >
          Lihat Detail
        </Button>
      </div>
    </div>
  );
};

export default WarkopCard;
