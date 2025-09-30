import React, { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
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
      ...props
    },
    ref
  ) => {
    const inputClasses = `
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
    ${className}
  `;

    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-amber-100">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-200/60">
              {leftIcon}
            </div>
          )}
          <input ref={ref} type={type} className={inputClasses} {...props} />
          {rightIcon && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-amber-200/60">
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
