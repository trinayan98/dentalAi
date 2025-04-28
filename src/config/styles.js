export const styles = {
  form: {
    label: {
      base: "block font-medium mb-1",
      colors: {
        default: "text-[#374151] dark:text-gray-300",
        error: "text-red-500 dark:text-red-400",
      },
      sizes: {
        xs: "text-xs",
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg",
      },
    },
    input: {
      base: "block w-full rounded-lg border focus:outline-none focus:ring-2 transition-colors duration-200",
      sizes: {
        xs: "text-xs py-1.5 px-2",
        sm: "text-sm py-2 px-3",
        md: "text-base py-2 px-4",
        lg: "text-lg py-2.5 px-4",
      },
      colors: {
        default: {
          bg: "bg-white dark:bg-gray-800",
          border: "border-gray-300 dark:border-gray-600",
          text: "text-gray-900 dark:text-white",
          placeholder: "placeholder-gray-400 dark:placeholder-gray-500",
          focus: "focus:border-primary-500 focus:ring-primary-500/20",
          hover: "hover:border-gray-400 dark:hover:border-gray-500",
        },
        error: {
          bg: "bg-red-50 dark:bg-red-900/10",
          border: "border-red-300 dark:border-red-800",
          text: "text-red-900 dark:text-red-200",
          placeholder: "placeholder-red-300 dark:placeholder-red-500",
          focus: "focus:border-red-500 focus:ring-red-500/20",
          hover: "hover:border-red-400 dark:hover:border-red-700",
        },
      },
    },
  },
};
