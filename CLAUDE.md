# Q-Quest — Project Intelligence File

## Environment
- OS: Windows 11
- Project root: C:\Q-Quest  ? ONLY location
- Shell: PowerShell (Admin)
- GitHub: Akash-Kishore/q-quest
- Node: v24.14.1 | npm: 11.11.0

## Stack
- React 19 + Vite 8
- Tailwind CSS v4 (via @tailwindcss/vite)
- React Three Fiber v9 + Drei v10 + Three.js v0.183
- Math.js v15
- Apollo Client v4 + GraphQL v16
- Zustand v5
- GitHub Pages (base: /q-quest/)

## Color Tokens
- quantum-teal:   #00D4FF
- quantum-purple: #7C3AED
- quantum-cyan:   #06B6D4
- Background:     #0A0A0F
- Surface:        rgba(255,255,255,0.04)

## Architecture
src/
+-- components/   ? UI only. No logic. No math imports.
+-- engine/       ? Pure math/quantum. No React imports.
+-- hooks/        ? Bridge: engine to UI state only.
+-- api/          ? GraphQL queries + Apollo setup only.
+-- store/        ? Zustand global state only.
+-- constants/    ? Gate matrices, config only.

## Non-Negotiables
- Gate matrices must be mathematically verified (U†U = I)
- Complex numbers: { re: number, im: number } only
- Bloch Sphere: 60fps, no allocation inside useFrame
- No component exceeds 200 lines
- All engine/ functions pure, no side effects
- Undo = replay from |0?, never matrix inversion

## Current Phase
Phase 1 — MVP (In Progress)
