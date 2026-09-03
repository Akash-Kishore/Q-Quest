// Lightweight 2D physics engine for the Launch Pad sphere system
// Runs entirely outside React's render cycle — no state updates per frame

import { type SphereDefinition, PHYSICS_CONSTANTS } from './sphereConfig';

export interface PhysicsSphere {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
  opacity: number;
  highlightColor: string;
  baseColor: string;
  /** Scroll-driven target Y position */
  initialY: number;
  finalY: number;
}

export class PhysicsEngine {
  spheres: PhysicsSphere[] = [];
  private width: number = 0;
  private height: number = 0;
  private cursorX: number = -9999;
  private cursorY: number = -9999;
  private scrollProgress: number = 0;
  /** 0 = fully scroll-driven, 1 = fully live physics */
  private scrollInfluence: number = 1;
  private readonly constants = PHYSICS_CONSTANTS;

  init(definitions: SphereDefinition[], width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.spheres = definitions.map((def) => ({
      x: def.initialX * width,
      y: def.initialY * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: def.radius,
      mass: def.mass,
      opacity: def.opacity,
      highlightColor: def.highlightColor,
      baseColor: def.baseColor,
      initialY: def.initialY * height,
      finalY: def.finalY * height,
    }));
  }

  setBounds(width: number, height: number): void {
    // Scale sphere positions proportionally when viewport changes
    const scaleX = width / (this.width || width);
    const scaleY = height / (this.height || height);
    for (const s of this.spheres) {
      s.x *= scaleX;
      s.y *= scaleY;
      s.initialY *= scaleY;
      s.finalY *= scaleY;
    }
    this.width = width;
    this.height = height;
  }

  setScrollProgress(progress: number): void {
    this.scrollProgress = Math.max(0, Math.min(1, progress));
    // Transition from scroll-driven to live physics:
    // scrollInfluence 1 (fully scroll-driven) when progress < 0.6
    // Blend from 0.6 to 0.9
    // scrollInfluence 0 (fully live) when progress >= 0.9
    if (this.scrollProgress < 0.6) {
      this.scrollInfluence = 1;
    } else if (this.scrollProgress >= 0.9) {
      this.scrollInfluence = 0;
    } else {
      this.scrollInfluence = 1 - (this.scrollProgress - 0.6) / 0.3;
    }
  }

  setCursorPosition(x: number, y: number): void {
    this.cursorX = x;
    this.cursorY = y;
  }

  step(): void {
    const {
      gravity,
      damping,
      restitution,
      cursorMaxForce,
      cursorRadius,
      cursorStrength,
      maxVelocity,
    } = this.constants;

    for (const s of this.spheres) {
      // --- Scroll-driven positioning ---
      if (this.scrollInfluence > 0.01) {
        // Interpolate target Y from initial (top) to final (distributed) based on scroll
        const targetY =
          s.initialY + (s.finalY - s.initialY) * this.scrollProgress;

        // Blend: pull sphere toward scroll-driven target
        const pullStrength = this.scrollInfluence * 0.08;
        s.vy += (targetY - s.y) * pullStrength;
        // Dampen more heavily when scroll-driven
        s.vx *= 1 - this.scrollInfluence * 0.15;
        s.vy *= 1 - this.scrollInfluence * 0.15;
      }

      // --- Gravity (only when transitioning to live physics) ---
      const liveInfluence = 1 - this.scrollInfluence;
      if (liveInfluence > 0.01) {
        s.vy += gravity * liveInfluence;
      }

      // --- Cursor repulsion ---
      if (liveInfluence > 0.3) {
        const dx = s.x - this.cursorX;
        const dy = s.y - this.cursorY;
        const distSq = dx * dx + dy * dy;
        const dist = Math.sqrt(distSq);

        if (dist < cursorRadius && dist > 1) {
          const force = Math.min(
            cursorStrength / (distSq + 100),
            cursorMaxForce
          );
          const nx = dx / dist;
          const ny = dy / dist;
          s.vx += nx * force * liveInfluence;
          s.vy += ny * force * liveInfluence;
        }
      }

      // --- Apply damping ---
      s.vx *= damping;
      s.vy *= damping;

      // --- Clamp velocity ---
      const speed = Math.sqrt(s.vx * s.vx + s.vy * s.vy);
      if (speed > maxVelocity) {
        const scale = maxVelocity / speed;
        s.vx *= scale;
        s.vy *= scale;
      }

      // --- Integrate position ---
      s.x += s.vx;
      s.y += s.vy;
    }

    // --- Sphere-sphere collisions ---
    this.resolveCollisions(restitution);

    // --- Boundary collisions ---
    this.resolveBoundaries(restitution);
  }

  private resolveCollisions(restitution: number): void {
    const spheres = this.spheres;
    const len = spheres.length;

    for (let i = 0; i < len; i++) {
      const a = spheres[i];
      for (let j = i + 1; j < len; j++) {
        const b = spheres[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const distSq = dx * dx + dy * dy;
        const minDist = a.radius + b.radius;

        if (distSq < minDist * minDist && distSq > 0.01) {
          const dist = Math.sqrt(distSq);
          const nx = dx / dist;
          const ny = dy / dist;

          // --- Positional correction (prevent overlap) ---
          const overlap = minDist - dist;
          const totalMass = a.mass + b.mass;
          const correctionA = overlap * (b.mass / totalMass) * 0.5;
          const correctionB = overlap * (a.mass / totalMass) * 0.5;
          a.x -= nx * correctionA;
          a.y -= ny * correctionA;
          b.x += nx * correctionB;
          b.y += ny * correctionB;

          // --- Velocity response (elastic collision weighted by mass) ---
          const relVelX = a.vx - b.vx;
          const relVelY = a.vy - b.vy;
          const relVelDotN = relVelX * nx + relVelY * ny;

          // Only resolve if spheres are moving toward each other
          if (relVelDotN > 0) {
            const impulse = ((1 + restitution) * relVelDotN) / totalMass;
            a.vx -= impulse * b.mass * nx;
            a.vy -= impulse * b.mass * ny;
            b.vx += impulse * a.mass * nx;
            b.vy += impulse * a.mass * ny;
          }
        }
      }
    }
  }

  private resolveBoundaries(restitution: number): void {
    const edgeDamp = restitution * 0.7;
    for (const s of this.spheres) {
      // Left
      if (s.x - s.radius < 0) {
        s.x = s.radius;
        s.vx = Math.abs(s.vx) * edgeDamp;
      }
      // Right
      if (s.x + s.radius > this.width) {
        s.x = this.width - s.radius;
        s.vx = -Math.abs(s.vx) * edgeDamp;
      }
      // Top
      if (s.y - s.radius < 0) {
        s.y = s.radius;
        s.vy = Math.abs(s.vy) * edgeDamp;
      }
      // Bottom
      if (s.y + s.radius > this.height) {
        s.y = this.height - s.radius;
        s.vy = -Math.abs(s.vy) * edgeDamp;
      }
    }
  }
}
