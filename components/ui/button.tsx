"use client";

import { forwardRef } from "react";

type Variant = "primary" | "outline" | "text" | "danger";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  /** Pins the button to the lower third of the viewport on a phone. FR-044. */
  thumb?: boolean;
}

/**
 * One primary action per screen (Principle I). Primary is the accent fill with a
 * white label at 8.1:1. Pressed state darkens slightly and scales. FR-053.
 */
const styles: Record<Variant, string> = {
  primary:
    "bg-[var(--accent)] text-white font-semibold hover:bg-[var(--accent-text)]",
  outline:
    "bg-[var(--surface)] text-[var(--ink)] font-medium border border-[var(--line-strong)] hover:border-[var(--ink-soft)] hover:bg-[var(--surface-2)]",
  text: "bg-transparent text-[var(--accent-text)] font-medium hover:underline",
  danger:
    "bg-transparent text-[var(--alert)] font-medium border border-[var(--alert)] hover:bg-[var(--alert-soft)]",
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "primary", thumb = false, className = "", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      {...props}
      className={[
        "min-h-[44px] px-5 rounded-[var(--r-md)] inline-flex items-center justify-center gap-2",
        "transition-[transform,background-color] duration-[var(--fast)] ease-[var(--ease)]",
        "active:scale-[0.97] disabled:opacity-50 disabled:active:scale-100",
        styles[variant],
        thumb ? "w-full" : "",
        className,
      ].join(" ")}
    />
  );
});
