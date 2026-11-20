import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utilidad estándar para combinar y resolver conflictos de clases Tailwind.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
