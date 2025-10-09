"use client";

import React from "react";

type LogoVariant = "auto" | "light" | "dark"; // auto: theme-aware, light: black always, dark: white always

type LogoProps = {
  className?: string;
  title?: string;
  variant?: LogoVariant;
};

export function Logo({ className = "h-6", title = "KoloSquad", variant = "auto" }: LogoProps) {
  if (variant === "light") {
    // Force light version (black) in all themes
    return (
      <span className="inline-flex items-center" title={title} aria-label={title}>
        <img src="/vector/default-monochrome-black.svg" alt={title} className={`block ${className}`} />
      </span>
    );
  }

  if (variant === "dark") {
    // Force dark version (white) in all themes (useful on dark backgrounds in light mode)
    return (
      <span className="inline-flex items-center" title={title} aria-label={title}>
        <img src="/vector/default-monochrome-white.svg" alt={title} className={`block ${className}`} />
      </span>
    );
  }

  // auto (theme-aware): black in light mode, white in dark mode
  return (
    <span className="inline-flex items-center" title={title} aria-label={title}>
      <img
        src="/vector/default-monochrome-black.svg"
        alt={title}
        className={`block dark:hidden ${className}`}
      />
      <img
        src="/vector/default-monochrome-white.svg"
        alt={title}
        className={`hidden dark:block ${className}`}
      />
    </span>
  );
}
