/**
 * Standard Utility helper representing shadcn setup.
 * Safely merges Tailwind utility classes conditionally.
 */
export function cn(...inputs: any[]): string {
  return inputs
    .filter(Boolean)
    .map(x => String(x).trim())
    .join(" ");
}
