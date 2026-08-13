# Design System Document

## 1. Overview & Creative North Star

### Creative North Star: "The Celestial Void"
This design system is engineered to feel less like a website and more like a high-end digital installation. It is built on the philosophy of **Kinetic Brutalism**—combining the raw, unforgiving honesty of absolute black space with the sophisticated, technical precision of wide-tracked typography and orbital motion. 

The goal is to break the "template" look by treating the browser as a 3D canvas rather than a flat document. We achieve this through:
- **Intentional Asymmetry:** Off-center focal points and vertical sidebars that challenge the standard F-pattern layout.
- **Micro-Technicality:** Ultra-thin 1px strokes that act as structural "bones" rather than decorative borders.
- **Immersive Depth:** A scattered starfield and kinetic typography that move at different speeds, creating a parallax "portal" effect.

---

## 2. Colors

The color palette is a study in extreme contrast. It leverages an absolute black core to allow typography and technical accents to "shimmer" with an emissive quality.

| Token | Hex | Role |
| :--- | :--- | :--- |
| `surface` | `#131313` | The primary void. Used for the base environment. |
| `surface_container_lowest` | `#0E0E0E` | Deepest shadows or recessed interaction zones. |
| `primary` | `#FFFFFF` | High-contrast actions, focus states, and key technical text. |
| `secondary` | `#C7C6C6` | Information secondary to the main action. |
| `outline_variant` | `#444748` | Low-opacity structural guides. |

### The "No-Line" Rule
Prohibit standard 1px solid borders for general sectioning. Instead, boundaries are defined by **background color shifts**. Use the hierarchy of `surface_container` tokens to distinguish content blocks. A `surface_container_high` module should sit on a `surface` background to create a subtle, borderless separation that feels integrated, not boxed.

### Signature Textures & Glass
To avoid a "flat" feel, use **Glassmorphism** for floating UI elements like the vertical honors bar or tooltips.
- **Glass Spec:** `background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px);`
- **Gradient CTA:** For primary interactions, use a subtle radial gradient from `primary` (#FFFFFF) to `secondary` (#C7C6C6) to give elements a metallic, physical presence.

---

## 3. Typography

The typography system is the primary "ornament" of the interface. It balances high-tech precision with brutalist impact.

- **Display (Space Grotesk):** Set in wide-tracked uppercase. This is the "voice" of the brand. It should feel architectural and deliberate.
- **Body (Inter):** High-readability sans-serif for technical data and secondary descriptors.
- **Accent (PP Neue Machina):** Used sparingly for "ink-trap" personality, specifically in italicized states to suggest motion and digital craft.

### Typography Hierarchy
- **Display-LG (3.5rem):** Wide-tracked, uppercase. Use for orbital text and central hub headings.
- **Headline-MD (1.75rem):** Technical section titles.
- **Label-SM (0.6875rem):** Used for "Honors" sidebars or metadata. Often rotated 90 degrees for vertical orientation.

---

## 4. Elevation & Depth

Hierarchy is achieved through **Tonal Layering** and **Kinetic Parallax** rather than drop shadows.

### The Layering Principle
Stack surfaces to define importance.
1. **The Starfield (Background):** Deepest layer, subtle movement.
2. **The Surface (Base):** Where the main content resides.
3. **The Glass Layer (Overlay):** Used for navigation elements (the Honors bar) and hovering tooltips. These should use `surface_bright` with a 20% opacity.

### The "Ghost Border" Fallback
If a container needs a perimeter for technical definition, use a **Ghost Border**:
- **Stroke:** 1px
- **Color:** `outline_variant` at 15% opacity.
- **Feel:** It should appear like a "blueprint" line—present but ethereal.

---

## 5. Components

### The Central Hub (Signature Component)
The core interaction point. A perfect circle defined by a `primary` 1px border or a solid `secondary` fill.
- **Kinetic Text:** Circular paths of wide-tracked `display-sm` typography orbiting the hub at varying RPMs.
- **State:** On hover, the hub should expand (scale 1.05) and the orbital text should accelerate.

### Buttons
- **Primary:** Rectangle with 0px radius (Hard Edge). Background: `primary`. Text: `on_primary` (Uppercase).
- **Secondary:** Transparent background, 1px `primary` border. Text: `primary`.
- **States:** On hover, primary buttons should invert color or trigger a "glitch" shift of 2px.

### Vertical Honors Sidebar
- **Styling:** A high-contrast white container (`#FFFFFF`) pinned to the right viewport edge.
- **Typography:** `label-md` text rotated -90 degrees.
- **Impact:** Acts as a heavy visual anchor against the dark void of the rest of the UI.

### Cards & Lists
- **Rule:** No divider lines.
- **Spacing:** Use vertical white space (32px - 64px) or a shift from `surface` to `surface_container_low` to denote a new item.
- **Interaction:** Cards should utilize a subtle `backdrop-blur` when hovered to "pull" them out of the starfield background.

---

## 6. Do's and Don'ts

### Do
- **DO** use absolute black (#000000) for the background to ensure the starfield particles pop.
- **DO** apply wide letter-spacing (0.1em to 0.2em) to all uppercase display text.
- **DO** embrace 0px border-radii for all buttons, inputs, and containers to maintain the "High-End Technical" aesthetic.
- **DO** use vertical typography for metadata to break the horizontal monotony.

### Don'ts
- **DON'T** use standard drop shadows. If you need depth, use a 10px `backdrop-blur` on a slightly lighter surface.
- **DON'T** use rounded corners. This system is defined by sharp, precise geometries.
- **DON'T** use high-opacity grey borders. They feel "bootstrap." Use low-opacity ghost borders or background shifts.
- **DON'T** fill the screen with content. The "Void" is a feature; allow the starfield to breathe.