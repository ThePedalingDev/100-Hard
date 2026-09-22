---
name: 100 Hard
description: Industrial load-rating plates, colorized with South African Planet Fitness blue proof marks and deep purple.
colors:
  brass: "#007AFA"
  club: "#3B0054"
  success: "#8FB892"
  failure: "#E8958E"
  graphite: "#3B0054"
  iron: "#4A1466"
  offwhite: "#FFFFFF"
  steel: "#D0C0DC"
  onProof: "#1A0030"
  lightCanvas: "#FFFFFF"
  lightIron: "#F7F2FA"
  lightProof: "#007AFA"
  lightClub: "#3B0054"
  lightSuccess: "#3F6A46"
  lightFailure: "#8B3D38"
  lightSteel: "#5C3E6A"
typography:
  display:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "32px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.04em"
  headline:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "0.04em"
  title:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.04em"
  body:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.04em"
rounded:
  plate: "8px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.brass}"
    textColor: "{colors.onProof}"
    typography: "{typography.label}"
    rounded: "{rounded.plate}"
    padding: "0 16px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.offwhite}"
    textColor: "{colors.club}"
    typography: "{typography.label}"
    rounded: "{rounded.plate}"
    padding: "0 16px"
    height: "44px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.offwhite}"
    typography: "{typography.label}"
    rounded: "{rounded.plate}"
    padding: "0 16px"
    height: "44px"
  button-danger:
    backgroundColor: "transparent"
    textColor: "{colors.failure}"
    typography: "{typography.label}"
    rounded: "{rounded.plate}"
    padding: "0 16px"
    height: "44px"
  input:
    backgroundColor: "{colors.graphite}"
    textColor: "{colors.offwhite}"
    typography: "{typography.body}"
    rounded: "{rounded.plate}"
    padding: "10px 12px"
    width: "100%"
  plate:
    backgroundColor: "{colors.iron}"
    textColor: "{colors.offwhite}"
    rounded: "{rounded.plate}"
    padding: "16px"
  error-banner:
    backgroundColor: "rgba(139, 73, 67, 0.1)"
    textColor: "{colors.offwhite}"
    typography: "{typography.body}"
    rounded: "{rounded.plate}"
    padding: "8px 12px"
  nav-item:
    backgroundColor: "{colors.graphite}"
    textColor: "{colors.steel}"
    typography: "{typography.label}"
    padding: "0 12px"
    height: "56px"
  nav-item-active:
    backgroundColor: "{colors.graphite}"
    textColor: "{colors.brass}"
    typography: "{typography.label}"
    padding: "0 12px"
    height: "56px"
---

# Design System: 100 Hard

## Overview

**Creative North Star: "The Load-Rating Plate"**

The UI is equipment, not a dashboard. Surfaces read as stamped iron plates on a deep-purple shop floor: white condensed type as the die-struck legend, steel as the 1px edge, vibrant blue as rivets and proof marks. Density is locker-room tight. Texture is a fine hatch, not a photograph, not a gradient.

Personality is industrial and inspectable. A screen should look like a rating plate you could bolt to a rack. Colour is semantic or structural, never festive. Interaction is a stamp or a pin slide, not a glow.

Confirmed visual rejections: gradients, neon, glow, glassmorphism, soft ambient shadows, oversized radii, crypto/gaming chrome.

**Key Characteristics:**

- Deep-purple hatch ground with lifted-iron plate-metal fill
- White stamp type (Barlow Condensed, uppercase, 0.04em)
- Geist for running copy and field values
- 8px corners and 1px steel edges on every plate, field, and control
- Vibrant blue used as proof marks (rivets, focus, selection, primary action, active nav), not as a wash
- Status as stamp words plus ✓ / ✕ / ○, never colour alone

## Colors

South African Planet Fitness local brand: vibrant blue, deep purple, white. Two ledger greens/reds. Light and dark are composed, not inverted. Tailwind `brass` maps to proof blue.

### Primary
- **Proof Blue** (`{colors.brass}` / `#007AFA`): Rivets, caret, text selection, 2px focus ring, primary-button fill, active nav, spoon counts, invite codes, liked state. Sparse on purpose.

### Secondary
- **Capacity Green** (`{colors.success}`): Perfect / Done marks and success notices. Ledger complete, not brand chrome. Dark uses a lifted green so 11px stamps pass on purple; light uses `{colors.lightSuccess}`.

### Tertiary
- **Failed Iron-Red** (`{colors.failure}`): Failed / Missed marks, danger buttons, error-banner stroke. Ledger incomplete, not alarm decoration. Dark uses a lifted red for AA; light uses `{colors.lightFailure}`.

### Neutral
- **Club Purple Ground** (`{colors.graphite}` / `#3B0054`): Dark canvas, input wells, nav bar, rivet cups, autofill fill. Brand contrast background.
- **Iron Plate** (`{colors.iron}`): Dark plate fill, a lifted purple derived from `#3B0054`. Light plates are `{colors.lightIron}` on a white canvas.
- **Stamp White** (`{colors.offwhite}` / `#FFFFFF`): Dark body text, titles, in-copy links. Light canvas. Light wordmarks and running text use `{colors.club}` (`#3B0054`).
- **Steel Legend** (`{colors.steel}`): Helper copy, field labels, 1px borders (typically `/35`–`/50`), scrollbar thumb, pending marks. Light uses `{colors.lightSteel}`.
- **On-proof ink** (`{colors.onProof}`): Legend on blue fills (near-black purple) so 13px stamp actions meet AA.

### Named Rules
**The Proof-Mark Rule.** Blue is a mark and the primary action, not a wash. If blue covers more than rivets, focus, a primary fill, or a small proof value, it is too much.

**The Semantic Ledger Rule.** Green and red only mean complete or failed. They do not decorate idle chrome. Status is never blue-only.

## Typography

**Display Font:** Barlow Condensed (Arial Narrow fallback)
**Body Font:** Geist (ui-sans-serif, system-ui)
**Label/Mono Font:** Barlow Condensed for labels, buttons, and dates; tabular numerals on countdowns and counts

**Character:** Condensed grotesk stamps the plate; Geist reads the inspection notes. Titles shout in metal; body copy stays quiet white on purple, purple on white.

### Hierarchy
- **Display** (700, 32px on login / 36px on in-app headers, line-height 1, uppercase 0.04em): Product and challenge names. `h1` default weight supplies the 700.
- **Headline** (600, 18px stamp): Section plates (Today, Ledger, Repayment).
- **Title** (600, 14–16px stamp): Card names, compact plate titles, head-to-head names.
- **Body** (400, 14px running / 15px field values, Geist): Helper lines, errors, notes. Login uses 14px steel for the challenge line.
- **Label** (600, 10–13px stamp, uppercase 0.04em): Field labels and status words at 11px; primary actions at 13px; mobile nav at 10px.

### Named Rules
**The Stamp Rule.** Anything that names, commands, or dates the plate is Barlow Condensed, uppercase, tracked. Geist never wears the stamp.

**The Tabular Count Rule.** Days remaining, perfect-day totals, and calendar numerals use tabular figures.

## Layout

Auth sits as a single centered plate: max width 32rem page, 28rem plate, 16px side padding, 40px vertical padding, vertically centered in the viewport. In-app chrome is a 48rem column, 16px gutters, 24px top padding, 96px bottom padding on small screens to clear the fixed nav (40px bottom on `md`).

Rhythm is 8 / 16 / 24. Plate padding is 16px, 20px from `md`. Form stacks are 16px gaps; field label-to-control is 8px; footer links sit 20px below the submit. Inspection pages stack plates at 20px.

Mobile is the primary density. Desktop login is the same plate, not a split marketing layout. Nav is a five-item bottom bar on small screens and a top steel rule from `md`.

## Elevation & Depth

Flat. Depth is tonal: purple floor, iron plate, purple wells. No drop shadows. The only `box-shadow` in the system is an inset well fill to kill browser autofill. Texture is two hatches: an 8px ground stitch in iron on canvas, a 6px plate stitch in canvas on iron.

### Shadow Vocabulary
None at rest. None on hover.

### Named Rules
**The No-Glow Rule.** No gradients, neon, glow, glass, or offset shadows. Focus is a 2px proof-blue outline, 3px offset, not a halo.

## Shapes

Every plate, field, button, banner, and avatar well uses an 8px corner. Edges are 1px steel (often at 35–50% opacity). Rivets are 10px circles: purple cup, blue ring, blue pin. Daily cards may use 6px blue dots instead of full rivets; that is a lighter inspection card, not a second radius language.

Hairline dividers inside cards are steel at 20% opacity. Head-to-head pins are 36px squares with an 8px corner, blue stroke, sliding on a 1px steel rail.

### Named Rules
**The Eight-Pixel Plate Rule.** 8px is the only container radius. Do not round the world into pills or leave plates square.

## Components

### Buttons
- **Shape:** 8px corners; min-height 44px; stamp type 13px uppercase.
- **Primary:** Proof-blue fill, on-proof legend. Dark hover: white fill, purple legend. Light hover: purple fill, white legend. Full-width on auth.
- **Ghost:** Transparent, steel/50 stroke, stamp-ink type; hover stroke goes stamp-ink.
- **Danger:** Transparent, failure/70 stroke, failure type; hover fills failure with stamp-ink type.
- **Disabled:** 50% opacity. Caret and focus remain proof blue.

### Cards / Containers
- **Corner Style:** 8px (`{rounded.plate}`)
- **Background:** Iron with plate-metal hatch
- **Shadow Strategy:** None
- **Border:** 1px steel at 35% opacity
- **Internal Padding:** 16px (20px from `md`)
- **Signature:** Four corner rivets on `Plate`. Content sits above them.

### Inputs / Fields
- **Style:** Canvas well, 1px steel/40 stroke, 8px corners, 12×10px padding, 15px Geist stamp-ink.
- **Label:** Stamp 11px steel, 8px above the well.
- **Focus:** Global 2px proof-blue outline, 3px offset. Autofill keeps stamp-ink type on the well.
- **Placeholder:** Steel at 80%.
- **Error:** Failure-stroked banner, failure/10 fill, stamp-ink body copy, 8px corners.

### Navigation
- Canvas-colored bar, 1px steel/30 rule (top on mobile, bottom on `md`).
- Stamp labels, 20px stroke icons, min-height 56px (48px row on `md`).
- Idle: steel. Hover: stamp-ink. Active: proof blue.

### Status marks
- Perfect / Done: success + ✓
- Failed / Missed: failure + ✕
- Pending: steel + ○
- Always word + mark.

### Head-to-head rack (related surface)
- Graphite track, 1px steel/30, 40px tall.
- Pins 36px, proof-blue border, 300ms ease-out on `left`.
- Not a login token; reuse proof/steel/purple only.

## Do's and Don'ts

### Do:
- **Do** set plates on the purple hatch with iron fill, 8px corners, 1px steel edges, and blue rivets or dots.
- **Do** stamp titles, labels, buttons, and dates in Barlow Condensed uppercase at 0.04em.
- **Do** use Geist for helper copy and typed values.
- **Do** keep proof blue on rivets, focus, selection, primary action, active nav, and proof numerals.
- **Do** pair status colour with Perfect / Failed / Pending (or Done / Missed) plus ✓ / ✕ / ○.

### Don't:
- **Don't** use gradients, neon, glow, glass, or drop shadows.
- **Don't** introduce a third display face or set body copy in Barlow Condensed.
- **Don't** flood a screen with blue fills.
- **Don't** use radii other than 8px on plates, fields, and buttons.
- **Don't** communicate status with colour alone.
