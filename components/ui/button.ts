import { cx } from "@/lib/cx";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "white";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-brand-600 text-white shadow-lift hover:bg-brand-700 active:bg-brand-800",
  secondary: "border border-brand-200 bg-white text-brand-700 hover:border-brand-300 hover:bg-brand-50",
  ghost: "text-brand-700 hover:bg-brand-50",
  white: "bg-white text-brand-700 hover:bg-brand-50",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-[15px]",
  lg: "h-12 px-6 text-base sm:h-14 sm:px-7",
};

export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md", extra?: string): string {
  return cx(base, variants[variant], sizes[size], extra);
}
