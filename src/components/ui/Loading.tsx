import React from "react";

interface LoadingProps {
  fullScreen?: boolean;
  message?: string;
  size?: "sm" | "md" | "lg";
}

const Loading: React.FC<LoadingProps> = ({
  fullScreen = false,
  message = "Loading...",
  size = "md",
}) => {
  const sizeClasses = {
    sm: "h-8 w-8 border-2",
    md: "h-16 w-16 border-4",
    lg: "h-24 w-24 border-4",
  };

  const containerClasses = fullScreen
    ? "min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-900 via-amber-800 to-amber-900"
    : "flex items-center justify-center p-8";

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <div
          className={`${sizeClasses[size]} border-amber-400 border-t-transparent rounded-full animate-spin mx-auto`}
        ></div>
        {message && <p className="mt-4 text-amber-200 text-lg">{message}</p>}
      </div>
    </div>
  );
};

export default Loading;
