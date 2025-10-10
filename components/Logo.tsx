"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useTheme } from "@/components/providers/ThemeProvider";

type LogoVariant = "auto" | "light" | "dark"; // auto: theme-aware, light: black always, dark: white always

type LogoProps = {
  className?: string;
  title?: string;
  variant?: LogoVariant;
};

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function Logo({ className = "h-6", title = "KoloSquad", variant = "auto" }: LogoProps) {
  const { theme } = useTheme();
  const [system, setSystem] = useState<"light" | "dark">(getSystemTheme());

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => setSystem(mq.matches ? "dark" : "light");
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);

  const effective = useMemo(() => {
    if (variant === "light") return "light";
    if (variant === "dark") return "dark";
    if (theme === "system") return system;
    return theme;
  }, [variant, theme, system]);

  const src = effective === "dark" ? "/vector/default-monochrome-white.svg" : "/vector/default-monochrome-black.svg";

  return (
    <span className="inline-flex items-center" title={title} aria-label={title}>
      <img src={src} alt={title} className={`block ${className}`} />
    </span>
  );
}
