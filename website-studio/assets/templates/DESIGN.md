---
name: "[Business name]"
colors:
  surface: "#000000"
  ink: "#000000"
  ink-soft: "#000000"
  accent: "#000000"
  accent-text: "#000000"
  rule: "#000000"
typography:
  display:
    fontFamily: "[Family]"
    fontSize: "clamp(3rem, 9vw, 8rem)"
    fontWeight: 500
  body:
    fontFamily: "[Family]"
    fontSize: 1rem
    fontWeight: 400
  label:
    fontFamily: "[Family]"
    fontSize: 0.75rem
    fontWeight: 600
rounded:
  sm: 0px
  md: 0px
spacing:
  sm: 8px
  md: 16px
  lg: 48px
  xl: 96px
---

<!-- Written when the owner picks a direction in Stage 2. This file is the lock: every later page follows it. Replace every value above. Follows the Google Labs DESIGN.md format (alpha). -->

## Overview

**Source of truth:** [The supplied brand kit, or "chosen in Stage 2 from direction X". Anything the kit didn't supply is marked "house choice".]

**Scene:** [One sentence: who, where, what light, what mood. It should force the theme.]

**The object:** [What this site is, as a thing in the world.]

**Colour strategy:** [Restrained / Committed / Full palette / Drenched, and why.]

## Colors

Colours are named by job, so a change of brand only changes the values.

- **surface:** [where it's used]
- **ink:** [where it's used]
- **ink-soft:** [where it's used]
- **accent:** [fills only]
- **accent-text:** [the darker version for words]
- **rule:** [hairlines and dividers]

Contrast measured: [ink on surface x:1, accent-text on surface x:1, text on accent x:1].

## Typography

**Why these fonts:** [The three brand words, what they ruled out, the object the choice came from.]

Numerals: [lining / tabular where needed]. Fonts [self-hosted / loaded from where].

## Layout

Max width: [value]. Section order on the home page: [list]. How rhythm varies between sections: [note].

## Elevation

[Shadows and layering, or "flat: separated by rules and bands".]

## Shapes

Corners: [value and reason]. Rules: [value]. Logo: [file, variants allowed, minimum size, clear space].

## Components

Buttons: [description]. Forms: [description]. Cards or lists: [description]. Navigation: [description]. Empty, loading, error and success states: [description].

Photography: [treatment; what's real, what's a placeholder, how placeholders are marked].

Motion: [what moves, how long, the easing, reduced-motion behaviour].

## Do's and Don'ts

- Do: [project-specific rule]
- Don't: [project-specific ban, on top of references/ai-tells.md]

### Kept on purpose

[Anything the owner chose to keep that the checks object to, with the date and their reason. These codes go in the inspector's --allow list.]
