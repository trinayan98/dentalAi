import React from "react";
import { clsx } from "clsx";

export const Button = ({
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-md";

  const variantStyles = {
    primary:
      "bg-primary-500 text-white hover:bg-primary-600 focus-visible:ring-primary-500",
    secondary:
      "bg-secondary-500 text-white hover:bg-secondary-600 focus-visible:ring-secondary-500",
    outline:
      "border border-gray-300 bg-transparent hover:bg-gray-100 dark:border-gray-100 dark:text-gray-100 dark:hover:bg-gray-800 focus-visible:ring-gray-500",
    ghost:
      "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:ring-gray-500",
    link: "bg-transparent underline-offset-4 hover:underline text-primary-500 hover:text-primary-600 focus-visible:ring-primary-500 p-0 height-auto",
    danger:
      "bg-error-500 text-white hover:bg-error-200 focus-visible:ring-error-500 ",
    green:
      "bg-green-500 text-white hover:bg-green-600 focus-visible:ring-green-500",
  };

  const sizeStyles = {
    xs: "h-8 px-3 text-xxs sm:h-7  sm:px-4",
    sm: "h-8 px-3 md:text-xs sm:h-9 md:px-2.5 px-1.8  text-2xs",
    md: "h-9 px-4 text-sm sm:h-10 sm:px-6 sm:text-sx",
    lg: "h-10 px-5 text-base sm:h-12 sm:px-8 sm:text-lg",
  };

  const widthStyles = fullWidth ? "w-full" : "";

  return (
    <button
      className={clsx(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        widthStyles,
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}

      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};
