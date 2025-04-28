import React from "react";
import { clsx } from "clsx";

export const Card = ({
  className,
  children,
  hoverable = false,
  interactive = false,
}) => {
  return (
    <div
      className={clsx(
        "bg-white dark:bg-gray-800 rounded-md border-none shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05),0px_0px_0px_0px_rgba(0,0,0,0.00),0px_0px_0px_0px_rgba(0,0,0,0.00)]",
        hoverable && "transition-shadow hover:shadow-sm",
        interactive &&
          "cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-750",
        className
      )}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ className, children }) => {
  return <div className={clsx("px-4 py-4", className)}>{children}</div>;
};

export const CardTitle = ({ className, children }) => {
  return (
    <h3
      className={clsx(
        "text-lg font-bold text-gray-900 dark:text-white",
        className
      )}
    >
      {children}
    </h3>
  );
};

export const CardDescription = ({ className, children }) => {
  return (
    <p
      className={clsx(
        "text-xs text-gray-500 dark:text-gray-400 mt-1",
        className
      )}
    >
      {children}
    </p>
  );
};

export const CardContent = ({ className, children }) => {
  return <div className={clsx("px-4 py-4", className)}>{children}</div>;
};

export const CardFooter = ({ className, children }) => {
  return (
    <div
      className={clsx(
        "px-4 py-3 bg-gray-50 dark:bg-gray-850 border-t border-gray-100 dark:border-gray-700 rounded-b-lg",
        className
      )}
    >
      {children}
    </div>
  );
};
