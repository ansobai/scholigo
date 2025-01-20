import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines class names using `clsx` and merges them using `tailwind-merge`.
 *
 * @param {...ClassValue[]} inputs - The class values to combine and merge.
 * @returns {string} The combined and merged class names.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a given time in seconds into a human-readable string.
 *
 * @param {number} seconds - The time in seconds to format.
 * @returns {string} The formatted time string.
 */
export function formatTime(seconds: number): string {
  const days = Math.floor(seconds / (24 * 3600));
  const hours = Math.floor((seconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  let timeString = '';

  if (days > 0) timeString += `${days} day${days > 1 ? 's' : ''}${hours > 0 ? ', ': ' '}`;
  if (hours > 0) timeString += `${hours} hour${hours > 1 ? 's' : ''}${minutes > 0 ? ', ': ' '}`;
  if (minutes > 0) timeString += `${minutes} minute${minutes > 1 ? 's' : ''}${remainingSeconds > 0 ? ', ': ' '}`;
  if (remainingSeconds > 0 || timeString === '') timeString += `${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`;

  return timeString;
}