# Q-Quest Phase 1 - Next.js Migration

This plan outlines the steps to turn the "Q_Quest Phase 1" project from your Stitch Account into a real Next.js based website, implementing "The Celestial Void" design system and integrating the 3D visual assets from the prototype screens.

## User Review Required

> [!WARNING]
> The current `c:\Q-Quest` directory contains an existing React/Vite project. This plan will replace the existing setup with a new Next.js framework setup. **I will remove the old `package.json`, Vite configs, and re-initialize the directory as a Next.js project.** Please confirm if it's okay to overwrite the current Vite setup in `c:\Q-Quest`.

> [!IMPORTANT]
> You specified avoiding TailwindCSS unless explicitly requested. I will write the styles using **Vanilla CSS (CSS Modules)** to give you maximum flexibility and control, extracting the Tailwind classes used in the prototype into standard CSS.

## Proposed Changes

---

### Framework Initialization

I will convert the existing directory to a Next.js app:
1. Remove Vite-specific files and dependencies.
2. Initialize Next.js in the current directory (`npx -y create-next-app@latest .`).
3. Install necessary dependencies, specifically `three` for the 3D canvas and `framer-motion` for kinetic typography and animations.

#### [MODIFY] package.json
#### [NEW] next.config.mjs
#### [DELETE] vite.config.js (if exists)

---

### Global Styles & Design System

Implement the "The Celestial Void" design system using Vanilla CSS variables in the global stylesheet.

#### [MODIFY] app/globals.css
- Define CSS custom properties (variables) for the color tokens (`--color-surface: #131313`, `--color-primary: #FFFFFF`, etc.).
- Set up the "No-Line" rule, "Ghost Borders", and Glassmorphism specifications.
- Configure global typography definitions (Space Grotesk, Inter, and JetBrains Mono).
- Establish the base starfield, space-void, and nebula background layers.

#### [NEW] app/layout.js
- Set up global fonts via `next/font/google`.
- Wrap the application in the base layout.

---

### Home Page & 3D Canvas

Implement the "Modular Graph Background Update" screen as the main landing page, complete with the interactive 3D elements.

#### [NEW] app/page.js
- The main page component assembling the HUD Grid, typography, and 3D canvas.

#### [NEW] components/ThreeCanvas.js
- A React wrapper for the Three.js scene (Nucleus and orbiting electrons).
- Handles responsive resizing, mouse interaction for rotation, and animation loop.

#### [NEW] components/HudGrid.js
- Implements the modular HUD grid using CSS Grid and standard CSS classes.
- Adds the pulsating "Technical HUD" activity effect.

#### [NEW] components/KineticTypography.js
- Implements the central "Q_QUEST" title text, using the wide-tracked `Space Grotesk` font and hover interactions.

## Verification Plan

### Automated Tests
- Run `npm run build` to ensure the Next.js production build succeeds without errors.

### Manual Verification
- Start the development server with `npm run dev`.
- Visually verify that the 3D scene renders correctly, the orbital elements rotate, and the mouse movement interacts with the scene orientation.
- Confirm the modular HUD background and global typography align with "The Celestial Void" design aesthetic.
- Verify that Tailwind CSS is entirely removed and replaced with vanilla CSS styles.
