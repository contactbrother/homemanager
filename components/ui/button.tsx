"use client";

import { forwardRef } from "react";

type Variant = "primary" | "outline" | "text" | "danger";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  /** Pins the button to the lower third of the viewport on a phone. FR-044. */
  thumb?: boolean;
}

/**
 * One primary action per screen (Principle I). Primary is gold fill with an --ink
 * label at 4.85:1. The pressed state is a scale change, not a darker gold, because
 * every darker gold fails AA against a white or ink label. FR-053.
 */
const styles: Record<Variant, string> = {
  primary: "bg-[var(--gold)] text-[var(--ink)] font-semibold",
  outline: "bg-transparent text-[var(--ink)] border border-[var(--line)]",
  text: "bg-transparent text-[var(--gold-text)] font-medium",
  danger: "bg-transparent text-[var(--alert)] border border-[var(--alert)]",
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
        "transition-transform duration-[var(--fast)] ease-[var(--ease)]",
        "active:scale-[0.97] disabled:opacity-50 disabled:active:scale-100",
        styles[variant],
        thumb ? "w-full" : "",
        className,
      ].join(" ")}
    />
  );
});
