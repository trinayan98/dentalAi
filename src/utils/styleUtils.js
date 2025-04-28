import { styles } from "../config/styles";
import { clsx } from "clsx";

export function getInputStyles({ size = "md", error = false, className = "" }) {
  const colorScheme = error
    ? styles.form.input.colors.error
    : styles.form.input.colors.default;

  return clsx(
    styles.form.input.base,
    styles.form.input.sizes[size],
    colorScheme.bg,
    colorScheme.border,
    colorScheme.text,
    colorScheme.placeholder,
    colorScheme.focus,
    colorScheme.hover,
    className
  );
}

export function getLabelStyles({ size = "md", error = false, className = "" }) {
  return clsx(
    styles.form.label.base,
    styles.form.label.sizes[size],
    error ? styles.form.label.colors.error : styles.form.label.colors.default,
    className
  );
}
