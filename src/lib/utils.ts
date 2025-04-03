import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class values into a single className string
 * using clsx and tailwind-merge to handle conditional classes and conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date to a standard string format
 */
export function formatDate(date: string | Date): string {
  if (!date) return "";

  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/**
 * Debounce function to limit how often a function can be called
 */
// TODO: TO IMPLEMENT
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
