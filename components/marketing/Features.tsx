'use client'

import { Card } from "@/components/ui/Card";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";

export default function Features() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="features" className="py-12 sm:py-16" ref={ref}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          className="text-center mb-8"
        >
          <h2 className="text-2xl sm:text-3xl font-semibold">Many ways to build your savings</h2>
          <p className="opacity-80 mt-2">Choose a plan that fits your squad and timeline.</p>
        </motion.div>
        
        <motion.div 
          className="grid md:grid-cols-3 gap-4 mt-8"
          variants={staggerContainer}
          initial="initial"
          animate={isInView ? "animate" : "initial"}
        >
          <motion.div variants={staggerItem}>
            <Card>
              <motion.div 
                className="text-sm opacity-70"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 0.7 } : { opacity: 0 }}
                transition={{ delay: 0.3 }}
              >
                Automated Savings
              </motion.div>
              <motion.div 
                className="text-lg font-semibold mt-1"
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={{ delay: 0.4 }}
              >
                Set it and forget it
              </motion.div>
              <motion.p 
                className="text-sm opacity-80 mt-2"
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 0.8, y: 0 } : { opacity: 0, y: 10 }}
                transition={{ delay: 0.5 }}
              >
                Auto‑debit contributions on schedule for stress‑free savings.
              </motion.p>
            </Card>
          </motion.div>
          
          <motion.div variants={staggerItem}>
            <Card>
              <motion.div 
                className="text-sm opacity-70"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 0.7 } : { opacity: 0 }}
                transition={{ delay: 0.5 }}
              >
                Goal‑oriented Savings
              </motion.div>
              <motion.div 
                className="text-lg font-semibold mt-1"
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={{ delay: 0.6 }}
              >
                Hit targets faster
              </motion.div>
              <motion.p 
                className="text-sm opacity-80 mt-2"
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 0.8, y: 0 } : { opacity: 0, y: 10 }}
                transition={{ delay: 0.7 }}
              >
                Track squad progress with milestones and a clear progress bar.
              </motion.p>
            </Card>
          </motion.div>
          
          <motion.div variants={staggerItem}>
            <Card>
              <motion.div 
                className="text-sm opacity-70"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 0.7 } : { opacity: 0 }}
                transition={{ delay: 0.7 }}
              >
                Group Savings
              </motion.div>
              <motion.div 
                className="text-lg font-semibold mt-1"
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={{ delay: 0.8 }}
              >
                Save together
              </motion.div>
              <motion.p 
                className="text-sm opacity-80 mt-2"
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 0.8, y: 0 } : { opacity: 0, y: 10 }}
                transition={{ delay: 0.9 }}
              >
                Invite friends with a code and contribute securely to the pot.
              </motion.p>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
