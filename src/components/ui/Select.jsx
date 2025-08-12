import React from "react";
import { cn } from "../../utils/cn";
import { clsx } from "clsx";
const Select = React.forwardRef(
  (
    {
      label,
      error,
      className,
      children,
      onValueChange,
      value,
      placeholder,
      ...props
    },
    ref
  ) => {
    const id = label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div>
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2"
          >
            {label}
          </label>
        )}
        <select
          className={clsx(
            "w-full text-s px-2 pt-2 pb-2 py-1.5 rounded-md border border-2",
            "bg-white dark:bg-gray-800 text-[#6B7280] dark:text-gray-300",
            "focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500",

            error
              ? "border-red-300 dark:border-red-500"
              : "border-gray-300 dark:border-gray-600",
            className
          )}
          value={value}
          onChange={(e) => onValueChange?.(e.target.value)}
          ref={ref}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {children}
        </select>

        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";

export { Select };
