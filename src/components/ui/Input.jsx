import React, { forwardRef } from "react";
import { clsx } from "clsx";

export const Input = forwardRef(
  ({ label, error, type = "text", leftIcon, className, ...props }, ref) => {
    const id = label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div>
        {label && (
          <label
            htmlFor={id}
            className="block text-s font-bold text-gray-700 dark:text-gray-300 mb-1"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={id}
            type={type}
            className={clsx(
              "w-full text-s px-2 pt-2 pb-2 py-1.5 rounded-md border-2",
              "bg-white dark:bg-gray-800 text-[#6B7280] dark:text-gray-300",
              "focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500",
              leftIcon && "pl-10",
              error
                ? "border-red-300 dark:border-red-500"
                : "border-gray-300 dark:border-gray-600",
              className
            )}
            {...props}
          />
        </div>

        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
