"use client";

import React from "react";
import { motion, Variants } from "framer-motion";

interface AuthPageTransitionProps {
  children: React.ReactNode;
}

const slideVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 15 } }
};

/**
 * AuthPageTransition
 * 
 * Reusable Framer Motion component. Animates onboarding step content entries.
 */
export function AuthPageTransition({ children }: AuthPageTransitionProps) {
  return (
    <motion.div
      variants={slideVariants}
      initial="hidden"
      animate="show"
      className="w-full"
    >
      {children}
    </motion.div>
  );
}
