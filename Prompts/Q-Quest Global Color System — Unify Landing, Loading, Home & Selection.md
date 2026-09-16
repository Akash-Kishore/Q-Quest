# FINAL GLOBAL COLOR SYSTEM — UNIFY THE ENTIRE Q-QUEST EXPERIENCE

I reviewed the Landing, Loading, Home and Selection screens together.

The current issue is NOT that the individual screens look bad.

The issue is that they feel like different products because their color systems are not visually connected.

We now need one unified Q-Quest color language.

Do NOT redesign the layouts.

Do NOT alter the locked Home cinematic choreography.

Do NOT change the Landing page's monochrome identity.

This is a **color-system refinement only**.

---

# 1. AUTHORITATIVE PALETTE

Use ONLY this core palette unless black/white is required for contrast:

```text
DEEP BLACK      #050005
PURE BLACK     #000000

DEEP PURPLE    #470A4D
STRUCTURAL     #723576
MID PURPLE     #9855AA
SOFT PURPLE    #CD8AD0
SOFT PINK      #FEB8FF

SOFT WHITE    #FFF5FF
WARM CREAM    #FFFADE
PURE WHITE    #FFFFFF
```

Do not introduce arbitrary blue, cyan, neon magenta, green, orange, or unrelated gradients.

---

# 2. LANDING PAGE — KEEP MONOCHROME

The initial Landing page must remain visually black and white.

Do NOT introduce the purple brand palette here.

Keep:

```text
#000000
#FFFFFF
```

with restrained grayscale if required.

The Landing page is the monochrome "title screen".

This is intentional.

---

# 3. LOADING PAGE — BECOME THE BRIDGE

The current Loading page is too saturated purple and feels disconnected.

Rework ONLY the color treatment.

Make it transition visually from the monochrome Landing into the dark Q-Quest world.

Target hierarchy:

### 60%
`#050005`

### 30%
`#470A4D` → `#723576`

### 10%
`#CD8AD0` / `#FFFFFF`

The Loading environment should gradually become richer in purple as loading progresses.

It should feel like:

```text
SYSTEM OFF
   ↓
SYSTEM INITIALIZING
   ↓
Q-QUEST WORLD ACTIVATING
```

Do NOT make it neon.

---

# 4. HOME — DARK QUANTUM WORLD

Use:

### 60%
`#050005` + `#470A4D`

### 30%
`#723576` + `#9855AA`

### 10%
`#CD8AD0` + `#FEB8FF` + small white highlights

The Home page should feel:

- dark
- mysterious
- futuristic
- premium
- atmospheric

but not neon.

The deepest parts should remain almost black.

---

# 5. HOME SPHERE

Derive the sphere material from the same palette.

Use approximately:

```text
Core:
#050005 / #470A4D

Body:
#723576

Atmosphere:
#9855AA

Fresnel:
#CD8AD0

Highlight:
#FEB8FF

Rare highlight:
#FFFFFF
```

The sphere should feel like part of the same world as the background.

---

# 6. PIXEL TRANSITION

Do not use a generic purple-to-white fade.

The pixel transition should carry the palette evolution:

```text
#050005
↓
#470A4D
↓
#723576
↓
#9855AA
↓
#CD8AD0
↓
#FEB8FF
↓
#FFF5FF
↓
#FFFADE
↓
#FFFFFF
```

Use smooth non-linear interpolation.

Darker tones should dominate early.

Lighter tones should emerge progressively.

The pixel field itself should visually carry the transformation.

---

# 7. REMOVE THE BLUE FEEL FROM SELECTION

The current Selection environment has a noticeable pale blue presence.

Remove blue from the primary Q-Quest color language.

Do NOT replace it with another saturated color.

Instead use:

- soft lavender
- warm cream
- soft pink
- white

This will make the Selection page feel like the natural positive-state continuation of Home.

---

# 8. SELECTION PAGE — POSITIVE WORLD

Use:

### 60%
`#FFF5FF` + `#FFFFFF`

### 30%
`#FFFADE` + subtle `#CD8AD0`

### 10%
`#470A4D` + `#723576` + restrained `#FEB8FF`

The environment should be:

- bright
- warm
- soft
- futuristic
- minimal
- airy

but still unmistakably Q-Quest.

---

# 9. SELECTION BACKGROUND

Replace the current strong blue/pink gradient behaviour with a restrained atmospheric gradient.

Conceptually:

```text
Top / light:
#FFF5FF

Center:
#FFFFFF

Warm region:
#FFFADE

Subtle atmospheric purple:
#CD8AD0
```

The gradient may slowly breathe/shift, but the movement must remain extremely subtle.

The user should perceive:

> a living atmosphere

rather than:

> a background continuously changing colors.

---

# 10. SELECTION TYPOGRAPHY

On the light environment:

### Major display

`#470A4D`

### Supporting text

`#723576`

### Technical labels

`#470A4D`

### Small accents

`#9855AA` / `#FEB8FF`

Avoid pure black except where needed for accessibility/contrast.

---

# 11. CARDS

Keep the existing card visual structure.

Cards should remain predominantly:

```text
#FFFFFF
#FFF5FF
```

with:

```text
Primary border/text:
#470A4D

Secondary:
#723576 / #9855AA

Accent:
#CD8AD0 / #FEB8FF
```

Do NOT turn the cards into purple panels.

They are the clean interactive objects inside the world.

---

# 12. TYPOGRAPHY POLARITY

Use the same typography system but invert its color according to environment.

### Dark world

Text:

`#FFFFFF` / `#FFF5FF`

Accent:

`#FEB8FF`

### Light world

Text:

`#470A4D`

Secondary:

`#723576`

This keeps the typography visually connected across the transformation.

---

# 13. 60/30/10 IS A VISUAL DOMINANCE RULE

Do not attempt to literally assign percentages of CSS pixels.

The rule means:

> approximately 60% of the visual field should feel like the dominant environmental color family.

> approximately 30% should provide secondary structure/atmosphere.

> approximately 10% should provide focal contrast/accent.

Prioritize visual harmony over mathematical precision.

---

# 14. POSITIVE / NEGATIVE DESIGN LANGUAGE

The entire Q-Quest journey should communicate a polarity shift:

```text
LANDING
BLACK / WHITE

    ↓

LOADING
BLACK → PURPLE ACTIVATION

    ↓

HOME
DEEP PURPLE / BLACK
NEGATIVE SPACE

    ↓

PIXEL TRANSFORMATION
PURPLE → LAVENDER

    ↓

SELECTION
WHITE / CREAM / SOFT PURPLE
POSITIVE SPACE
```

This should feel like one continuous visual story.

---

# 15. DO NOT USE COLOR FOR COLOR'S SAKE

Do NOT add:

- blue
- cyan
- green
- orange
- neon gradients
- rainbow effects

The supplied purple/cream palette is sufficient.

The sophistication should come from:

- hierarchy
- contrast
- material
- typography
- motion
- lighting

not from having many colors.

---

# 16. FINAL DESIGN TARGET

The entire website should visually read as one connected universe:

```text
BLACK
  ↓
ACTIVATION
  ↓
DEEP PURPLE
  ↓
QUANTUM WORLD
  ↓
PIXEL TRANSFORMATION
  ↓
LAVENDER
  ↓
SOFT WHITE
  ↓
WARM CREAM
  ↓
LAUNCH PAD
  ↓
INTERACTIVE WORLD
```

The landing page remains the pure monochrome exception.

The user should feel:

> **"I entered the same world in a different state."**

not:

> "Every page has its own color theme."

---

# 17. IMPLEMENTATION RULE

Before changing colors globally:

- inspect where each color currently comes from
- scope changes appropriately
- do not affect unrelated pages
- do not alter the locked Home cinematic timing
- preserve existing imagery
- preserve card artwork
- preserve typography hierarchy

This is a visual-system correction, not a layout redesign.

---

# FINAL APPROVAL CRITERION

When viewing Landing → Loading → Home → Selection consecutively, there must be an obvious visual relationship between all four.

The Landing remains:

> **BLACK + WHITE**

Everything afterward should progressively introduce:

> **DEEP PURPLE → SOFT PURPLE → LIGHT PASTEL**

with a deliberate positive/negative polarity shift.

The final impression must be:

> **minimalistic + futuristic + game-like + cinematic + premium + unmistakably Q-Quest.**