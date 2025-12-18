import React, { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: "dark" | "light";
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      leftIcon,
      rightIcon,
      className = "",
      type = "text",
      variant = "light",
      ...props
    },
    ref
  ) => {
    const darkClasses = `
    w-full px-4 py-3 
    bg-white/5 
    border border-white/10 
    rounded-xl 
    text-white placeholder-zinc-500
    focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50
    hover:border-white/20 hover:bg-white/[0.07]
    transition-all duration-200
    ${leftIcon ? "pl-12" : ""}
    ${rightIcon ? "pr-12" : ""}
    ${error ? "border-red-500/50 focus:ring-red-500/50" : ""}
  `;

    const lightClasses = `
    w-full px-4 py-3 
    bg-white/5 
    border border-white/10 
    rounded-xl 
    text-white placeholder-zinc-500
    focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50
    hover:border-white/20 hover:bg-white/[0.07]
    transition-all duration-200
    ${leftIcon ? "pl-12" : ""}
    ${rightIcon ? "pr-12" : ""}
    ${error ? "border-red-500/50 focus:ring-red-500/50" : ""}
  `;

    const inputClasses = variant === "dark" ? darkClasses : lightClasses;

    return (
      <div className="space-y-2">
        {label && (
          <label
            className={`block text-sm font-semibold ${
              variant === "dark" ? "text-zinc-300" : "text-zinc-300"
            }`}
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div
              className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
                variant === "dark" ? "text-zinc-500" : "text-zinc-500"
              }`}
            >
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            type={type}
            className={`${inputClasses} ${className}`}
            {...props}
          />
          {rightIcon && (
            <div
              className={`absolute right-4 top-1/2 transform -translate-y-1/2 ${
                variant === "dark" ? "text-zinc-500" : "text-zinc-500"
              }`}
            >
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
