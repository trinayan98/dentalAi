import React from "react";
import { clsx } from "clsx";
import { Tooltip } from "@mui/material";

export const IconButton = ({
  variant = "primary",
  size = "md",
  isLoading = false,
  icon,
  className,
  disabled,
  tooltip,
  tooltipPlacement = "top",
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none rounded-md";

  const variantStyles = {
    primary:
      "bg-primary-200 text-primary-500 hover:bg-primary-500  hover:text-primary-200 focus-visible:ring-primary-200",
    secondary:
      "bg-secondary-500 text-white hover:bg-secondary-600 focus-visible:ring-secondary-500",
    outline:
      "border border-gray-200 bg-transparent hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 focus-visible:ring-gray-500",
    ghost:
      "bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 focus-visible:ring-gray-500",
    danger:
      "bg-error-50 text-error-600 hover:bg-error-100 focus-visible:ring-error-500 dark:bg-error-900/10 dark:text-error-400 dark:hover:bg-error-900/20",
    success:
      "bg-success-50 text-success-600 hover:bg-success-100 focus-visible:ring-success-500 dark:bg-success-900/10 dark:text-success-400 dark:hover:bg-success-900/20",
    purple:
      "bg-purple-100 text-purple-600 hover:bg-purple-500 hover:text-purple-100 focus-visible:ring-purple-500 dark:bg-purple-900/10 dark:text-purple-400 dark:hover:bg-purple-900/20",
  };

  const sizeStyles = {
    xs: "h-6 w-6",
    sm: "h-7 w-7",
    md: "h-8 w-8",
    lg: "h-9 w-9",
  };

  const iconSizeStyles = {
    xs: "h-3.5 w-3.5",
    sm: "h-4 w-4",
    md: "h-4.5 w-4.5",
    lg: "h-5 w-5",
  };

  const button = (
    <button
      className={clsx(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        "flex items-center justify-center",
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin h-3.5 w-3.5 text-current"
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
      ) : (
        <div
          className={clsx(
            iconSizeStyles[size],
            "flex items-center justify-center"
          )}
        >
          {icon}
        </div>
      )}
    </button>
  );

  if (tooltip) {
    return (
      <Tooltip title={tooltip} placement={tooltipPlacement} arrow>
        {button}
      </Tooltip>
    );
  }

  return button;
};

export default IconButton;
