---
name: 100 Hard
description: Daylight load-rating plates, colorized with South African Planet Fitness navy, orange, and yellow. Light only.
colors:
  brass: "#E25F00"
  mark: "#964818"
  club: "#002040"
  success: "#3F6A46"
  failure: "#8B3D38"
  graphite: "#D5E0EA"
  iron: "#FFFFFF"
  offwhite: "#002040"
  steel: "#3D5A73"
  onProof: "#002040"
  signal: "#D4A017"
  canvas: "#E3ECF4"
rounded:
  plate: "8px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
typography:
  display:
    fontFamily: "Bricolage Grotesque, Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "36px"
    fontWeight: 650
    lineHeight: 1.03
    letterSpacing: "-0.035em"
  displayAuth:
    fontFamily: "Bricolage Grotesque, Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "32px"
    fontWeight: 650
    lineHeight: 1.03
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Bricolage Grotesque, Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 650
    lineHeight: 1.08
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Bricolage Grotesque, Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 650
    lineHeight: 1.08
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Atkinson Hyperlegible Next, Atkinson Hyperlegible, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "normal"
  field:
    fontFamily: "Atkinson Hyperlegible Next, Atkinson Hyperlegible, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  action:
    fontFamily: "Atkinson Hyperlegible Next, Atkinson Hyperlegible, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  label:
    fontFamily: "Atkinson Hyperlegible Next, Atkinson Hyperlegible, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.08em"
components:
  button-primary:
    backgroundColor: "{colors.brass}"
    textColor: "{colors.onProof}"
    typography: "{typography.action}"
    rounded: "{rounded.plate}"
    padding: "0 20px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.club}"
    typography: "{typography.action}"
    rounded: "{rounded.plate}"
    padding: "0 20px"
    height: "48px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.offwhite}"
    typography: "{typography.action}"
    rounded: "{rounded.plate}"
    padding: "0 20px"
    height: "48px"
  button-danger:
    backgroundColor: "transparent"
    textColor: "{colors.failure}"
    typography: "{typography.action}"
    rounded: "{rounded.plate}"
    padding: "0 20px"
    height: "48px"
  input:
    backgroundColor: "{colors.graphite}"
    textColor: "{colors.offwhite}"
    typography: "{typography.field}"
    rounded: "{rounded.plate}"
    padding: "12px 16px"
    width: "100%"
  plate:
    backgroundColor: "{colors.iron}"
    textColor: "{colors.offwhite}"
    rounded: "{rounded.plate}"
    padding: "16px"
  error-banner:
    backgroundColor: "rgba(139, 61, 56, 0.1)"
    textColor: "{colors.offwhite}"
    typography: "{typography.body}"
    rounded: "{rounded.plate}"
    padding: "8px 12px"
  nav-item:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.steel}"
    typography: "{typography.action}"
    padding: "0 12px"
    height: "56px"
  nav-item-active:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.mark}"
    typography: "{typography.action}"
    padding: "0 12px"
    height: "56px"
---

# Design System: 100 Hard

## Overview

**Creative North Star: "The Load-Rating Plate"**

The UI is equipment, not a dashboard. Surfaces read as stamped inspection plates on locker-room paper: navy Bricolage as the die-struck legend, steel as the 1px edge, orange as rivets and proof marks, yellow as focus and hover. Density is locker-room tight. Texture is graph-paper hatch, not a photograph, not a gradient. Purple is not in the system. There is no dark theme.

Personality is industrial and inspectable under daylight. A screen should look like a rating plate on a clipboard in a well-lit gym. Colour is semantic or structural, never festive. Interaction is a stamp, a two-pixel lift, or a pin slide.

Confirmed visual rejections: gradients, neon, glow, glassmorphism, oversized radii, crypto/gaming chrome, full-screen colour washes, dark mode, US Planet Fitness purple.

**Key Characteristics:**

- Cool locker-paper graph hatch with white plate-metal fill
- Bricolage Grotesque for titles, tightly tracked, mixed case
- Atkinson Hyperlegible Next for running copy, fields, and actions
- 8px corners and 1px steel edges on every plate, field, and control
- Orange used as proof marks (rivets, caret, primary action, active nav), not as a wash
- Yellow used as hover, selection, and 3px focus, not as a canvas
- Status as words plus ✓ / ✕ / ○, never colour alone
- Light only. One composed daylight theme.

## Colors

South African Planet Fitness local brand, baked down for daylight plates: navy `#002040`, proof fill `#E25F00` (from club `#FF6B00`), proof ink `#964818`, signal `#D4A017` (from club `#FFB600`). Neutrals are navy-tinted paper, not cream sand and not graphite night. Tailwind `brass` is the fill; `mark` is the text. Club purple is not in the system.

### Primary
- **Proof Orange** (`{colors.brass}` / `#E25F00`): Button fills, rivet pins, thin proof edges. Same hue as club orange, lower chroma so it reads as enamel, not a highlighter.
- **Proof Ink** (`{colors.mark}` / `#964818`): Caret, active nav type, spoon counts, invite codes, liked state — orange that holds AA on paper.

### Secondary
- **Capacity Green** (`{colors.success}`): Perfect / Done marks and success notices. Ledger complete, not brand chrome.

### Tertiary
- **Failed Iron-Red** (`{colors.failure}`): Failed / Missed marks, danger buttons, error-banner stroke. Ledger incomplete, not alarm decoration.

### Neutral
- **Locker Paper** (`{colors.canvas}` / `#E3ECF4`): The only canvas. Navy-tinted graph paper, deep enough that white plates lift.
- **Well** (`{colors.graphite}`): Input wells, autofill fill, pale tracks.
- **Club Navy** (`{colors.club}` / `#002040`): Ink, rivet cups, skip-link fill. Not purple.
- **Iron Plate** (`{colors.iron}` / `#FFFFFF`): Plate fill.
- **Steel Legend** (`{colors.steel}` / `#3D5A73`): Helper copy, field labels, 1px borders (typically `/35`–`/50`), scrollbar thumb, pending marks.
- **On-proof ink** (`{colors.onProof}` / `#002040`): Navy legend on orange fills so actions meet AA.
- **Signal Ochre** (`{colors.signal}` / `#D4A017`): Primary hover, selection, 3px focus ring, route-progress bar.

### Named Rules
**The Proof-Mark Rule.** Orange is a mark and the primary action, not a wash.

**The Semantic Ledger Rule.** Green and red only mean complete or failed. Status is never orange-only.

**The No-Wash Rule.** Paper is the floor. Orange and yellow are marks.

**The No-Purple Rule.** No club purple, no lavender steel, no `#3B0054`, no `#6D3D9A`.

**The Daylight Rule.** One light theme. Do not add `data-theme`, a theme toggle, or a dark inversion.

## Typography

**Display Font:** Bricolage Grotesque (Atkinson Hyperlegible Next fallback), self-hosted.
**Body Font:** Atkinson Hyperlegible Next
**Label Font:** Atkinson Hyperlegible Next, uppercase 0.08em, reserved for field labels and status words

**Character:** Display type has the directness of gym signage without shouting in all caps. Body type prioritises low-vision legibility. Labels stay sparse.

### Hierarchy
- **Display** (650, 32px on login / 36px on in-app headers, -0.035em): Product and challenge names.
- **Headline** (650, 18px): Section plates (Today, Ledger, Repayment).
- **Title** (650, 16px): Card names, compact plate titles, head-to-head names.
- **Body** (400, 16px, 1.65): Helper lines, errors, notes.
- **Action** (700, 15px, -0.01em): Buttons and nav words, mixed case.
- **Label** (700, 11px, uppercase 0.08em): Field labels and status words only.

### Named Rules
**The Stamp Rule.** Uppercase tracking is for labels and status, not for titles.
**The Tabular Count Rule.** Days remaining, perfect-day totals, and calendar numerals use tabular figures.

## Layout

Auth sits as a single centered plate: max width 32rem page, 28rem plate, 16px side padding, 40px vertical padding, vertically centered. In-app chrome is `plate-frame`: locked to the visual viewport on small screens, with the document scroll disabled so Safari cannot hide the tab bar. Inner `plate-scroll` is the only scroller. The tab bar is in-flow (not `position: fixed`). Padding is `max(safe-area-inset-bottom, --safari-chrome)` because latest iOS Safari overlays a bottom URL bar that `svh` does not exclude. `content-shell` is 48rem on small screens, 56rem from 640px, 64rem from 1024px, with 16/24/32px gutters. From `md` the shell is centered, and the tab bar shares that column's left edge. The frame unlocks and the tab bar becomes a top plate.

Rhythm is 8 / 16 / 24. Plate padding is 20px, 24px from `md`. Form stacks are 16px gaps; field label-to-control is 8px. Inspection pages stack plates at 24px. Dashboard uses a two-column board from `lg`: pin rack leading, stats plate supporting.

Mobile is the primary density. Desktop login is the same plate, not a split marketing layout. Nav is a six-item bottom bar on small screens and a top plate from `md`, with an orange underline on the active item.

## Elevation & Depth

Flat. Depth is tonal: navy-tinted paper floor, white plate, pale wells. The floor is asymmetric on purpose: an 8px navy spine on the left, a loose well plate hanging off the top-right, and a ghost 100 in the lower-left field. No drop shadows on content plates. The only shadows are that spine, an inset autofill fill, and a 3px yellow focus ring. Texture is 32px graph paper on the floor and 16px plate-metal on cards.

### Shadow Vocabulary
None on content plates. Focus is a 3px signal-yellow outline, 3px offset.

### Named Rules
**The No-Glow Rule.** No gradients, neon, glow, glass, or halo shadows.

## Shapes

Every plate, field, button, banner, and avatar well uses an 8px corner. Edges are 1px steel (often at 35–50% opacity). Rivets are 12px circles: navy cup, orange ring, orange pin. They appear only on daily inspection plaques, not on utility plates.

Hairline dividers inside cards are steel at 20% opacity. Race pins are 36px squares with an 8px corner, orange stroke on the viewer, sliding on a 1px steel rail with yellow ticks at Start, every 25 days, and End.

### Named Rules
**The Eight-Pixel Plate Rule.** 8px is the only container radius.

## Motion

Operate motion is feedback, not choreography. Shared ease is exponential out (`cubic-bezier(0.16, 1, 0.3, 1)`). Pages enter 10px and fade over 280ms. Primary controls lift 2px on hover and compress on press. A check lands as a 280ms stamp. Between-page waits keep the outgoing plate and land that same stamp over the route, with a 2px signal bar. Head-to-head pins slide 280ms. Reduced motion drops spatial movement and keeps colour/state. Native scrolling only; no scroll hijacking. No skeleton shimmer.

## Components

### Buttons
- **Shape:** 8px corners; min-height 48px; 15px bold mixed-case type.
- **Primary:** Proof-orange fill, navy legend. Hover: 2px lift and yellow fill. Full-width on auth.
- **Ghost:** Transparent, steel/50 stroke; hover stroke goes navy.
- **Danger:** Transparent, failure/70 stroke; hover fills failure with paper type.
- **Disabled:** 50% opacity. Caret remains orange; focus remains yellow.

### Cards / Containers
- **Corner Style:** 8px (`{rounded.plate}`)
- **Background:** White iron with plate-metal hatch
- **Shadow Strategy:** None
- **Border:** 1px steel at 35% opacity
- **Internal Padding:** 20px (24px from `md`)
- **Tones:** Iron (white hatch) for default plates; well (graphite) for supporting boards; club (navy hatch) for identity.
- **Signature:** Four corner rivets only on the outer daily inspection plaque. The four scored requirements sit as inner plates: a generated still as the header, a well body for the stamps. Hatch tiles are not used as category icons.

### Inputs / Fields
- **Style:** Pale well, 1px steel/40 stroke, 8px corners, 48px minimum height, 16px Atkinson navy.
- **Label:** 11px uppercase steel, 8px above the well.
- **Focus:** Global 3px yellow outline, 3px offset.
- **Placeholder:** Steel.
- **Error:** Failure-stroked banner, failure/10 fill, navy body copy.

### Navigation
- Paper in-flow tab bar, 1px steel/30 rule on small screens, padded by `max(safe-area-inset-bottom, --safari-chrome)` so the latest iOS Safari overlay URL bar cannot cover labels; plate-metal hatch and 8px corners from `md`.
- Mixed-case labels, 20px Lucide stroke icons (1.6 weight), min-height 56px (48px row on `md`). The wooden spoon stays a custom mark.
- Idle: steel. Hover: navy. Active: proof orange plus a 2px orange underline.

### Status marks
- Perfect / Done: success + ✓
- Failed / Missed: failure + ✕
- Pending: steel + ○
- Always word + mark. Calendar cells fill success/failure/pending. Member faces carry a success, failure, or steel ring, and each face still names Perfect, Failed, or Pending in accessible text.

### Calendar
- Seven-column month grid. In-range days are 76px min on small screens, 104px from `md`.
- Cell fill reads status at a glance. Each member appears as a 16px plate photo (20px from `md`) inside the day tile: success ring if they completed the day, failure ring if they missed it, steel ring while the day is still open.
- Start, Day 25 / 50 / 75, and End are yellow-edged cells with brass labels.

### Head-to-head rack
- Pale track, 1px steel/35, 44px tall, yellow ticks at 25-day intervals.
- Pins 36px, proof-orange border on the viewer, 280ms ease-out on `left`.

### Invite share
- Code as a 32px tabular display numeral.
- Copy code and copy join link are the actions.

### Cropper
- After Choose photo, crop opens as a `dialog` on the top layer so Safari transform/scroll cannot steal the gesture.
- Mobile sheet is 100svh, padded with safe-area insets, sitting above the Safari URL bar.
- Frame is square for avatars and 4:3 for monthly plates, 8px corners, 1px orange edge, as large as the remaining viewport.
- Pan with one finger, pinch or a 48px zoom slider with minus/plus. Offset is clamped so the photo always covers the plate.
- Use this photo writes WebP; Choose another and Cancel stay in the sheet.

## Do's and Don'ts

### Do:
- **Do** set plates on locker paper with white fill, 8px corners, and 1px steel edges. Reserve orange rivets for daily inspection plaques. Use navy for identity and graphite wells for supporting boards.
- **Do** set titles in Bricolage Grotesque, mixed case, tight tracking.
- **Do** use Atkinson Hyperlegible Next for helper copy, fields, buttons, and nav.
- **Do** keep proof orange on rivets, caret, primary action, active nav, and proof numerals.
- **Do** pair status colour with Perfect / Failed / Pending (or Done / Missed) plus ✓ / ✕ / ○.

### Don't:
- **Don't** use gradients, neon, glow, glass, or drop shadows on plates.
- **Don't** introduce purple, lavender, or US Planet Fitness club purple.
- **Don't** add a dark theme or a theme toggle.
- **Don't** flood a screen with orange or yellow fills.
- **Don't** use radii other than 8px on plates, fields, and buttons.
- **Don't** communicate status with colour alone.
- **Don't** shout titles in all caps.
