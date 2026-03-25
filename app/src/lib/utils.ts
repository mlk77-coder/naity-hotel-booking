import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isPeakSeason = (dateStr: string): boolean => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const m = d.getMonth() + 1;
  const day = d.getDate();
  if (m === 6 && day >= 15) return true;
  if (m === 7 || m === 8) return true;
  if (m === 9 && day <= 15) return true;
  return false;
};
