# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project: kolosquad (Next.js 15 + React 19 + TypeScript + Tailwind CSS v4)

Commands
- Dev server (hot reload):
  - npm run dev
  - Opens http://localhost:3000
- Build for production:
  - npm run build
- Start production server (after build):
  - npm run start
- Lint all files (ESLint flat config):
  - npm run lint
- Lint a specific file or directory:
  - npx eslint app/page.tsx
  - npx eslint app
- Type-check only (no emit):
  - npx tsc --noEmit
- Tests: Not configured in this repository (no test runner or scripts are present).

Architecture and structure (big picture)
- Framework: Next.js App Router (app/)
  - app/layout.tsx: Root layout applying global styles and fonts via next/font (Geist, Geist_Mono). Also sets basic Metadata (title/description).
  - app/page.tsx: Home route component. Uses Next Image, Tailwind utility classes, and static assets from public/.
  - app/globals.css: Tailwind CSS v4 entry ("@import 'tailwindcss'") with an inline @theme block for tokens, plus light/dark CSS variables.
- Styling: Tailwind CSS v4 via PostCSS
  - postcss.config.mjs uses the @tailwindcss/postcss plugin.
  - globals.css defines theme tokens (e.g., --font-geist-sans, --color-foreground) and switches them for dark mode.
- TypeScript configuration
  - tsconfig.json sets strict, noEmit, moduleResolution "bundler", and path alias:
    - @/* → project root (import from '@/app/...' etc.)
- Linting
  - eslint.config.mjs (flat config) extends "next/core-web-vitals" and "next/typescript"; ignores: node_modules, .next, out, build, next-env.d.ts.
  - Use npm run lint or npx eslint <path>.
- Next.js configuration
  - next.config.ts currently uses default options (placeholder for future Next config).
- Assets
  - public/ contains static images (e.g., next.svg, vercel.svg, globe.svg) referenced by the Home page.

Notes from README
- Start dev server with npm run dev and edit app/page.tsx to see live updates at http://localhost:3000.
- Fonts are optimized via next/font.

Conventions to rely on in this repo
- App Router (app/) is the source of truth for routing; avoid mixing with pages/.
- Use the @/* path alias for absolute imports from the repo root.
- Keep heavy, generated, or build artifacts out of lint by default (already ignored by the ESLint config).
