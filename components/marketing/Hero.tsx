'use client'

import React from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

// Inline simple motion variants to avoid external dependency issues
const fadeInRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.6 } },
};
const staggerContainer = {
  initial: {},
  animate: { transition: { staggerChildren: 0.08 } },
};
const staggerItem = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};
const buttonHover = {
  hover: { y: -2 },
  tap: { scale: 0.98 },
};
const float = {
  animate: { y: [0, -10, 0], transition: { duration: 6, repeat: Infinity } },
};
const pulse = {
  animate: { scale: [1, 1.02, 1], transition: { duration: 3, repeat: Infinity } },
};

export default function Hero() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative overflow-hidden" ref={ref}>
      {/* Animated background blobs */}
      <div className="absolute -z-10 inset-0">
        <motion.div 
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-40 bg-[color:var(--accent)]" 
          variants={float}
          animate={isInView ? "animate" : "initial"}
        />
        <motion.div 
          className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full blur-3xl opacity-30 bg-[color:var(--accent)]" 
          variants={float}
          animate={isInView ? "animate" : "initial"}
          style={{ animationDelay: "3s" }}
        />
      </div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-center">
        <motion.div 
          className="space-y-4 sm:space-y-6"
          variants={staggerContainer}
          initial="initial"
          animate={isInView ? "animate" : "initial"}
        >
          <motion.div 
            className="inline-flex items-center gap-2 badge-soft"
            variants={staggerItem}
          >
            New: Group saving made social
          </motion.div>
          
          <motion.h1 
            className="text-3xl sm:text-5xl font-bold leading-tight"
            variants={staggerItem}
          >
            The smarter way to save with your squad
          </motion.h1>
          
          <motion.p 
            className="text-lg opacity-80"
            variants={staggerItem}
          >
            KoloSquad helps you save together with friends using squads, reminders and milestones. Build consistency, hit goals faster, and flex your wins.
          </motion.p>
          
          <motion.div 
            className="flex flex-wrap gap-3"
            variants={staggerItem}
          >
            <motion.a 
              href="#features" 
              className="rounded-md bg-black text-white dark:bg-white dark:text-black px-4 py-3 text-sm hover:shadow-lg transition-shadow"
              variants={buttonHover}
              whileHover="hover"
              whileTap="tap"
            >
              Start saving now
            </motion.a>
            <motion.a 
              href="/sign-in" 
              className="rounded-md px-4 py-3 text-sm border hover:bg-[color:var(--muted)] transition-colors" 
              style={{ borderColor: 'var(--border)' }}
              variants={buttonHover}
              whileHover="hover"
              whileTap="tap"
            >
              Sign in
            </motion.a>
          </motion.div>
          
          <motion.div 
            className="text-xs opacity-70"
            variants={staggerItem}
          >
            Your data is protected with modern security. No hidden fees.
          </motion.div>
        </motion.div>
        
        <motion.div
          variants={fadeInRight}
          initial="initial"
          animate={isInView ? "animate" : "initial"}
        >
          <motion.div 
            className="card p-4 sm:p-6 aspect-video sm:aspect-[4/3] rounded-2xl grid place-items-center"
            variants={pulse}
            animate={isInView ? "animate" : "initial"}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center">
              <motion.div 
                className="text-sm opacity-70 mb-2"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 0.7 } : { opacity: 0 }}
                transition={{ delay: 0.5 }}
              >
                Savings made smarter
              </motion.div>
              <motion.div 
                className="text-xl sm:text-2xl font-semibold"
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={{ delay: 0.7 }}
              >
                Squad progress • 68%
              </motion.div>
              <div className="mt-4 h-2 w-56 sm:w-72 bg-black/10 dark:bg-white/10 rounded overflow-hidden">
                <motion.div 
                  className="h-2 bg-[color:var(--accent)] rounded" 
                  initial={{ width: 0 }}
                  animate={isInView ? { width: '68%' } : { width: 0 }}
                  transition={{ delay: 1, duration: 1.5, ease: "easeOut" }}
                />
              </div>
            </div>
          </motion.div>
          <div className="mt-6">
            <div className="relative w-full h-48 sm:h-64 rounded-xl overflow-hidden">
              <Image src="/image/medium-shot-student-with-smartphone.jpg" alt="Saving is better together" fill className="object-cover" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
