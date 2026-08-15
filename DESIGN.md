---
name: Booked.
description: Warm, editorial appointment booking for Philippine service businesses
colors:
  primary: "#B8862B"
  primary-soft: "#D8AE5F"
  ink: "#14213D"
  ink-soft: "#233258"
  paper: "#F5F0E4"
  paper-white: "#FFFDF8"
  sage: "#4F7860"
  slate: "#5B6270"
  line: "rgba(20, 33, 61, 0.14)"
typography:
  display:
    fontFamily: "Fraunces, Georgia, serif"
    fontWeight: 700
  body:
    fontFamily: "IBM Plex Sans, system-ui, sans-serif"
  label:
    fontFamily: "IBM Plex Mono, monospace"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.sm}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.primary-soft}"
  button-secondary:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "12px 24px"
  button-on-dark:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "12px 24px"
  button-outline-on-dark:
    backgroundColor: "transparent"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.sm}"
    padding: "12px 24px"
  input-field:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "12px 16px"
  card:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "24px 32px"
---

# Design System: Booked.

## Overview

**Creative North Star: "The Brass-Bound Ledger"**

Booked. is a brass-bound appointment ledger kept by a careful owner. The interface reads like the inside of a well-loved business book: warm paper surfaces, inked entries set in an editorial serif, and antique brass used sparingly — the way a ledger's gilded edges are. Nothing shouts. The system earns trust through precision: hairline rules instead of heavy borders, an accent that appears like a stamp rather than a theme, and type that feels set, not rendered.

The voice is editorial warmth, restrained. The landing page is the product's persuasion surface — darker, more theatrical, with brass glows and floating ticket motifs — while the application surfaces are its operational counterpart: calm paper, clear hierarchy, and the same brass reserved for the one action that matters. Both read as the same hand. Density leans comfortable; spacing is generous enough that the app never feels like a form, and tight enough that it still feels like a tool.

The system deliberately rejects both the sterile dashboard and the florid "spa" aesthetic. There are no pastels, no drop-shadow gradients, no soft-focus photo textures. Depth is a response to interaction, not a permanent condition. Warmth comes from material honesty — real paper tones, real ink, real metal — not from decoration.

**Key Characteristics:**
- Warm paper surfaces (`paper`, `paper-white`) with hairline `line` borders; never gray-on-white SaaS chrome.
- A single antique brass accent used as a stamp, not a theme (the rarity is the point).
- Editorial serif display (Fraunces) over humanist sans (IBM Plex Sans) — headlines feel set in lead.
- Flat-by-default, lifting only on interaction.
- Rounded but not cute: 8px surfaces, 9999px only for genuine pills/chips.
- Monospace (IBM Plex Mono) reserved for labels and metadata, lending ledger authenticity.

## Colors

A heritage-warm palette of ink, paper, and brass. Warm neutrals do the heavy lifting; the brass accent is deliberately rare.

### Primary
- **Antique Brass** (`#B8862B`): The system's single accent. Primary buttons, active nav states, link emphasis, the period on "Booked.", small icon tints, and the ledger stamp on key numbers. Rarity is the rule — on any app screen, brass covers well under 10% of the surface. **Antique Brass Soft** (`#D8AE5F`) is the hover/soft variant: primary buttons lighten to it, and it is used for secondary brass tints at low opacity (`brass/10`, `brass/15`).

### Neutral
- **Midnight Ink** (`#14213D`): The darkest surface and primary text. Headlines, body text, and the landing's dark hero/CTA sections. Its blue undertone keeps the warmth of the paper from going muddy.
- **Ink Soft** (`#233258`): Secondary text weight, label text, and muted inked headings. A step below Midnight Ink in weight, not in hue.
- **Warm Paper** (`#F5F0E4`): The app's page background and the landing's light sections. This is the paper the ledger is written on.
- **Soft Ivory** (`#FFFDF8`): Card and input surfaces — the clean sheets that hold individual entries. Sits a clear notch lighter than Warm Paper so cards read as lifted sheets even when flat.
- **Garden Sage** (`#4F7860`): Rare accent for positive status (completed, available). Used at low opacity tints; never a rival to brass.
- **Sober Slate** (`#5B6270`): Muted secondary text, placeholders, footer links, captions. Neutral but with a blue-lean that matches ink.
- **Line** (`rgba(20, 33, 61, 0.14)`): Hairline borders and dividers — ink at low opacity so rules read as printed on the paper, not drawn on top of it.

### Named Rules

**The Rare Brass Rule.** Antique Brass covers ≤10% of any app screen. Its scarcity is the point; when everything is brass, nothing is a ledger.

**The Warm Paper Rule.** Surfaces are paper-toned, never pure white or gray. Pure `#FFFFFF` and neutral grays are off-world unless a token explicitly maps to them.

## Typography

**Display Font:** Fraunces (with Georgia, serif fallback)
**Body Font:** IBM Plex Sans (with system-ui sans fallback)
**Label/Mono Font:** IBM Plex Mono (monospace)

**Character:** A 18th-century old-style serif (Fraunces) paired with a quiet, humanist Swiss sans (IBM Plex). The pairing says "published, not generated" — serif headlines carry editorial authority, sans body keeps the app scannable. Mono is the ledger's ink stamp for metadata.

### Hierarchy

- **Display** (Fraunces, weight 700, sizes ~2rem–5rem, tight line-height ~1.05): Hero headlines on landing (`text-4xl`–`text-5xl`+), auth page wordmarks, section titles. The brass period sits on headlines.
- **Headline** (Fraunces, weight 600–700, ~1.25–1.875rem): Card titles, dashboard module headings, feature titles.
- **Title** (Fraunces, weight 600, ~1.125rem): Sub-sections, service names in cards.
- **Body** (IBM Plex Sans, weight 400–500, 0.875–1.125rem, line-height ~1.5–1.75): Paragraphs, form labels are separate, table content. Keep prose lines ≤65ch on the landing.
- **Label** (IBM Plex Mono, weight 500, 0.75–0.875rem, letter-spacing ~0.05em, uppercase for eyebrows): "Why Booked.", "What you get", section eyebrows, metadata, status chips. Uppercase mono eyebrows above serif headlines are the system's signature rhythm.

### Named Rules

**The Eyebrow Rule.** Section eyebrows are always uppercase IBM Plex Mono with a wide letter-spacing, in brass — a tiny typewritten ledger heading above each serif headline. If a section has a headline, it earns an eyebrow.

## Layout

A single centered column, `max-w-7xl` (`80rem`) for app shells and a 6/12 column grid rhythm for the landing, with `px-4 sm:px-6 lg:px-8` side gutters scaling by breakpoint. Cards sit in 1/2/3/4-column responsive grids (`grid-cols-1 md:grid-cols-4` for stats, `md:grid-cols-2`+ for content). Vertical rhythm is a 4-based scale: `p-4`/`p-6`/`p-8` cards, `space-y-4` form stacks, `py-20 lg:py-28` section breathing room on the landing. Density is comfortable: inputs and buttons are 44px+ tall, sections get generous whitespace, nothing is cramped; the app still reads as a tool because rhythm is consistent, not because it is sparse. The mobile breakpoint collapses grids to a single column, keeps the navbar as a full-screen drawer, and preserves the same card and type hierarchy.

## Elevation & Depth

Flat-by-default, lifting only on interaction. Ledger sheets do not float at rest; they are flat paper with a hairline border. Depth is a response to state:

- **Ticket cards** rotate slightly (`rotate-1`) at rest and straighten + lift (`hover:rotate-0 hover:shadow-xl`) on hover — the playful ledger slip inviting a pick-up.
- **Cards** are flat (`shadow-sm` invisible at rest) and gain `shadow-lg`/`shadow-xl` on hover; `shadow-2xl` is reserved for modals so the overlay reads as the one truly raised sheet.
- **Navbar** earns a translucent blur (`bg-paper-white/90 backdrop-blur`) at the top edge — the only persistent layering, used so content scrolls "under" the ledger cover.
- The landing's hero uses soft blurred brass glows (`bg-brass/20 blur-[110px]` + `blur-[120px]`) — atmosphere, not elevation; they signal the gilded edge, not a drop shadow.

### Named Rules

**The Flat-By-Default Rule.** Surfaces are flat at rest. Shadows appear only as a response to state — hover, open, focus — never as a permanent condition.

## Shapes

A consistent, restrained corner language. The base form is a gentle, hand-cut radius:

- **Surfaces** (cards, buttons, inputs, modals, tickets): `rounded-lg` (8px) — the workhorse radius.
- **Modals / large cards**: `rounded-xl` (12px) where they layer on the page.
- **Buttons on dark**: `rounded-lg` to match, keeping the two button families the same cut.
- **Chips, avatar, pill accents, status bubbles**: `rounded-full` (9999px) — reserved for genuinely pill-shaped elements only.
- Corners are never mixed aggressively; a screen should feel cut from one paper, so radius families stay at 8/12/16 and 9999 for pills only.

## Components

### Buttons

- **Shape:** Rounded corners (`rounded-lg`, 8px), medium `font-medium`, 44px+ touch height (`px-6 py-3`).
- **Primary:** Antique Brass (`#B8862B`) fill, Soft Ivory (`#FFFDF8`) text, with a 2px brass focus ring (`focus:ring-2 focus:ring-brass focus:ring-offset-2`). Hover lightens to Antique Brass Soft (`#D8AE5F`). The brass stamp in action — one per screen is the doctrine.
- **Secondary:** Soft Ivory fill, hairline `line` border, Midnight Ink text; hover warms the surface (`hover:bg-ink/5`).
- **On Dark:** Brass fill with Midnight Ink text (`btn-on-dark`); outline variant is a `paper-white/30` hairline border with transparent fill.
- **Danger:** Standard red family (`bg-red-600` → `bg-red-700`), full-width allowed on forms.

### Cards / Containers

- **Corner Style:** Rounded (`rounded-lg`/`rounded-xl`, 8/12px).
- **Background:** Soft Ivory (`#FFFDF8`), sitting on Warm Paper (`#F5F0E4`).
- **Border:** Hairline `line` (`rgba(20, 33, 61, 0.14)`) — printed on the paper, not drawn over it.
- **Shadow Strategy:** Flat at rest (`shadow-sm`), lifts on hover; `shadow-2xl` only for modals.
- **Internal Padding:** `p-6 md:p-8` (24–32px). The `ticket` variant adds a playful `rotate-1` and a small brass-stamped circle in the corner (`top-4 right-4`), straightening on hover.

### Inputs / Fields

- **Style:** Soft Ivory fill, hairline `line` border, `rounded-lg` (8px), `px-4 py-3` (44px+ tall), placeholder in Sober Slate.
- **Focus:** 2px brass focus ring + brass border shift (`focus:ring-2 focus:ring-brass focus:border-brass`) — the only place brass appears during input.
- **Label:** Above-field, `text-sm font-medium text-ink-soft` (`label-field`), `mb-2`.
- **Error / Disabled:** Red border + red focus ring (`border-red-500 focus:ring-red-500`), red helper text (`text-red-600`); disabled not yet specified beyond browser defaults.

### Chips / Status

- **Style:** Uppercase IBM Plex Mono `text-xs`, tinted background at low opacity (e.g. `bg-brass/10 text-brass`), `rounded-full` (9999px), tight `px-2.5 py-0.5`. Used for active nav items, status tags, and eyebrow badges.

### Navigation

- **App Navbar:** Sticky, translucent Soft Ivory (`bg-paper-white/90 backdrop-blur`), hairline bottom border (`border-b border-line`), `h-16`. Wordmark "Booked." in Fraunces bold with the brass period. Links are `text-sm font-medium`, resting in Sober Slate, active as brass text on a `brass/10` tint pill, hover ink-on-ink/5. Profile avatar is a `rounded-full` brass-tinted (`brass/15`) initial.
- **Mobile:** Hamburger toggles a full-width drawer (`border-t border-line bg-paper-white`) — same link treatment stacked, logout in red.
- **Footer:** Dark Midnight Ink, `paper-white/10` hairlines, Sober Slate links.

### The Ticket (Signature Component)

The `ticket` card is Booked.'s signature: a Soft Ivory ledger slip, `rounded-lg`, `rotate-1` at rest, a brass-stamped circle in the top-right corner, `p-6 md:p-8`. On hover it straightens (`rotate-0`) and lifts (`shadow-xl`). It carries the product's metaphor on the landing — the appointment slip you can almost pick up. It should never carry heavy data tables.

## Do's and Don'ts

### Do:
- **Do** keep Antique Brass below ~10% of any app screen — one primary brass action, brass only where it stamps meaning.
- **Do** use Warm Paper for page backgrounds and Soft Ivory for cards/inputs; the two-notch contrast is the depth system.
- **Do** set section eyebrows in uppercase IBM Plex Mono with wide tracking, in brass, above Fraunces serif headlines.
- **Do** keep surfaces flat at rest; lift cards and tickets only on hover.
- **Do** use hairline `line` borders (ink at 14% opacity) for dividers — they should read as printed on paper.
- **Do** use `rounded-lg` (8px) as the default cut and reserve `rounded-full` for genuine pills and avatars.

### Don't:
- **Don't** introduce pure white or neutral gray backgrounds, or pastel/SaaS gradients — paper tones are the world.
- **Don't** let the brass accent become a theme (every button brass, every icon brass, every hover brass); it is a stamp.
- **Don't** add persistent shadows to resting surfaces, or drop-shadow effects that fight the flat ledger language.
- **Don't** set body copy in Fraunces or headlines in IBM Plex Sans — serif display / sans body is the contract.
- **Don't** mix corner languages aggressively (a screen is cut from one paper); stay in the 8/12/16 + pill system.
- **Don't** decorate with photographic textures, glittering gradients, or emoji in place of the brass stamp.
