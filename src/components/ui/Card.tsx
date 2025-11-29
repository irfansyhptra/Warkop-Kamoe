import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const Card: React.FC<CardProps> = ({
  children,
  className = "",
  hover = false,
  padding = "md",
}) => {
  const paddingClasses = {
    none: "p-0",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  const hoverClasses = hover
    ? "hover:shadow-[0_32px_80px_rgba(15,23,42,0.55)] hover:-translate-y-2 transition-all duration-300"
    : "";

  return (
    <div
      className={`rounded-3xl border border-amber-200/20 bg-gradient-to-br from-amber-50/10 to-amber-100/5 backdrop-blur-2xl shadow-[0_24px_64px_rgba(15,23,42,0.45)] ${paddingClasses[padding]} ${hoverClasses} ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
