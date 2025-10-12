"use client"
import Link from "next/link";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden bg-[color:var(--background)] text-[color:var(--foreground)]">
      <motion.h1
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-8xl font-bold text-[color:var(--accent-foreground)]"
      >
        404
      </motion.h1>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex gap-2 mt-2 mb-6 text-[color:var(--muted-foreground)]"
      >
        <p>Page not found.</p>
      <Link
        href="/dashboard"
        className=" rounded-md bg-[color:var(--accent-bg)] text-[color:var(--accent-foreground)] hover:scale-105 transition"
      >
        Back to dashboard
      </Link>
      </motion.div>
      <motion.div
        className="absolute w-40 h-40 rounded-full bg-[color:var(--accent-bg)] blur-3xl opacity-20"
        animate={{
          y: [0, -30, 0],
          x: [0, 30, 0],
        }}
        transition={{ repeat: Infinity, duration: 6 }}
      />
    </div>
  );
}
