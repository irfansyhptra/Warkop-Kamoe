import React from "react";

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
  sizes,
  width,
  height,
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

  return (
    <img
      src={src}
      alt={alt}
      className={`${fill ? "absolute inset-0 w-full h-full" : ""} ${className}`}
      onError={() => setImageError(true)}
      loading="lazy"
      width={width}
      height={height}
    />
  );
};

export default OptimizedImage;
