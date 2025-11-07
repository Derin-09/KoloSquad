'use client'

import React, {
  createContext,
  useContext,
  useLayoutEffect,
  useState,
  ReactNode,
} from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeProviderProps {
  children: ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

interface ThemeContextState {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextState>({
  theme: 'system',
  setTheme: () => {},
})

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'kolosquad-theme',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme)

  // 🚀 UseLayoutEffect applies before browser paint — prevents flicker
  useLayoutEffect(() => {
    const stored = localStorage.getItem(storageKey) as Theme | null

    const activeTheme =
      stored && ['light', 'dark', 'system'].includes(stored)
        ? stored
        : defaultTheme

    applyTheme(activeTheme)
    setThemeState(activeTheme)
  }, [defaultTheme, storageKey])

  const applyTheme = (t: Theme) => {
    const root = document.documentElement
    root.classList.remove('light', 'dark')

    let applied: 'light' | 'dark'

    if (t === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      applied = prefersDark ? 'dark' : 'light'
    } else {
      applied = t
    }

    root.classList.add(applied)
    root.setAttribute('data-theme', applied)
  }

  const setTheme = (t: Theme) => {
    localStorage.setItem(storageKey, t)
    setThemeState(t)
    applyTheme(t)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider')
  return ctx
}












// 'use client'

// import React, { createContext, useContext, useEffect, useState } from 'react'

// type Theme = 'light' | 'dark' | 'system'

// type ThemeProviderProps = {
//   children: React.ReactNode
//   defaultTheme?: Theme
//   storageKey?: string
// }

// type ThemeProviderState = {
//   theme: Theme
//   setTheme: (theme: Theme) => void
// }

// const initialState: ThemeProviderState = {
//   theme: 'system',
//   setTheme: () => null,
// }

// const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

// export function ThemeProvider({
//   children,
//   defaultTheme = 'system',
//   storageKey = 'kolosquad-theme',
//   ...props
// }: ThemeProviderProps) {
//   const [theme, setTheme] = useState<Theme>(defaultTheme)

//   useEffect(() => {
//     // Get theme from localStorage on mount
//     const storedTheme = localStorage.getItem(storageKey) as Theme
//     if (storedTheme && ['light', 'dark', 'system'].includes(storedTheme)) {
//       setTheme(storedTheme)
//     }
//   }, [storageKey])

//   useEffect(() => {
//     const root = window.document.documentElement

//     root.classList.remove('light', 'dark')

//     if (theme === 'system') {
//       const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
//         .matches
//         ? 'dark'
//         : 'light'

//       root.classList.add(systemTheme)
//       root.setAttribute('data-theme', systemTheme)
//       return
//     }

//     root.classList.add(theme)
//     root.setAttribute('data-theme', theme)
//   }, [theme])

//   const value = {
//     theme,
//     setTheme: (theme: Theme) => {
//       localStorage.setItem(storageKey, theme)
//       setTheme(theme)
//     },
//   }

//   return (
//     <ThemeProviderContext.Provider {...props} value={value}>
//       {children}
//     </ThemeProviderContext.Provider>
//   )
// }

// export const useTheme = () => {
//   const context = useContext(ThemeProviderContext)

//   if (context === undefined)
//     throw new Error('useTheme must be used within a ThemeProvider')

//   return context
// }