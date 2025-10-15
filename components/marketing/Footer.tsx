'use client'

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import Link from "next/link";
import Image from "next/image";
import { Logo } from "../Logo";

export default function MarketingFooter() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.footer 
      className="border-t mt-16" 
      style={{ borderColor: "var(--border)" }}
      ref={ref}
      variants={fadeInUp}
      initial="initial"
      animate={isInView ? "animate" : "initial"}
    >
      <motion.div 
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm"
        variants={staggerContainer}
        initial="initial"
        animate={isInView ? "animate" : "initial"}
      >
        <motion.div variants={staggerItem}>
          <div className="mb-2">
            <Link href="/"><span className="inline-flex items-center">
              {/* <Image src="/vector/default-monochrome-black.svg" className="logo--light h-6" alt="KoloSquad" />
              <Image src="/vector/default-monochrome-white.svg" className="logo--dark h-6" alt="KoloSquad" /> */}
              <Logo />
              </span></Link></div>
          <p className="opacity-80">Save together. Flex together.</p>
        </motion.div>
        
        <motion.div variants={staggerItem}>
          <div className="font-semibold mb-2">Product</div>
          <ul className="space-y-1 opacity-80">
            <li>
              <motion.a 
                href="#features"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                Features
              </motion.a>
            </li>
            <li>
              <motion.a 
                href="#security"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                Security
              </motion.a>
            </li>
            <li>
              <motion.a 
                href="#faqs"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                FAQs
              </motion.a>
            </li>
          </ul>
        </motion.div>
        
        <motion.div variants={staggerItem}>
          <div className="font-semibold mb-2">Company</div>
          <ul className="space-y-1 opacity-80">
            <li>
              <motion.a 
                href="#"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                About
              </motion.a>
            </li>
            <li>
              <motion.a 
                href="#"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                Careers
              </motion.a>
            </li>
            <li>
              <motion.a 
                href="#"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                Contact
              </motion.a>
            </li>
          </ul>
        </motion.div>
        
        <motion.div variants={staggerItem}>
          <div className="font-semibold mb-2">Legal</div>
          <ul className="space-y-1 opacity-80">
            <li>
              <motion.a 
                href="#"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                Terms
              </motion.a>
            </li>
            <li>
              <motion.a 
                href="#"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                Privacy
              </motion.a>
            </li>
            <li>
              <motion.a 
                href="#"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                Security
              </motion.a>
            </li>
          </ul>
        </motion.div>
      </motion.div>
      
      <motion.div 
        className="text-xs opacity-70 text-center pb-8"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 0.7 } : { opacity: 0 }}
        transition={{ delay: 0.5 }}
      >
        © {new Date().getFullYear()} KoloSquad
      </motion.div>
    </motion.footer>
  );
}
