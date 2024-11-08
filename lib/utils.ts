import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (
  val: string | number | undefined,
  decimals: "auto" | number = "auto",
  currency?: string
): string => {
  if (val === undefined || val === null) return "";

  const num = typeof val === "string" ? parseFloat(val) : val;

  if (decimals === "auto") {
    if (num >= 1000000) {
      decimals = 0;
    } else if (num >= 1) {
      decimals = 2;
    } else if (num >= 0.01) {
      decimals = 4;
    } else if (num >= 0.0001) {
      decimals = 6;
    } else {
      decimals = 8;
    }
  }

  const parts = (
    decimals !== undefined ? num?.toFixed(decimals) : num?.toString()
  ).split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return (currency || "") + parts.join(".");
};

export const saveToLocalStorage = <T>(key: string, data: T): void => {
  try {
    const serializedData = JSON.stringify(data);
    localStorage.setItem(key, serializedData);
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
};

export const loadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const serializedData = localStorage.getItem(key);
    if (serializedData === null) {
      return defaultValue;
    }
    return JSON.parse(serializedData) as T;
  } catch (error) {
    console.error("Error loading from localStorage:", error);
    return defaultValue;
  }
};
