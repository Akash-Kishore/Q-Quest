---
name: Quantum Pastel
colors:
  surface: '#f8f9fc'
  surface-dim: '#d9dadd'
  surface-bright: '#f8f9fc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3f6'
  surface-container: '#edeef1'
  surface-container-high: '#e7e8eb'
  surface-container-highest: '#e1e2e5'
  on-surface: '#191c1e'
  on-surface-variant: '#494552'
  inverse-surface: '#2e3133'
  inverse-on-surface: '#f0f1f4'
  outline: '#7a7583'
  outline-variant: '#cac4d4'
  surface-tint: '#674bb5'
  primary: '#674bb5'
  on-primary: '#ffffff'
  primary-container: '#a78bfa'
  on-primary-container: '#3c1989'
  inverse-primary: '#cebdff'
  secondary: '#6c5775'
  on-secondary: '#ffffff'
  secondary-container: '#f5d9fe'
  on-secondary-container: '#735d7c'
  tertiary: '#765469'
  on-tertiary: '#ffffff'
  tertiary-container: '#b992a9'
  on-tertiary-container: '#492b3e'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e8ddff'
  primary-fixed-dim: '#cebdff'
  on-primary-fixed: '#21005e'
  on-primary-fixed-variant: '#4f319c'
  secondary-fixed: '#f5d9fe'
  secondary-fixed-dim: '#d8bde1'
  on-secondary-fixed: '#26142f'
  on-secondary-fixed-variant: '#543f5d'
  tertiary-fixed: '#ffd8ed'
  tertiary-fixed-dim: '#e5bad3'
  on-tertiary-fixed: '#2c1325'
  on-tertiary-fixed-variant: '#5c3d51'
  background: '#f8f9fc'
  on-background: '#191c1e'
  surface-variant: '#e1e2e5'
typography:
  display-lg:
    fontFamily: Space Grotesk
    fontSize: 64px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 40px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.1em
  metadata:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: -0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-padding: 24px
  gutter: 16px
  margin-safe: 32px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style

This design system embodies a "High-Tech Whimsy" aesthetic—a sophisticated blend of technical precision and soft, ethereal approachability. It is designed for premium educational platforms, creative sandboxes, and innovative SaaS products that want to feel advanced yet non-intimidating.

The style leverages **Glassmorphism** and **Corporate Modern** influences, utilizing wide-gamut pastel gradients, high-contrast "Dark Plum" interactive surfaces, and razor-sharp technical details. The emotional goal is to evoke a sense of "magical clarity"—where complex systems are rendered with tactile, inviting beauty. Key visual markers include layered depth, soft ambient glows, and a meticulous attention to typographic spacing.

## Colors

The palette is built on a foundation of "Atmospheric Pastels." The canvas uses a multi-stop gradient of blush pink, lavender, and pale blue to create depth without visual noise.

- **Primary:** A vibrant lavender-to-purple gradient reserved for call-to-action elements and key navigational states.
- **Secondary (Plum):** A deep, high-contrast #2D1B36 used for focal-point cards and dark-mode panels to provide grounding and authority.
- **Neutral:** Pure white is used for secondary content panels and layout containers to maintain a "clean room" feel.
- **Accents:** Soft pinks (#FBCFE8) and icy blues are utilized for decorative elements and subtle categorization markers.

## Typography

The typographic system creates a tension between "Expressive Math" and "Technical Utility."

- **Headings:** Space Grotesk is used with wide tracking and tight line heights to emphasize its geometric, futuristic construction. 
- **Body & Subtitles:** Inter provides a neutral, highly legible counterpoint. Use `body-lg` for introductory paragraphs to maintain the premium feel.
- **Metadata & Labels:** Technical information (e.g., "EXPERIMENTAL-014") uses `label-caps` with increased letter spacing for a "schematic" look, or `metadata` with negative tracking for compact, data-heavy displays.

## Layout & Spacing

This design system uses a **Fluid Grid** with a strict 8px baseline rhythm. 

- **Grid Model:** 12-column system for desktop, 6-column for tablet, and 2-column for mobile.
- **Margins:** Large outer margins (32px+) are encouraged to allow the background gradients to "breathe" around the central content.
- **Density:** High density within "Technical Elements" (1px borders, 8px padding) contrasted with low density in "Narrative Elements" (24px+ padding in cards).
- **Reflow:** On mobile, large display headings should scale down to 32px (`headline-lg`) to maintain readability while preserving the geometric character of the font.

## Elevation & Depth

Depth is established through "Ambient Luminosity" rather than traditional shadows.

- **Soft Ambient Shadows:** Shadows should use a tint of the background (e.g., a desaturated lavender-grey) with high blur (20px-40px) and low opacity (10-15%). Avoid pure black shadows.
- **Glassmorphism:** Overlays and dropdowns use a backdrop-blur of 12px-20px with a 40% white fill and a 1px "inner-glow" white border.
- **Tonal Layering:** Deep Plum cards (#2D1B36) sit at the highest perceived elevation, acting as focal points that "float" above the pastel canvas.
- **Micro-Depth:** Buttons use a subtle inner-shadow (top-down) to create a tactile, slightly recessed feel when pressed.

## Shapes

The shape language is "Optimized Organic"—mostly rounded, but with specific sharp edges for technical precision.

- **Base Radius:** Elements like buttons and standard chips use a 0.5rem (8px) radius.
- **Container Radius:** Cards and large panels utilize a 1.5rem (24px) radius to feel friendly and modern.
- **Technical Elements:** Tooltips, input focus states, and "data bits" may use 0px or 2px radii to signify a shift from "experience" to "data."

## Components

- **Cards:** Use two variants. The "Primary Card" is Deep Plum (#2D1B36) with white text. The "Secondary Card" is white with a 1px soft lavender border and a wide ambient shadow.
- **Buttons:** Primary buttons are pill-shaped with the lavender-to-purple gradient. They feature a white icon (e.g., an arrow) inside a circular white container at the trailing edge for a "quantum toggle" look.
- **Chips:** Small, metadata-focused labels with 2px corner radii. Use a semi-transparent white background (20% opacity) when placed over plum cards.
- **Technical Borders:** Use 1px solid strokes in #E0D7FF for light surfaces and 1px solid #4D3B56 for dark surfaces to define internal structures like headers or footers.
- **Input Fields:** Pure white backgrounds with a subtle inner shadow and a high-contrast focus ring in primary lavender.