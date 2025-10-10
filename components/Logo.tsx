"use client";

import React from "react";

type LogoVariant = "auto" | "light" | "dark"; // auto: theme-aware via CSS, light: black always, dark: white always

type LogoProps = {
  className?: string;
  title?: string;
  variant?: LogoVariant;
};

export function Logo({ className = "h-6", title = "KoloSquad", variant = "auto" }: LogoProps) {
  if (variant === "light") {
    return (
      <span className="inline-flex items-center" title={title} aria-label={title}>
        <img src="/vector/default-monochrome-black.svg" alt={title} className={`block ${className}`} />
      </span>
    );
  }

  if (variant === "dark") {
    return (
      <span className="inline-flex items-center" title={title} aria-label={title}>
        <img src="/vector/default-monochrome-white.svg" alt={title} className={`block ${className}`} />
      </span>
    );
  }

  // auto: render both, hide/show via .dark class on <html>, avoids hydration mismatch
  return (
    <span className="inline-flex items-center" title={title} aria-label={title} suppressHydrationWarning>
      <img src="/vector/default-monochrome-black.svg" alt={title} className={`logo--light ${className}`} aria-hidden="true" />
      <img src="/vector/default-monochrome-white.svg" alt={title} className={`logo--dark ${className}`} aria-hidden="true" />
    </span>
  );
}
