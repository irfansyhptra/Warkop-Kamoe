import React from "react";
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
    <div className="group relative rounded-3xl border border-amber-200/20 bg-gradient-to-br from-amber-50/10 to-amber-100/5 backdrop-blur-2xl p-6 shadow-[0_24px_64px_rgba(15,23,42,0.45)] hover:shadow-[0_32px_80px_rgba(15,23,42,0.55)] transition-all duration-300 hover:-translate-y-2">
      {/* Favorite Button */}
      {onToggleFavorite && (
        <button
          onClick={() => onToggleFavorite(warkop.id)}
          className={`absolute top-4 right-4 p-2 rounded-full transition-colors duration-200 ${
            isFavorite
              ? "text-red-400 hover:text-red-300"
              : "text-amber-200/60 hover:text-red-400"
          }`}
        >
          <HeartIcon filled={isFavorite} />
        </button>
      )}

      {/* Warkop Image */}
      <div className="relative mb-4 aspect-video rounded-2xl overflow-hidden bg-amber-100/10">
        <div className="w-full h-full bg-gradient-to-br from-amber-400/20 to-amber-600/20 flex items-center justify-center">
          <span className="text-amber-200/40 text-4xl">☕</span>
        </div>
        {warkop.promo && (
          <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-red-500 text-white text-xs font-medium">
            PROMO
          </div>
        )}
      </div>

      {/* Warkop Info */}
      <div className="space-y-3">
        <div>
          <h3 className="text-xl font-bold text-amber-50 mb-1 group-hover:text-amber-100 transition-colors">
            {warkop.name}
          </h3>
          <div className="flex items-center gap-2 text-amber-200/80 text-sm">
            <LocationIcon />
            <span>{warkop.location}</span>
            <span>•</span>
            <span>{warkop.distance}</span>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-yellow-400">
            <StarIcon />
            <span className="text-amber-100 font-medium">{warkop.rating}</span>
          </div>
          <span className="text-amber-200/60 text-sm">
            ({warkop.totalReviews} reviews)
          </span>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {warkop.categories.slice(0, 2).map((category, index) => (
            <span
              key={index}
              className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-100 text-xs border border-amber-300/30"
            >
              {category}
            </span>
          ))}
          {warkop.categories.length > 2 && (
            <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-100 text-xs border border-amber-300/30">
              +{warkop.categories.length - 2} more
            </span>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          {warkop.badges.slice(0, 3).map((badge, index) => (
            <span
              key={index}
              className="px-2 py-1 rounded-lg bg-green-400/20 text-green-200 text-xs border border-green-300/30"
            >
              {badge}
            </span>
          ))}
        </div>

        {/* Busy Level */}
        <div className="text-sm">
          <span className="text-amber-200/80">{warkop.busyLevel}</span>
        </div>

        {/* Promo */}
        {warkop.promo && (
          <div className="p-3 rounded-2xl bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-400/30">
            <p className="text-red-200 text-sm font-medium">{warkop.promo}</p>
          </div>
        )}

        {/* Action Button */}
        <Button
          onClick={() => onViewDetail(warkop.id)}
          variant="primary"
          className="w-full mt-4"
        >
          Lihat Detail
        </Button>
      </div>
    </div>
  );
};

export default WarkopCard;
