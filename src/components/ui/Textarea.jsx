import React, { forwardRef } from "react";

import { clsx } from "clsx";
const Textarea = forwardRef(
  ({ label, error, type = "text", leftIcon, className, ...props }, ref) => {
    const id = label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div>
        {label && (
          <label
            htmlFor={id}
            className="block text-s font-bold text-gray-700 dark:text-gray-300 mb-2"
          >
            {label}
          </label>
        )}

        <textarea
          className={clsx(
            "flex min-h-[80px] w-full text-sm px-2 pt-2 pb-2 py-1.5 rounded-md border-2 border-gray-300",
            "bg-white dark:bg-gray-800 text-[#6B7280] dark:text-gray-300",
            "focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          )}
          ref={ref}
          {...props}
        />

        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };
