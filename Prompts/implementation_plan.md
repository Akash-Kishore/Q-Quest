# Home Page — Cinematic Scroll Rework (Final)

> The opening cinematic and interactive arrival sequence of Q-Quest — a living, game-like quantum world controlled by the user's scroll.

---

## A. Cinematic Stage Architecture

### Pinning strategy — ScrollTrigger owns pinning exclusively

```
┌──────────────────────────────────────────────┐
│          SCROLL TRACK (div, 500vh)            │
│                                               │
│  ┌────────────────────────────────────────┐   │
│  │     CINEMATIC STAGE (div, 100vh)       │   │
│  │     ← ScrollTrigger pins this →        │   │
│  │                                        │   │
│  │  All visual layers composited here:    │   │
│  │  • EnvironmentLayers (z:0)             │   │
│  │  • HudGrid (z:2)                      │   │
│  │  • Three.js canvas (z:5)              │   │
│  │  • ParticleField canvas (z:6)         │   │
│  │  • HeroTitle (z:10)                   │   │
│  │  • SelectionReveal (z:15)             │   │
│  │                                        │   │
│  └────────────────────────────────────────┘   │
│                                               │
│  (empty scroll space below — timeline only)   │
│                                               │
└──────────────────────────────────────────────┘
```

**No `position: fixed` on the stage.** The stage element starts as a normal block element. ScrollTrigger pins it via `pin: true` — GSAP handles adding/removing the pin styles. This avoids conflicts between CSS fixed positioning and GSAP's pinning lifecycle.

```typescript
ScrollTrigger.create({
  trigger: scrollTrackRef,     // the 500vh container
  start: 'top top',
  end: 'bottom bottom',
  pin: stageRef,               // the 100vh stage — GSAP pins it
  scrub: 1,                    // smooth scroll-to-progress sync
  onUpdate: (self) => {
    // broadcast progress to all subscribers
    subscribers.forEach(fn => fn(self.progress));
  }
});
```

All child layers use `position: absolute; inset: 0` within the pinned stage. They are composited via CSS `z-index` layering. Nothing moves physically with the scroll — everything transforms based on the progress value.

---

## B. Camera Choreography

### Multi-axis camera path (unchanged from approved plan)

| Progress | Z | Y | X | FOV | Easing character |
|----------|---|---|---|-----|-----------------|
| 0.00 | 12.0 | +0.3 | 0.0 | 45° | Rest |
| 0.25 | 8.0 | +0.1 | -0.15 | 43° | Slow start, gentle acceleration |
| 0.50 | 5.0 | -0.1 | +0.1 | 40° | Steady, controlled |
| 0.62 | 3.5 | -0.2 | 0.0 | 38° | Gradual deceleration |
| 0.68 | 3.3 | -0.15 | 0.0 | 37° | Near-still (hold) |

Each axis has its own interpolation function with custom easing. The camera never feels "wobbly" — lateral and vertical movement are extremely subtle (max ±0.2 units in a scene where the sphere radius is 2.0). Every movement has compositional purpose: the slight X drift prevents mechanical centering; the Y drift simulates a natural human gaze settling.

### Visual size verification process

During implementation, the 75–80% target will be verified empirically:

1. Set camera to estimated hold position
2. Render at 1920×1080
3. Measure sphere's pixel diameter vs viewport height
4. Adjust Z and FOV until ratio is ~0.75–0.80
5. Verify at 1366×768 and 1440×900
6. Lock final values

The plan's Z/FOV values are starting estimates, not final answers.

---

## C. Cinematic Beats

### The 11-beat sequence (preserved, with corrections applied)

```
BEAT 01 — ESTABLISH (progress 0.00–0.08)
```
Camera at rest. Q_QUEST visible — large, bold, fully opaque. Central sphere at comfortable size (~40% viewport). 3 orbital electrons rotating at original radii. HUD grid subtly pulsing. Star field, nebula, space void.

**Game-like feeling**: *"I've entered Q-Quest. This is the beginning."*

```
BEAT 02 — DEPARTURE (progress 0.05–0.30)
```
Camera begins forward travel (Z decreasing). Slight camera Y drift downward. Q_QUEST begins translating upward — physically exiting the composition. **Q_QUEST remains fully opaque.** HUD grid parallax responds. Sphere grows as camera approaches. Orbits subtly widen.

**Game-like feeling**: *"I'm moving forward. The world is responding to me."*

```
BEAT 03 — TITLE EXIT (progress 0.20–0.38)
```
Q_QUEST continues upward, passes top edge of viewport at ~0.35. Technical HUD labels also exit upward at slightly different rates (depth). Sphere now ~55–60% of viewport. Orbits widening, orbital planes tilting outward. Some electrons pass in front of/behind the sphere — creating visible depth layering.

**Game-like feeling**: *"The text has moved past me. The sphere is becoming the focus."*

```
BEAT 04 — SPHERE DOMINANCE (progress 0.35–0.55)
```
Camera continues approaching. Sphere fills ~65–75%. Orbital electrons drift outward, speeds decrease. HUD grid opacity decreasing. Sphere shader glow subtly intensifying. Star field dimming — visual attention narrows to sphere.

**Game-like feeling**: *"This object is the center of everything."*

```
BEAT 05 — ARRIVAL / ANTICIPATION HOLD (progress 0.55–0.68)
```
Camera decelerates dramatically — near-still. Sphere at ~75–80%. Orbital electrons at wide radii, almost at viewport edges, very slow. Sphere Fresnel glow breathes subtly — a living "heartbeat." HUD grid nearly invisible. Environment compressed, intimate. Camera makes final micro-adjustments (tiny Y/X).

**This is the checkpoint moment.** The viewer has arrived at something important. The stillness creates anticipation. The sphere feels massive and alive. The world around it has quieted.

**Game-like feeling**: *"I've reached something significant. Something is about to happen."*

> This beat is intentionally generous (~13% of scroll) — it is the emotional pivot of the experience.

```
BEAT 06 — FRACTURE ONSET (progress 0.66–0.74)
```
The sphere surface begins to destabilize. This is NOT a crossfade — the fracture is **physical and progressive**:

**Sub-phase A (0.66–0.69)**: Micro-instability. The sphere shader receives a `uFracture` uniform that introduces subtle surface distortion — vertex displacement noise that makes the surface shimmer/ripple. The sphere is still solid but visually "unstable." No particles yet.

**Sub-phase B (0.69–0.72)**: Surface separates. Canvas particle layer activates. Particles are born at sphere-surface positions (icosphere vertex distribution, projected to screen space). They begin at size 0 and grow to their natural radius over this range. Simultaneously, the sphere shader's alpha begins decreasing. **At ~0.70, both sphere and particles are visible together — the sphere's surface is literally becoming the particles.** This is the critical continuity moment.

**Sub-phase C (0.72–0.74)**: Sphere material fully transparent. Particles at full opacity. Initial outward drift begins — small, controlled. Fragments inherit the sphere's purple/white glow. Orbital electrons have nearly exited frame.

**Game-like feeling**: *"The sphere is transforming. Its substance is changing form."*

```
BEAT 07 — FRAGMENTATION (progress 0.72–0.82)
```
Particles accelerate outward along radial directions from sphere center. **Depth variation**: near particles (those with z closer to camera) grow larger and move faster — some rush toward and past the camera, creating a "flying through" sensation. Far particles shrink and drift slowly. Particle colors begin shifting: white/purple glow → softer pastel tones. Dark background starts losing intensity — sphere's released energy spreads into the environment.

**Game-like feeling**: *"I am moving through the fragments. The world is changing around me."*

```
BEAT 08 — EMERGENCE (progress 0.78–0.88)
```
Particles continue dispersing. The ~150 particles follow authored trajectories:

| Group | ~Count | Trajectory |
|-------|--------|-----------|
| **Settlers** | 20 | Drift to selection-page background positions. Become the decorative spheres |
| **Ascenders** | 40 | Rise toward upper viewport, shrink. Atmospheric |
| **Passers** | 50 | Move toward camera (enlarge), exit frame. "Flying through" |
| **Drifters** | 40 | Lateral exit. Unhurried, varied speeds |

Dark space void transitions through intermediate atmospheric stages:
`#050005` → `#0a0010` → `#1a0030` → `#2a0050` → `#4a1070` → `#7a40a0` → `#a870c0` → `#c8a0e0` → `#e0c0f0` → pastel aurora gradient

HUD grid fully dissolved. Star field gone. Vignette gone. The world has changed.

**Game-like feeling**: *"I've emerged somewhere new. This is a different world."*

```
BEAT 09 — SELECTION ESTABLISH (progress 0.84–0.92)
```
Aurora background fully visible. Paper grain texture. System label enters via upward translation + clip-path reveal — fully opaque. After label settles: "Launch Pad" enters via upward translation + clip-path — **bold, dark, fully opaque throughout**. No fading. The text enters the camera's composition from below.

**Game-like feeling**: *"This place has a name. I've arrived."*

```
BEAT 10 — SELECTION SETTLE (progress 0.90–0.96)
```
Subtitle enters via upward translation (delayed behind heading). Breathing room between elements. Remaining settler particles have reached background positions and begin gentle ambient drift.

**Game-like feeling**: *"The world is settling. My destination is becoming clear."*

```
BEAT 11 — FINAL STATE (progress 0.94–1.00)
```
Circuit Playground card: translateY +60px → 0, scale 0.96 → 1.0. Research Vault card: same, ~2% progress delayed. Cards enter ONLY after heading at final position. Pointer events at ~0.97. Card 3D tilt hover available.

**After scroll completes**: the page is alive with:
- Settler particles drifting softly in the background
- Subtle aurora gradient animation (slow color shift)
- Cards responsive to hover (3D tilt, shadow expansion)
- A sense of completion and readiness — "Choose your path"

**Game-like feeling**: *"Two destinations await. This is the interactive menu of Q-Quest."*

---

## D. Sphere → Particle Continuity

### Particle origin: icosphere vertex distribution

~150 particles are positioned on the sphere's surface using evenly-distributed points (golden spiral on a sphere). Each particle stores:

```typescript
interface FractureParticle {
  // Origin (3D, on sphere surface)
  originX: number; originY: number; originZ: number;
  // Projected screen position (calculated from camera at fracture onset)
  screenX: number; screenY: number;
  // Depth relative to camera (for parallax)
  depth: number;       // -1 (behind sphere center) to +1 (in front)
  // Trajectory
  radialAngle: number; // direction of outward movement
  speed: number;       // base speed (varied per particle)
  group: 'settler' | 'ascender' | 'passer' | 'drifter';
  // Visual
  radius: number;
  color: { r: number; g: number; b: number; a: number };
  glowIntensity: number;
}
```

### Three.js ↔ Canvas crossover (the critical 6%)

```
Progress 0.66: Three.js sphere at full opacity. Shader uFracture = 0 (stable)
Progress 0.67: uFracture increases — surface vertex displacement begins (subtle shimmer)
Progress 0.69: Canvas particles born at sphere-surface screen positions, size 0 → growing
         Three.js sphere alpha begins decreasing. uFracture increasing (more disruption)
Progress 0.70: BOTH visible. Sphere partially transparent + particles partially visible
         This is the visual blend moment — the surface IS becoming particles
Progress 0.72: Three.js sphere alpha = 0. Particles at full opacity. Sphere invisible
Progress 0.72+: Only particles. Three.js render loop paused (not destroyed)
```

### Shader modification for fracture

The existing nucleus shader gets one new uniform:

```glsl
uniform float uFracture; // 0.0 = stable, 1.0 = fully fractured

// In vertex shader: add vertex displacement
vec3 displaced = position + normal * uFracture * sin(position.x * 10.0 + uTime * 3.0) * 0.15;

// In fragment shader: reduce alpha
gl_FragColor = vec4(uColor + glow, (0.7) * (1.0 - uFracture));
```

This makes the sphere's surface ripple and become transparent — it looks like it's destabilizing before the particles take over.

---

## E. Particle → Selection Continuity

The particles don't disappear — they **become** the selection world's atmosphere.

### Settler particles → selection background spheres

~20 particles are designated as "settlers." Their target positions match the approximate locations of the selection page's decorative background spheres. During progress 0.78–0.92, they drift from their fracture-origin positions to these targets. Their appearance transitions from glowing white/purple to soft pastel frost.

At progress 0.92+, settlers are indistinguishable from the selection page's background spheres. They begin gentle ambient drift — very slow velocity, soft bouncing off viewport boundaries. This is the **micro-motion** that keeps the final state alive.

### Visual color transition per particle

| Progress | Particle appearance |
|----------|-------------------|
| 0.69–0.72 | White-purple glow, sharp edge, matching sphere Fresnel |
| 0.72–0.78 | Softening, glow radius increasing, slight size growth |
| 0.78–0.84 | Purple fading → lavender → soft white |
| 0.84–0.90 | Fully pastel, translucent, radial gradient, soft shadow |
| 0.90+ | Identical to selection page sphere aesthetic |

---

## F. Environmental Transition — Atmospheric Evolution

**Not a crossfade.** The dark environment evolves through the sphere's released energy.

### Implementation: interpolated background gradient

A single background container whose CSS gradient color stops are computed from scroll progress:

```typescript
function backgroundColors(progress: number): { base: string; radial1: string; radial2: string } {
  if (progress < 0.55) {
    // Pure dark space
    return {
      base: '#050005',
      radial1: 'rgba(160, 32, 240, 0.35)',  // purple
      radial2: 'rgba(255, 20, 147, 0.35)',   // pink
    };
  }
  if (progress > 0.88) {
    // Fully light aurora
    return {
      base: '#ffffff',
      radial1: 'rgba(232, 213, 255, 0.8)',   // lavender
      radial2: 'rgba(255, 224, 240, 0.8)',    // pink pastel
    };
  }
  // Interpolate through intermediate stages
  const t = (progress - 0.55) / 0.33;
  // ... lerp between dark and light with intermediate purple/lavender stages
}
```

### Layer transitions

| Layer | Start | Transition | End |
|-------|-------|-----------|-----|
| Space void base | #050005 | Brightens through purple/lavender | #ffffff |
| Purple radial | 35% opacity | Intensifies during fracture, then softens | Becomes aurora lavender |
| Pink radial | 35% opacity | Brightens, shifts to pastel | Becomes aurora pink |
| Star field | 40% opacity | Dims during approach, gone by fracture | Invisible |
| Nebula blur | Visible | Brightens during hold, dissolves during emergence | Gone |
| Vignette | Active | Weakens during dominance | Gone by emergence |
| Aurora gradient | Invisible | Fades in at progress 0.82+ | Full visibility |
| Paper grain | Invisible | Fades in at progress 0.86+ | Subtle 6% opacity |

---

## G. Typography — Strictly Spatial, Never Faded

### Q_QUEST exit

```
Progress 0.00: translateY(0vh)     opacity: 1.0
Progress 0.05: translateY(-2vh)    opacity: 1.0   ← movement begins
Progress 0.20: translateY(-40vh)   opacity: 1.0   ← approaching top
Progress 0.35: translateY(-110vh)  opacity: 1.0   ← above viewport, invisible by position
```

The title is always at `opacity: 1.0`. It disappears because it physically leaves the viewport, not because it fades. On reverse scroll, it physically returns.

### Selection content entrance — clip-path + translateY

```css
/* Text enters from below, revealed by clip-path */
.selectionHeading {
  clip-path: inset(100% 0 0 0);  /* fully clipped — invisible */
  transform: translateY(60px);
  opacity: 1;                     /* ALWAYS 1 */
}

/* At final position */
.selectionHeading--revealed {
  clip-path: inset(0 0 0 0);     /* fully revealed */
  transform: translateY(0);
  opacity: 1;
}
```

Applied via scroll progress, not CSS classes. The clip-path interpolates from `inset(100% 0 0 0)` to `inset(0 0 0 0)` — text slides up from behind an invisible horizon. Always bold, always opaque.

### Breathing room between elements

| Element | Movement starts | Settled at | Gap before next begins |
|---------|----------------|------------|----------------------|
| System label | 0.85 | 0.89 | — |
| "Launch Pad" | 0.88 | 0.93 | Overlaps label exit (intentional) |
| Subtitle | 0.91 | 0.95 | 2% after heading peak motion |
| Card 1 | 0.94 | 0.98 | 3% after subtitle peak |
| Card 2 | 0.95 | 0.99 | 1% behind Card 1 |

---

## H. Three.js Lifecycle — Pause, Never Destroy

### The correction

The Three.js scene, camera, geometries, materials, and shaders are **never destroyed** during the scroll journey. This ensures seamless reverse scroll.

### Lifecycle

| Progress | Three.js state |
|----------|---------------|
| 0.00–0.72 | **Active**: render loop running, camera updating, orbits animating, shader uniforms updating |
| 0.72–0.74 | **Transitioning**: sphere alpha = 0, but render loop still running (electrons may still be fading) |
| 0.74+ (forward) | **Paused**: `renderer.render()` calls stopped (no GPU work), but scene graph retained in memory |
| Reverse to < 0.74 | **Resumed**: render loop reactivated, sphere alpha interpolated back up, camera position restored from progress |

The renderer, scene, camera, geometries, and materials are only disposed on **component unmount** (navigating away from `/home`).

---

## Revised File Structure

```
app/home/
├── page.tsx                      [MODIFY] — Orchestrator
├── home.module.css               [NEW]    — Scoped CSS (no body overrides)
├── components/
│   ├── HomeScrollController.tsx   [NEW]    — Lenis + GSAP ScrollTrigger pin
│   ├── HeroTitle.tsx              [NEW]    — Q_QUEST typography, spatial exit
│   ├── SphereScene.tsx            [NEW]    — Three.js sphere + orbits + camera
│   ├── ParticleField.tsx          [NEW]    — Canvas particles: fracture → dispersion → settling
│   ├── EnvironmentLayers.tsx      [NEW]    — Dark BG → atmospheric evolution → aurora
│   ├── HudGrid.tsx                [NEW]    — HUD grid, participates in transition
│   └── SelectionReveal.tsx        [NEW]    — Launch Pad + cards (clip-path, tilt, navigation)
```

### Component progress ranges

| Component | Active range | Controls |
|-----------|-------------|----------|
| `HomeScrollController` | 0–1 | Lenis, GSAP, pin, broadcast |
| `EnvironmentLayers` | 0–0.92 | BG colors, stars, nebula, vignette, aurora, grain |
| `HudGrid` | 0–0.70 | Grid visibility, parallax, transition out |
| `HeroTitle` | 0–0.38 | Q_QUEST translateY (never opacity) |
| `SphereScene` | 0–0.74 | Camera xyz/FOV, sphere shader, orbits, fracture onset |
| `ParticleField` | 0.66–0.95 | Particles: birth, dispersion, color transition, settling |
| `SelectionReveal` | 0.84–1.00 | Selection typography, cards, tilt, navigation |

All subscribe to the same `scrollProgress`. Each applies its own mapping functions with custom easing. No component triggers animations independently.

---

## Orbital Elements Choreography

| Progress | Orbital radius | Speed | Plane tilt | Opacity | Depth behavior |
|----------|---------------|-------|-----------|---------|---------------|
| 0.00 | 3.5 | 0.012 | Original | 0.7 | Normal orbits |
| 0.15 | 3.8 | 0.010 | +5° outward | 0.7 | Some pass in front of sphere |
| 0.30 | 4.5 | 0.008 | +10° | 0.6 | Clear foreground/background |
| 0.45 | 5.5 | 0.006 | +15° | 0.5 | Wide, slow |
| 0.55 | 6.5 | 0.004 | +20° | 0.35 | Nearly at viewport edges |
| 0.65 | 8.0+ | 0.002 | +25° | 0.15 | Drifting out of frame |
| 0.72+ | Off-screen | 0 | — | 0 | Gone before fracture completes |

Orbit path lines (faint pink) widen in sync — reinforcing depth.

---

## HUD Grid Participation

| Progress | Behavior |
|----------|---------|
| 0.00–0.30 | Visible (0.25 opacity). Mouse parallax active. Modules pulse |
| 0.30–0.50 | Parallax intensifies — grid moves more as camera approaches |
| 0.50–0.60 | Opacity: 0.25 → 0.10. Pulse frequency decreasing |
| 0.60–0.70 | Opacity: 0.10 → 0.0. Dissolves naturally |
| 0.70+ | Hidden (`display: none`) for performance |

---

## Final State Micro-Motion

After progress reaches 1.0, the page remains alive:

- **Settler particles**: gentle ambient drift with soft boundary bouncing (same physics as selection page's sphere system, but lightweight — no cursor repulsion until hover detected)
- **Aurora gradient**: continues its slow 20s color-shift animation
- **Cards**: 3D tilt-on-hover (±5° rotateX/Y, spring interpolation), shadow expansion on hover
- **Paper grain**: static texture overlay

Nothing aggressive. The environment breathes. The user feels they've arrived in a **living world**, not a static page.

---

## Performance Strategy

| Concern | Mitigation |
|---------|-----------|
| Three.js + Canvas + DOM | Layered via z-index. Three.js canvas renders only when active (progress < 0.74). Particle canvas renders only when active (progress 0.66–0.95). After 0.95, settlers use lightweight rAF drift (no full canvas redraw) |
| Reverse scroll | Scene graph retained. Render loop reactivates on reverse. No reconstruction |
| 150 particles at 60fps | Canvas 2D — 150 circles with radial gradients is well within budget |
| Scroll subscribers | All use refs, never React state |
| Responsive particle count | Desktop: 150, Tablet: 100, Mobile: 60 |
| `prefers-reduced-motion` | No scroll animation. Hero + selection stacked vertically. No Three.js zoom. No particles |

---

## Responsive Strategy

| Tier | Q_QUEST size | Scroll height | Particles | Camera movement |
|------|-------------|--------------|-----------|----------------|
| Desktop ≥1024px | `clamp(3.5rem, 10vw, 8rem)` | 500vh | 150 | Full multi-axis |
| Tablet 768–1023px | `clamp(3rem, 9vw, 6rem)` | 400vh | 100 | Reduced X/Y drift |
| Mobile <768px | `clamp(2.5rem, 12vw, 4rem)` | 350vh | 60 | Z-only approach |

---

## Scoping & Safety

### Files modified
- `app/home/page.tsx` — complete rewrite as orchestrator

### Files created (all inside `app/home/`)
- `home.module.css`
- `components/HomeScrollController.tsx`
- `components/HeroTitle.tsx`
- `components/SphereScene.tsx`
- `components/ParticleField.tsx`
- `components/EnvironmentLayers.tsx`
- `components/HudGrid.tsx`
- `components/SelectionReveal.tsx`

### Files NOT touched
- `app/page.tsx`, `app/loading/`, `app/selection/` (entire directory), `app/sandbox/`
- `components/` (shared)
- `app/globals.css`, `tailwind.config.ts`
- No `body` style overrides anywhere in the new code

---

## Verification Plan

### Build
```bash
npm run build
```

### Experiential tests (perform as a user)

| # | Test | Question |
|---|------|---------|
| 1 | Enter `/home` | Does it feel like entering a world? |
| 2 | Slow scroll | Does the camera feel physically connected to my movement? |
| 3 | Fast scroll | Does the choreography remain coherent? |
| 4 | Stop at sphere hold | Does the sphere feel important? Is the anticipation real? |
| 5 | Continue through fracture | Does the sphere transform INTO the particles? (not: does a particle effect appear?) |
| 6 | Continue through emergence | Does it feel like emerging into a different world? |
| 7 | Selection reveal | Does "Launch Pad" establish before the cards? |
| 8 | Final state | Does the environment feel alive and destination-like? |
| 9 | Reverse scroll | Does the entire sequence reverse smoothly? Sphere reforms? Title returns? |
| 10 | Card interaction | Do cards feel responsive and game-like without being gimmicky? |

### Technical tests

- [ ] Q_QUEST opacity = 1.0 at all scroll positions (inspect computed style)
- [ ] "Launch Pad" opacity = 1.0 at all scroll positions
- [ ] No visible "swap" between Three.js sphere and canvas particles at 0.69–0.72
- [ ] Sphere shader shows surface instability before particles appear
- [ ] Reverse scroll from progress 1.0 → 0.0: no visual jumps, no reconstruction hitches
- [ ] Three.js not re-created on reverse (check: no new WebGL context)
- [ ] 60fps on desktop (Chrome DevTools Performance panel)
- [ ] No React state updates during scroll (check: no component re-renders in profiler)
- [ ] Cards clickable only after progress > 0.97
- [ ] Other pages unchanged (navigate to each, verify)
