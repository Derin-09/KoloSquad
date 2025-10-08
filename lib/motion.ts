import { Variants } from 'framer-motion'

// Common easing curves
export const easing = {
  easeInOut: [0.4, 0, 0.2, 1],
  easeOut: [0, 0, 0.2, 1],
  easeIn: [0.4, 0, 1, 1],
  spring: { type: 'spring', stiffness: 400, damping: 30 },
  springMedium: { type: 'spring', stiffness: 300, damping: 25 },
  springSlow: { type: 'spring', stiffness: 200, damping: 20 }
} as const

// Page transition variants
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: easing.easeOut,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: easing.easeIn,
    },
  },
}

// Stagger container variants
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

// Stagger item variants
export const staggerItem: Variants = {
  initial: {
    opacity: 0,
    y: 30,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: easing.easeOut,
    },
  },
}

// Card hover variants
export const cardHover: Variants = {
  initial: { scale: 1, y: 0 },
  hover: {
    scale: 1.03,
    y: -5,
    transition: easing.springMedium,
  },
}

// Button hover variants
export const buttonHover: Variants = {
  initial: { scale: 1 },
  hover: { 
    scale: 1.05,
    transition: easing.springMedium,
  },
  tap: { 
    scale: 0.95,
    transition: { duration: 0.1 },
  },
}

// Icon rotation variants
export const iconSpin: Variants = {
  initial: { rotate: 0 },
  animate: { 
    rotate: 360,
    transition: { 
      duration: 0.3,
      ease: easing.easeInOut,
    },
  },
}

// Fade in from direction variants
export const fadeInUp: Variants = {
  initial: {
    opacity: 0,
    y: 60,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: easing.easeOut,
    },
  },
}

export const fadeInDown: Variants = {
  initial: {
    opacity: 0,
    y: -60,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: easing.easeOut,
    },
  },
}

export const fadeInLeft: Variants = {
  initial: {
    opacity: 0,
    x: -60,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      ease: easing.easeOut,
    },
  },
}

export const fadeInRight: Variants = {
  initial: {
    opacity: 0,
    x: 60,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      ease: easing.easeOut,
    },
  },
}

// Scale animations
export const scaleIn: Variants = {
  initial: {
    opacity: 0,
    scale: 0.8,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: easing.easeOut,
    },
  },
}

// Float animation for hero elements
export const float: Variants = {
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

// Pulse animation
export const pulse: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

// Theme transition variants
export const themeTransition: Variants = {
  initial: { rotate: 0, scale: 1 },
  animate: { 
    rotate: [0, 180, 360],
    scale: [1, 1.1, 1],
    transition: { 
      duration: 0.6,
      ease: easing.easeInOut,
    },
  },
}