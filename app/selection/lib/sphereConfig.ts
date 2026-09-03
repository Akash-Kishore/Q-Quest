// Sphere configuration for the Launch Pad physics background
// Positions are expressed as fractions of viewport (0..1)
// Initial positions are biased toward the top 40% of the screen

export interface SphereDefinition {
  /** Initial X position as fraction of viewport width (0..1) */
  initialX: number;
  /** Initial Y position as fraction of viewport height — biased toward top */
  initialY: number;
  /** Final resting Y position as fraction of viewport height — distributed */
  finalY: number;
  /** Radius in pixels */
  radius: number;
  /** Mass (proportional to radius) */
  mass: number;
  /** Opacity (0..1) */
  opacity: number;
  /** Highlight color for radial gradient center */
  highlightColor: string;
  /** Base color for radial gradient edge */
  baseColor: string;
}

// Desktop: 16 spheres — full experience
const desktopSpheres: SphereDefinition[] = [
  // Large spheres
  { initialX: 0.12, initialY: 0.08, finalY: 0.15, radius: 96,  mass: 96,  opacity: 0.40, highlightColor: 'rgba(255,255,255,0.95)', baseColor: 'rgba(240,241,241,0.35)' },
  { initialX: 0.82, initialY: 0.12, finalY: 0.78, radius: 128, mass: 128, opacity: 0.30, highlightColor: 'rgba(255,255,255,0.90)', baseColor: 'rgba(240,241,241,0.25)' },
  { initialX: 0.65, initialY: 0.05, finalY: 0.08, radius: 80,  mass: 80,  opacity: 0.20, highlightColor: 'rgba(255,255,255,0.85)', baseColor: 'rgba(240,241,241,0.15)' },
  // Medium spheres
  { initialX: 0.05, initialY: 0.18, finalY: 0.45, radius: 64,  mass: 64,  opacity: 0.50, highlightColor: 'rgba(255,255,255,0.92)', baseColor: 'rgba(240,241,241,0.40)' },
  { initialX: 0.35, initialY: 0.22, finalY: 0.62, radius: 40,  mass: 40,  opacity: 0.40, highlightColor: 'rgba(255,255,255,0.90)', baseColor: 'rgba(245,245,245,0.35)' },
  { initialX: 0.88, initialY: 0.10, finalY: 0.28, radius: 32,  mass: 32,  opacity: 0.60, highlightColor: 'rgba(255,255,255,0.95)', baseColor: 'rgba(245,245,245,0.50)' },
  // Small-medium spheres
  { initialX: 0.18, initialY: 0.30, finalY: 0.92, radius: 24,  mass: 24,  opacity: 0.70, highlightColor: 'rgba(255,255,255,0.95)', baseColor: 'rgba(250,250,250,0.60)' },
  { initialX: 0.95, initialY: 0.03, finalY: 0.05, radius: 12,  mass: 12,  opacity: 0.50, highlightColor: 'rgba(255,255,255,0.95)', baseColor: 'rgba(250,250,250,0.40)' },
  { initialX: 0.70, initialY: 0.20, finalY: 0.55, radius: 6,   mass: 6,   opacity: 0.60, highlightColor: 'rgba(255,255,255,0.95)', baseColor: 'rgba(250,250,250,0.50)' },
  { initialX: 0.42, initialY: 0.06, finalY: 0.12, radius: 10,  mass: 10,  opacity: 0.40, highlightColor: 'rgba(255,255,255,0.95)', baseColor: 'rgba(250,250,250,0.30)' },
  // Bottom-distributed spheres (will fall to lower positions)
  { initialX: 0.08, initialY: 0.25, finalY: 0.85, radius: 24,  mass: 24,  opacity: 0.30, highlightColor: 'rgba(255,255,255,0.90)', baseColor: 'rgba(245,245,245,0.25)' },
  { initialX: 0.52, initialY: 0.15, finalY: 0.75, radius: 16,  mass: 16,  opacity: 0.45, highlightColor: 'rgba(255,255,255,0.95)', baseColor: 'rgba(250,250,250,0.40)' },
  { initialX: 0.75, initialY: 0.28, finalY: 0.90, radius: 28,  mass: 28,  opacity: 0.25, highlightColor: 'rgba(255,255,255,0.88)', baseColor: 'rgba(240,241,241,0.20)' },
  { initialX: 0.45, initialY: 0.32, finalY: 0.82, radius: 20,  mass: 20,  opacity: 0.35, highlightColor: 'rgba(255,255,255,0.92)', baseColor: 'rgba(245,245,245,0.30)' },
  { initialX: 0.25, initialY: 0.14, finalY: 0.95, radius: 32,  mass: 32,  opacity: 0.20, highlightColor: 'rgba(255,255,255,0.85)', baseColor: 'rgba(240,241,241,0.15)' },
  { initialX: 0.92, initialY: 0.20, finalY: 0.68, radius: 12,  mass: 12,  opacity: 0.50, highlightColor: 'rgba(255,255,255,0.95)', baseColor: 'rgba(250,250,250,0.45)' },
];

// Tablet: 10 spheres — reduced complexity
const tabletSpheres: SphereDefinition[] = desktopSpheres.slice(0, 10);

// Mobile: 6 spheres — minimal
const mobileSpheres: SphereDefinition[] = desktopSpheres.slice(0, 6);

export function getSphereConfig(viewportWidth: number): SphereDefinition[] {
  if (viewportWidth < 768) return mobileSpheres;
  if (viewportWidth < 1024) return tabletSpheres;
  return desktopSpheres;
}

export const PHYSICS_CONSTANTS = {
  /** Downward gravitational acceleration (px/frame²) */
  gravity: 0.15,
  /** Velocity damping per frame (1 = no damping) */
  damping: 0.985,
  /** Bounce coefficient — 0 = no bounce, 1 = perfect elastic */
  restitution: 0.4,
  /** Max cursor repulsion force (px/frame²) */
  cursorMaxForce: 8,
  /** Cursor interaction radius in pixels */
  cursorRadius: 180,
  /** Repulsion strength multiplier */
  cursorStrength: 500,
  /** Max velocity magnitude to prevent explosions */
  maxVelocity: 12,
  /** Fixed timestep for physics stability (ms) */
  fixedTimestep: 16.667,
} as const;
