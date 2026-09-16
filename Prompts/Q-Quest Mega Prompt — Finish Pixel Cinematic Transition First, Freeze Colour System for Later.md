# Q-QUEST — MASTER EXECUTION PROMPT
## PRIORITY: FINISH THE CINEMATIC PIXEL TRANSITION FIRST
## COLOUR SYSTEM IS DEFERRED AND MUST NOT BE CHANGED YET

You are now working on the next major iteration of the Q-Quest `/home` experience.

I want to make one very important distinction before implementation:

> **We are NOT doing the global colour-system redesign yet.**

The colour-system specifications have been defined separately and are intentionally deferred until the current cinematic interaction work is fully completed and visually validated.

The immediate priority is:

> **FINISH THE ACTUAL PIXEL CINEMATIC TRANSITION + TYPOGRAPHY + MATERIAL + GAME-LIKE INTERACTION QUALITY FIRST.**

Only after that has been fully implemented, tested, refined and approved should the deferred colour system be introduced.

---

# 1. ABSOLUTE PRIORITY ORDER

Follow this order:

```text id="x0z4mt"
PHASE A
LOCK CURRENT OPENING
        ↓
PHASE B
PIXEL TRANSITION
        ↓
PHASE C
THEATRICAL LAUNCH PAD REVEAL
        ↓
PHASE D
LAUNCH PAD SCALE RESOLUTION
        ↓
PHASE E
PIXEL → SPHERE RECONSTRUCTION
        ↓
PHASE F
SPHERE DROP → BOUNCE → LEVITATION
        ↓
PHASE G
TYPOGRAPHY + MATERIAL POLISH
        ↓
PHASE H
GAME-LIKE INTERACTION POLISH
        ↓
PHASE I
AUTONOMOUS CHROME TESTING
        ↓
PHASE J
VISUAL ITERATION / REFINEMENT
        ↓
ONLY AFTER ALL OF THE ABOVE
PHASE K
COLOUR SYSTEM IMPLEMENTATION
```

Do NOT mix Phase K into Phases A–J.

---

# 2. MOST IMPORTANT RULE — LOCK THE CURRENT OPENING

The current opening animation up to the fullscreen sphere is already approved.

Do NOT change it.

This includes:

- Q_QUEST entrance
- Q_QUEST scale
- Q_QUEST position
- Q_QUEST spatial exit
- camera approach
- camera easing
- X/Y/Z camera movement
- FOV behaviour
- orbital elements
- sphere growth
- sphere framing
- sphere glow
- HUD
- star field
- nebula
- atmosphere
- timing
- scroll response

The existing opening is the foundation.

The new transition must adapt to the existing ending state.

Do NOT alter the opening merely to make Phase 2 easier to implement.

---

# 3. FIND THE TRUE PHASE 1 BOUNDARY FROM THE BROWSER

Do NOT assume a hardcoded value such as `0.64` is automatically correct.

Open the current implementation in Chrome before modifying Phase 2.

Scroll slowly through the current opening.

Identify the exact point where:

> the existing sphere has completed its approved zoom and dominates/fills the viewport.

That rendered state becomes the **hard freeze boundary**.

Everything before that point is immutable.

Conceptually:

```text id="f7c1nd"
CURRENT APPROVED HOME
        ↓
FULLSCREEN SPHERE
        ↓
========================
HARD FROZEN BOUNDARY
========================
        ↓
NEW PIXEL CINEMATIC SYSTEM
```

If the current written plan's numeric boundary differs from the actual visual endpoint, the **actual current browser-rendered endpoint wins**.

Do not modify Phase 1 to force the number.

---

# 4. FIRST TASK — REVISE THE IMPLEMENTATION PLAN

Before writing implementation code, produce a revised implementation plan.

The plan must explicitly contain:

## A. Frozen Phase 1 boundary

Exactly what is frozen and where Phase 2 begins.

## B. Pixel transition architecture

How the sphere becomes a pixel field.

## C. Pixel curtain

How the pixel field theatrically reveals Launch Pad.

## D. Oversized Launch Pad title

How it appears at roughly 70–75% viewport dominance.

## E. Title resolution

How the title scales down into the final selection composition.

## F. Pixel → sphere reconstruction

How remaining pixels form the final ambient sphere.

## G. Sphere motion

How the newly formed sphere drops, bounces and levitates.

## H. Typography system

How Space Grotesk-like, Outfit-like and JetBrains Mono roles are used.

## I. Material/shader system

How the experience gets subtle dimensionality.

## J. Chrome validation

How the agent will inspect and refine the result independently.

Do not skip the planning stage.

---

# 5. REMOVE THE OLD PARTICLE BREAKUP CONCEPT

The old transition:

```text id="1t2o7p"
sphere
↓
150 little spheres
↓
random dispersion
```

is no longer the transition.

Remove/replace that concept.

The new transition is:

```text id="9f2d4a"
FULLSCREEN SPHERE
        ↓
PIXEL INSTABILITY
        ↓
PIXELATION
        ↓
SCREEN-SCALE PIXEL FIELD
        ↓
THEATRICAL PIXEL CURTAIN
        ↓
LAUNCH PAD REVEAL
```

Do not use a generic particle explosion.

---

# 6. GPU-DRIVEN PIXEL TRANSITION

Use a GPU-native solution.

Preferred architecture:

- Three.js
- fullscreen shader quad
- shared `WebGLRenderTarget`
- shader uniforms
- no DOM pixel elements
- no CPU-side particle management
- no React state updates per frame

The transition should be driven from a single:

> `scrollProgress`

value.

---

# 7. GPU TEXTURE HANDOFF

Prefer a direct GPU-side render-target handoff.

At the Phase 1 boundary:

1. render the final sphere frame into a `WebGLRenderTarget`
2. pass that texture to the pixel transition
3. allow the pixel shader to operate on the captured frame
4. pause the expensive SphereScene rendering only after the transition has safely taken ownership

Avoid:

- `toDataURL()`
- unnecessary `readPixels()`
- CPU image conversion

unless the GPU-sharing architecture genuinely proves unstable.

Visual continuity has priority.

No visible frame hitch.

---

# 8. PIXELIZATION MUST FEEL LIKE THE WORLD IS DECONSTRUCTING

The effect should communicate:

> **the existing quantum world is being rasterized / decomposed into digital matter.**

Not:

> an image filter has been applied.

The pixels should have:

- evolving density
- controlled spacing
- soft edge rounding
- luminance hierarchy
- deterministic variation
- subtle dimensionality
- directional displacement
- restrained depth cues

---

# 9. PIXEL SIZE EVOLUTION

Pixel density should evolve continuously.

Conceptually:

```text id="h5y0f8"
LARGE COHERENT BLOCKS
        ↓
MEDIUM BLOCKS
        ↓
SMALLER DIGITAL UNITS
        ↓
DENSE FIELD
        ↓
REORGANIZATION
        ↓
CURTAIN OPENING
```

Do not use abrupt density steps.

Use smooth interpolation.

The transition must feel continuous.

---

# 10. PIXEL MOVEMENT MUST BE AUTHORED

Do NOT randomly scatter pixels.

Use a controlled flow:

```text id="x3l6ku"
sphere center
      ↓
pixelation
      ↓
radial expansion
      ↓
slight directional drift
      ↓
screen-wide field
      ↓
curtain opening
      ↓
reorganization
```

Variation must be deterministic.

Do not use uncontrolled `Math.random()` during animation.

Same scroll position must always produce the same visual result.

---

# 11. PIXEL MATERIAL QUALITY

Pixels should feel like:

> digital matter / quantum information / intelligent transition material.

They should NOT look like:

- Minecraft blocks
- hard square mosaic
- compression artefacts
- generic dissolve particles

Use subtle:

- rounded edges
- per-block luminance variation
- tiny internal gradient
- soft edge illumination
- controlled spacing
- subtle depth cue
- restrained local noise

If an effect makes the transition busy, remove it.

---

# 12. PIXEL CURTAIN

The pixel field must become a theatrical curtain.

Conceptually:

```text id="y72vfa"
FULL PIXEL FIELD

████████████████████████
████████████████████████
████████████████████████

        ↓

CENTER OPENS

███████          ███████
██████            ██████
████                ████

        ↓

TITLE EMERGES

████                ████
      Launch Pad
████                ████

        ↓

TITLE FULLY REVEALED
```

The pixel field is the **transition mechanism itself**.

Do not simply fade the background.

---

# 13. THE LAUNCH PAD REVEAL

Launch Pad must appear as a **second cinematic title card**.

It should initially dominate approximately:

> 70–75% of the viewport.

The title should exist fully opaque behind the pixel curtain.

The pixels are responsible for its visibility.

Do NOT animate its opacity.

The reveal should be:

```text id="v7e8w9"
pixels
↓
partial glyphs
↓
recognizable letters
↓
word becomes readable
↓
Launch Pad fully resolves
```

The viewer should feel that they **discovered** the title behind the transition.

---

# 14. LAUNCH PAD HOLD

Once Launch Pad is fully visible:

> give the title a short cinematic hold.

Do not immediately scale it down.

The user needs a moment to experience:

> "I have arrived."

This is an important emotional beat.

---

# 15. LAUNCH PAD SCALE RESOLUTION

Then:

```text id="x0vw8l"
HUGE LAUNCH PAD
       ↓
camera/framing pullback
       ↓
scale down
       ↓
final heading
       ↓
subtitle
       ↓
cards
```

Do not treat this as an isolated CSS scale effect.

The visual framing should make it feel like:

> the camera is pulling back to reveal the playable destination.

Use:

- scale
- translate
- subtle perspective
- environment parallax
- carefully tuned easing

---

# 16. TYPOGRAPHY SYSTEM

Use a deliberate three-tier typography system.

### CINEMATIC DISPLAY

Use:

> Space Grotesk or the closest visually equivalent.

For:

- Q_QUEST
- Launch Pad
- major cinematic titles

Characteristics:

- bold
- geometric
- futuristic
- editorial
- clean

### SUPPORTING UI

Use:

> Outfit or the closest visually equivalent.

For:

- subtitles
- card titles
- body/supporting text
- selection UI

Characteristics:

- clean
- approachable
- modern
- highly readable

### TECHNICAL SYSTEM

Use:

> JetBrains Mono

For:

- SYSTEM-01 // LABORATORY
- HUD labels
- badges
- technical metadata

Do not introduce additional fonts.

---

# 17. FONT SCOPING

Do NOT globally alter fonts on other pages.

The new typography system must be implemented safely so that:

- `/home` receives the new role-based font system
- `/selection` is not accidentally changed until the later colour-system phase
- unrelated shared components remain untouched

Loading font resources globally is fine if necessary.

Changing their global visual assignments is not.

---

# 18. Q_QUEST

The currently approved Q_QUEST treatment stays intact.

Keep:

- approximately 25% larger scale
- strong readability
- smoked/translucent quality
- subtle dimensionality
- no opacity fade
- spatial exit

Do not redesign Q_QUEST during this phase.

The opening is locked.

---

# 19. PIXEL → SPHERE RECONSTRUCTION

After Launch Pad begins resolving:

remaining pixel fragments should begin reorganizing into a sphere.

The sequence must be visible:

```text id="g8h8h9"
scattered pixels
      ↓
convergence
      ↓
density increases
      ↓
circular silhouette
      ↓
translucent sphere
```

The sphere must not simply appear independently.

It must visibly be constructed by the remnants of the pixel field.

---

# 20. FINAL SPHERE MATERIAL

The new final sphere is secondary.

Use a lightweight 2.5D material.

It should be:

- translucent
- soft
- slightly dimensional
- dreamlike
- futuristic

Think:

> soft quantum glass

not:

> realistic 3D planet.

Use:

- subtle Fresnel
- radial shading
- internal illumination
- tiny noise
- restrained transparency

Do not make it glossy or metallic.

---

# 21. SPHERE DROP / BOUNCE

Once formed:

```text id="j6i0z0"
SPHERE ASSEMBLES
       ↓
brief suspension
       ↓
DROP
       ↓
soft bounce
       ↓
smaller bounce
       ↓
settle
```

The motion should communicate:

> soft object acquiring weight.

Do NOT make it cartoonish.

One primary bounce and one very small secondary bounce are enough.

---

# 22. SPHERE LEVITATION

After settling:

the sphere gently lifts and enters very subtle ambient hover.

The motion should be:

- slow
- small
- barely perceptible

It now becomes part of the final environment.

The sphere must no longer compete with Launch Pad or the cards.

---

# 23. FINAL SELECTION STATE

The final visual hierarchy should be:

```text id="z2yrbe"
Launch Pad
↓
supporting copy
↓
cards
↓
ambient sphere
↓
background atmosphere
```

Cards are the interactive destination.

The sphere is environmental decoration.

The world remains alive through subtle ambient movement.

---

# 24. GAME-LIKE QUALITY

Keep the experience game-like without adding conventional game HUD.

No:

- XP bars
- health bars
- level indicators
- mission dashboards
- fake game buttons
- unnecessary UI panels

The game feeling should come from:

```text id="s3wr72"
ENTER
↓
DISCOVER
↓
APPROACH
↓
TRANSFORM
↓
EMERGE
↓
ARRIVE
↓
CHOOSE
```

This is the actual game-world progression.

---

# 25. CINEMATIC QUALITY

Every phase should have:

- anticipation
- movement
- dominance
- transformation
- resolution
- breathing room

Do not animate everything continuously.

Give major events room to register.

The goal is:

> theatrical pacing

not:

> maximum animation density.

---

# 26. SHADER POLICY

Shaders are encouraged where they improve:

- material
- depth
- atmosphere
- transition quality

Potential uses:

### Main sphere
- Fresnel
- energy movement
- surface detail

### Pixel transition
- pixelation
- displacement
- curtain
- depth cues
- color evolution

### Ambient sphere
- soft Fresnel
- radial shading
- translucency
- internal light

But:

> **do not add shader complexity simply because it is technically possible.**

Minimalism remains part of the design.

---

# 27. CHROME TESTING IS MANDATORY

Do not stop after implementation.

Open the application in Chrome yourself.

Test:

### Phase 1

Scroll from top to fullscreen sphere.

Confirm:

> **zero changes from the current approved opening.**

### Pixel transition

Pause at multiple progress points.

Check:

- pixel quality
- density
- flow
- smoothness
- theatricality

### Launch Pad

Check:

- genuine pixel occlusion
- progressive discovery
- oversized title
- cinematic hold
- scale resolution

### Sphere reconstruction

Check:

- pixels genuinely converge into sphere
- sphere remains subtle
- drop/bounce is natural
- levitation is restrained

### Final state

Check:

- cards are dominant
- sphere is secondary
- world remains alive
- typography hierarchy is clean

### Reverse scroll

Reverse the entire transition.

There must be:

- no popping
- no regeneration
- no random variation
- no state mismatch
- no WebGL reconstruction hitch

---

# 28. AUTONOMOUS ITERATION

Do not rely on me to tell you obvious visual problems.

Use:

```text id="njhk6q"
IMPLEMENT
↓
OPEN CHROME
↓
OBSERVE
↓
IDENTIFY WEAKNESS
↓
FIX
↓
RELOAD
↓
OBSERVE AGAIN
↓
REFINE
```

Repeat until the experience is genuinely polished.

The browser result is more important than whether the implementation merely matches the written plan.

---

# 29. QUALITY BAR

The result should feel like:

> **an Awwwards-level interactive game-world sequence**

with:

- minimalism
- futuristic typography
- sophisticated shaders
- clean motion
- deliberate transitions
- visual restraint
- strong spatial composition

The user should think:

> **"I entered a world."**

not:

> "This website has some cool animations."

---

# 30. STRICT SCOPE

During this entire phase, do NOT modify:

- `/`
- `/loading` visual system
- `/selection` visual system
- `/sandbox/*`
- shared unrelated components
- global colour assignments
- global body styling
- global design tokens

Only modify what is necessary for:

> **Phase 2 pixel transition + typography role system + final selection interaction.**

---

# 31. VERY IMPORTANT — COLOUR SYSTEM IS DEFERRED

A separate approved Q-Quest colour-system specification exists.

It defines the eventual unified palette:

```text id="pp0x4z"
#050005
#000000

#470A4D
#723576
#9855AA
#CD8AD0
#FEB8FF

#FFF5FF
#FFFADE
#FFFFFF
```

It also defines the eventual 60/30/10 visual hierarchy, dark/negative world, light/positive world, and unified Landing → Loading → Home → Selection colour journey. 
**DO NOT IMPLEMENT THAT COLOUR REDESIGN NOW.**

For this phase:

- keep the current approved colours
- do not globally recolour the site
- do not change the Landing page
- do not change Loading colours
- do not change Selection colours
- do not refactor the site's colour tokens

The colour system is a **later locked phase**.

---

# 32. COLOUR PHASE DEPENDENCY

The future colour implementation will happen only after:

1. Pixel transition is visually approved
2. Launch Pad reveal is visually approved
3. Pixel → sphere reconstruction is visually approved
4. Sphere bounce/levitation is visually approved
5. Typography hierarchy is approved
6. Reverse scroll is approved
7. Chrome visual QA is complete

Only then should the deferred colour-system phase begin.

---

# 33. FUTURE COLOUR SYSTEM — PRESERVE AS A SEPARATE SPECIFICATION

Do not discard the approved palette.

It remains the future authoritative colour system:

### Deep / Negative

- `#050005`
- `#000000`
- `#470A4D`
- `#723576`

### Mid / Atmospheric

- `#9855AA`
- `#CD8AD0`

### Accent

- `#FEB8FF`

### Light / Positive

- `#FFF5FF`
- `#FFFADE`
- `#FFFFFF`

The eventual system is intended to create:

```text id="1y4p0b"
BLACK / WHITE
      ↓
PURPLE ACTIVATION
      ↓
DEEP QUANTUM WORLD
      ↓
PIXEL TRANSFORMATION
      ↓
LAVENDER
      ↓
LIGHT PASTEL
      ↓
INTERACTIVE WORLD
```

The Landing page remains intentionally monochrome in that later phase.

Do not implement any of this yet.

---

# 34. DO NOT LET FUTURE COLOUR REQUIREMENTS CONTAMINATE THE CURRENT WORK

This means:

Do NOT:

- recolour shaders "in preparation"
- change gradients to the future palette
- globally replace hex values
- modify card colors
- modify Loading
- modify Landing
- modify Selection backgrounds
- change existing image treatment

The current objective is motion + material + transition quality.

Colour comes later.

---

# 35. FINAL SUCCESS CRITERIA FOR THIS PHASE

This phase is successful only when:

### Opening

The current approved opening remains unchanged.

### Pixelation

The sphere transforms into a theatrical pixel field.

### Curtain

The pixels become a cinematic transition medium.

### Launch Pad

The title emerges progressively and dramatically.

### Resolution

Launch Pad scales down elegantly.

### Reconstruction

Pixels become the ambient sphere.

### Physics

Sphere drops, bounces, settles and levitates naturally.

### Typography

Space Grotesk / Outfit / JetBrains Mono establish a coherent futuristic hierarchy.

### Game Feel

The entire sequence feels like entering and navigating a world.

### Chrome

The result has been independently tested and iterated in Chrome.

### Reverse

Everything works backward.

### Scope

No unrelated pages or colours have been changed.

---

# FINAL COMMAND

**First revise the implementation plan using all of the requirements above.**

Do not code immediately.

Then implement ONLY the current cinematic/pixel/typography work.

Use Chrome yourself to test and refine it.

Keep the current opening completely locked.

Do NOT implement the global colour-system changes yet.

Only after this cinematic phase has been fully validated should we move to the separate colour-system phase.

The current priority is:

> **MAKE THE TRANSITION EXCEPTIONAL FIRST.**

The later priority will be:

> **MAKE THE ENTIRE WEBSITE VISUALLY UNIFIED THROUGH THE NEW COLOUR SYSTEM.**

Do not mix these two phases.