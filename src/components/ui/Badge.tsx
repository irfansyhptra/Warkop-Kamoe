import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  size = "md",
  className = "",
}) => {
  const variantClasses = {
    default: "bg-amber-100/20 text-amber-200 border-amber-300/30",
    success: "bg-green-100/20 text-green-200 border-green-300/30",
    warning: "bg-yellow-100/20 text-yellow-200 border-yellow-300/30",
    error: "bg-red-100/20 text-red-200 border-red-300/30",
    info: "bg-blue-100/20 text-blue-200 border-blue-300/30",
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border backdrop-blur-xl font-medium ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
