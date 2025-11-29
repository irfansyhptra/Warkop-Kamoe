import React from "react";
import Image from "next/image";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
  fill?: boolean;
  sizes?: string;
  width?: number;
  height?: number;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = "",
  fallback = "🖼️",
  fill = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  width = 400,
  height = 300,
}) => {
  const [imageError, setImageError] = React.useState(false);

  if (imageError || !src) {
    return (
      <div
        className={`flex items-center justify-center bg-amber-100/10 ${
          fill ? "absolute inset-0" : ""
        } ${className}`}
      >
        <span className="text-amber-200/40 text-4xl">{fallback}</span>
      </div>
    );
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className={className}
        onError={() => setImageError(true)}
        loading="lazy"
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() => setImageError(true)}
      loading="lazy"
    />
  );
};

export default OptimizedImage;
