'use client'

import Link from "next/link";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { motion } from "framer-motion";
import { fadeInDown, buttonHover, staggerContainer, staggerItem } from "@/lib/motion";
import { Logo } from "@/components/Logo";

export default function MarketingNavbar() {
  return (
    <motion.nav 
      className="sticky top-0 z-20 bg-[color:var(--surface)]/90 backdrop-blur border-b" 
      style={{ borderColor: "var(--border)" }}
      variants={fadeInDown}
      initial="initial"
      animate="animate"
    >
      <motion.div 
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <motion.div variants={staggerItem}>
          <Link href="/" className="inline-flex items-center">
            <Logo className="h-6" variant="dark" />
          </Link>
        </motion.div>
        
        <motion.div 
          className="hidden md:flex items-center gap-6 text-sm"
          variants={staggerItem}
        >
          <motion.a 
            className="opacity-80 hover:opacity-100 transition-opacity" 
            href="#features"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
          >
            Features
          </motion.a>
          <motion.a 
            className="opacity-80 hover:opacity-100 transition-opacity" 
            href="#security"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
          >
            Security
          </motion.a>
          <motion.a 
            className="opacity-80 hover:opacity-100 transition-opacity" 
            href="#faqs"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
          >
            FAQs
          </motion.a>
        </motion.div>
        
        <motion.div 
          className="flex items-center gap-2"
          variants={staggerItem}
        >
          <ThemeToggle variant="icon" />
          <motion.div
            variants={buttonHover}
            whileHover="hover"
            whileTap="tap"
          >
            <Link href="/sign-in" className="px-3 py-2 text-sm hover:text-[color:var(--accent)] transition-colors">
              Sign in
            </Link>
          </motion.div>
          <motion.div
            variants={buttonHover}
            whileHover="hover"
            whileTap="tap"
          >
            <Link 
              href="/sign-up" 
              className="rounded-md bg-black text-white dark:bg-white dark:text-black px-3 py-2 text-sm hover:shadow-lg transition-shadow"
            >
              Create free account
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.nav>
  );
}
