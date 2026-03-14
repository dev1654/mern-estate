import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price, type = "sale") {
  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
  return type === "rent" ? `${formatted}/mo` : formatted;
}

export function formatNumber(num) {
  if (num >= 10000000) return (num / 10000000).toFixed(1) + " Cr";
  if (num >= 100000) return (num / 100000).toFixed(1) + " L";
  return new Intl.NumberFormat("en-IN").format(num);
}

export function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export const PROPERTY_TYPES = [
  { value: "all", label: "All Types" },
  { value: "house", label: "House" },
  { value: "apartment", label: "Apartment" },
  { value: "condo", label: "Condo" },
  { value: "townhouse", label: "Townhouse" },
  { value: "villa", label: "Villa" },
  { value: "studio", label: "Studio" },
  { value: "commercial", label: "Commercial" },
  { value: "land", label: "Land" },
];
