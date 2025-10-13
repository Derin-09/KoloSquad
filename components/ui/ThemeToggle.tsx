'use client'

import { useTheme } from '@/components/providers/ThemeProvider'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { buttonHover, easing } from '@/lib/motion'

const SunIcon = ({ className = '' }: { className?: string }) => (
  <motion.svg 
    className={className} 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth="1.5" 
    stroke="currentColor"
    animate={{
      rotate: [0, 360],
      transition: { duration: 20, repeat: Infinity, ease: 'linear' }
    }}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" 
    />
  </motion.svg>
)

const MoonIcon = ({ className = '' }: { className?: string }) => (
  <motion.svg 
    className={className} 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth="1.5" 
    stroke="currentColor"
    animate={{
      rotate: [0, -5, 5, 0],
      transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
    }}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" 
    />
  </motion.svg>
)

const SystemIcon = ({ className = '' }: { className?: string }) => (
  <motion.svg 
    className={className} 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth="1.5" 
    stroke="currentColor"
    animate={{
      scale: [1, 1.05, 1],
      transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
    }}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" 
    />
  </motion.svg>
)

interface ThemeToggleProps {
  variant?: 'icon' | 'dropdown'
  className?: string
}

export function ThemeToggle({ variant = 'icon', className = '' }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className={`w-6 h-6 ${className}`} />
  }

  if (variant === 'dropdown') {
    return (
      <div className="relative group">
        <motion.button
          className={`md:p-2 rounded-md hover:bg-[color:var(--muted)] transition-colors duration-200 flex items-center gap-2 ${className}`}
          title="Toggle theme"
          variants={buttonHover}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={theme}
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ duration: 0.3 }}
            >
              {theme === 'light' && <SunIcon className="w-4 h-4" />}
              {theme === 'dark' && <MoonIcon className="w-4 h-4" />}
              {theme === 'system' && <SystemIcon className="w-4 h-4" />}
            </motion.div>
          </AnimatePresence>
          <span className="text-sm capitalize">{theme}</span>
        </motion.button>
        
        <motion.div 
          className="absolute right-0 top-full mt-2 w-32 py-1 bg-[color:var(--surface)] border border-[color:var(--border)] rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50"
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.2, ease: easing.easeOut }}
        >
          <motion.button
            onClick={() => setTheme('light')}
            className={`w-full px-3 md:py-2 text-left text-sm hover:bg-[color:var(--muted)] flex items-center gap-2 transition-colors ${theme === 'light' ? 'text-[color:var(--accent)]' : ''}`}
            whileHover={{ x: 4 }}
            transition={{ duration: 0.2 }}
          >
            <SunIcon className="w-4 h-4" />
            Light
          </motion.button>
          <motion.button
            onClick={() => setTheme('dark')}
            className={`w-full px-3 py-2 text-left text-sm hover:bg-[color:var(--muted)] flex items-center gap-2 transition-colors ${theme === 'dark' ? 'text-[color:var(--accent)]' : ''}`}
            whileHover={{ x: 4 }}
            transition={{ duration: 0.2 }}
          >
            <MoonIcon className="w-4 h-4" />
            Dark
          </motion.button>
          <motion.button
            onClick={() => setTheme('system')}
            className={`w-full px-3 py-2 text-left text-sm hover:bg-[color:var(--muted)] flex items-center gap-2 transition-colors ${theme === 'system' ? 'text-[color:var(--accent)]' : ''}`}
            whileHover={{ x: 4 }}
            transition={{ duration: 0.2 }}
          >
            <SystemIcon className="w-4 h-4" />
            System
          </motion.button>
        </motion.div>
      </div>
    )
  }

  // Simple icon toggle: cycles through light -> dark -> system
  const cycleTheme = () => {
    const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system']
    const currentIndex = themes.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }

  return (
    <motion.button
      onClick={cycleTheme}
      className={`md:p-2 rounded-md hover:bg-[color:var(--muted)] transition-colors duration-200 flex items-center justify-center ${className}`}
      title={`Current theme: ${theme}. Click to cycle themes.`}
      variants={buttonHover}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={theme}
          initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 90, scale: 0.8 }}
          transition={{ duration: 0.4, ease: easing.easeOut }}
        >
          {theme === 'light' && <SunIcon className="w-5 h-5" />}
          {theme === 'dark' && <MoonIcon className="w-5 h-5" />}
          {theme === 'system' && <SystemIcon className="w-5 h-5" />}
        </motion.div>
      </AnimatePresence>
    </motion.button>
  )
}