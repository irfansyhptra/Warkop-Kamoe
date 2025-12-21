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
    ? "hover:shadow-lg hover:shadow-violet-500/10 hover:-translate-y-1 hover:border-white/20 transition-all duration-300"
    : "";

  return (
    <div
      className={`rounded-2xl border border-white/10 bg-[#121215] backdrop-blur-xl ${paddingClasses[padding]} ${hoverClasses} ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
