import React from "react";
import { cn } from "../../lib/utils";
import { clsx } from "clsx";
const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={clsx(
        "flex min-h-[80px] w-full text-xxs px-2 pt-2 pb-2 py-1.5 rounded-md border",
        "bg-white dark:bg-gray-800 text-[#6B7280] dark:text-gray-300",
        "focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500",
        "pl-10"
      )}
      ref={ref}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";

export { Textarea };
