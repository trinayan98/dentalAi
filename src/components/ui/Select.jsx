import React from "react";
import { cn } from "../../utils/cn";

const Select = React.forwardRef(
  (
    { className, children, onValueChange, value, placeholder, ...props },
    ref
  ) => {
    return (
      <select
        className={cn(
          "block w-full rounded-md border-gray-300 dark:border-gray-600 text-sm dark:bg-gray-800 dark:text-gray-300 focus:border-primary-500 focus:ring-primary-500",
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
    );
  }
);

Select.displayName = "Select";

export { Select };
