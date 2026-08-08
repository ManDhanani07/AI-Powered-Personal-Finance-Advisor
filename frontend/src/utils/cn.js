import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility for conditionally joining class names with Tailwind CSS conflict resolution.
 * @param {...any} inputs - class names, objects, or arrays
 * @returns {string} merged class string
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default cn;
