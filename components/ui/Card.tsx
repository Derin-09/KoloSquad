'use client'

import { clsx } from "clsx";
import type { PropsWithChildren } from "react";
import { motion } from "framer-motion";
import { cardHover, fadeInUp } from "@/lib/motion";

interface CardProps {
  className?: string;
  animated?: boolean;
  hoverable?: boolean;
}

export function Card({ 
  className, 
  children, 
  animated = true, 
  hoverable = true 
}: PropsWithChildren<CardProps>) {
  if (!animated) {
    return <div className={clsx("card p-4 sm:p-5", className)}>{children}</div>;
  }

  return (
    <motion.div 
      className={clsx("card p-4 sm:p-5", className)}
      variants={hoverable ? cardHover : fadeInUp}
      initial="initial"
      animate="animate"
      whileHover={hoverable ? "hover" : undefined}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
