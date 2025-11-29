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
      variant = "dark",
      ...props
    },
    ref
  ) => {
    const darkClasses = `
    w-full px-4 py-3 
    bg-white/10 backdrop-blur-xl 
    border border-amber-200/30 
    rounded-2xl 
    text-amber-50 placeholder-amber-200/60
    focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50
    transition-all duration-200
    ${leftIcon ? "pl-12" : ""}
    ${rightIcon ? "pr-12" : ""}
    ${error ? "border-red-400/50 focus:ring-red-400/50" : ""}
  `;

    const lightClasses = `
    w-full px-4 py-3 
    bg-white 
    border-2 border-gray-300 
    rounded-lg 
    text-gray-800 placeholder-gray-500
    focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500
    transition-all duration-200
    ${leftIcon ? "pl-12" : ""}
    ${rightIcon ? "pr-12" : ""}
    ${error ? "border-red-500 focus:ring-red-500" : ""}
  `;

    const inputClasses = variant === "dark" ? darkClasses : lightClasses;

    return (
      <div className="space-y-2">
        {label && (
          <label
            className={`block text-sm font-medium ${
              variant === "dark" ? "text-amber-100" : "text-gray-700"
            }`}
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div
              className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
                variant === "dark" ? "text-amber-200/60" : "text-gray-500"
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
                variant === "dark" ? "text-amber-200/60" : "text-gray-500"
              }`}
            >
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
