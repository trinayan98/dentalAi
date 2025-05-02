import React from "react";
import { clsx } from "clsx";

export function Table({ children, className, ...props }) {
  return (
    <div className="overflow-x-auto">
      <table
        className={clsx(
          "min-w-full divide-y divide-gray-200 dark:divide-gray-700",
          className
        )}
        {...props}
      >
        {children}
      </table>
    </div>
  );
}

Table.displayName = "Table";

export function Thead({ children, className, ...props }) {
  return (
    <thead
      className={clsx("bg-gray-50 dark:bg-gray-800", className)}
      {...props}
    >
      {children}
    </thead>
  );
}

Thead.displayName = "Thead";

export function Tbody({ children, className, ...props }) {
  return (
    <tbody
      className={clsx(
        "divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900",
        className
      )}
      {...props}
    >
      {children}
    </tbody>
  );
}

Tbody.displayName = "Tbody";

export function Tr({ children, className, ...props }) {
  return (
    <tr
      className={clsx(
        "hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors",
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

Tr.displayName = "Tr";

export function Th({ children, className, ...props }) {
  return (
    <th
      className={clsx(
        "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider",
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
}

Th.displayName = "Th";

export function Td({ children, className, ...props }) {
  return (
    <td
      className={clsx(
        "px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300",
        className
      )}
      {...props}
    >
      {children}
    </td>
  );
}

Td.displayName = "Td";
