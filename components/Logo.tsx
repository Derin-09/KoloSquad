"use client";

import React from "react";

type LogoProps = {
  className?: string;
  title?: string;
};

export function Logo({ className = "h-6", title = "KoloSquad" }: LogoProps) {
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
