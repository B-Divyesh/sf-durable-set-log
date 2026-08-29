# Durable Set Log — visual thesis

## Direction: the training-room duplicate

Durable Set Log looks like a small risograph training card that has survived in
a gym bag: fibrous stock, imperfect ink registration, blunt stamped numbers,
and electric overprint accents. That physical metaphor supports the product's
promise. Every confirmed set should feel impressed into a ledger, not floated
in a temporary dashboard. Decoration is limited to the opening illustration,
paper grain, registration marks, and compact stamp-like status labels.

The product is intentionally single-mode. A dark theme would turn the paper
and ink metaphor into a different product; instead, the warm paper canvas is
painted explicitly and uses tested high-contrast inks.

## Palette

| Token | Hex | Role |
| --- | --- | --- |
| `paper` | `#F2E9D8` | warm recycled-stock background |
| `sheet` | `#FFF9EC` | raised working surface |
| `ink` | `#171A17` | primary type and key outlines |
| `ink-muted` | `#56574E` | secondary copy (7.0:1 on paper) |
| `violet` | `#5B2A86` | primary action / first riso pass |
| `violet-deep` | `#35134F` | pressed state and links |
| `coral` | `#D94B3D` | second riso pass / attention |
| `yellow` | `#F2C94C` | selection and overprint highlight |
| `green` | `#1F6B4F` | durable/saved confirmation |
| `danger` | `#A32828` | destructive/error copy |

Primary actions use deep violet with cream text (contrast above 9:1). Status is
always expressed with words or icons as well as color. Fine coral is decorative
only; it is not used for small body text.

## Typography

- Display: `Arial Black`, `Arial Narrow Bold`, sans-serif. Compact uppercase
  headings recall stamped workout cards without shipping a font payload.
- Interface and reading: `ui-rounded`, `system-ui`, `-apple-system`, `Segoe UI`,
  sans-serif. Numerals use `font-variant-numeric: tabular-nums`.
- Scale: 14px metadata, 16px labels, 18px body, 23px section heading, fluid
  34–52px h1. Body leading is 1.5 and copy measures never exceed 68ch.

## Spacing, shape, and depth

- An 8px base rhythm with 4px micro spacing: `4, 8, 12, 16, 24, 32, 48`.
- Touch controls are at least 48px; the one-handed set action is 64px tall.
- Corners are slightly clipped (2–10px), avoiding generic pill/card styling.
- Depth comes from offset ink shadows (`4px 4px 0`) and paper layers, not blur.
- Independent routines and ledger entries may use cards; related form controls
  are grouped by proximity on a single sheet.

## Interaction grammar

- Confirming a set creates a brief physical press: the button drops into its
  offset shadow, then a green “Saved on this device” receipt appears.
- Corrections open the historical entry and append a replacement event. The
  ledger labels the earlier event “corrected” instead of hiding it.
- The persistent bottom navigation keeps Workout, Routines, Ledger, and More
  within thumb reach. Desktop converts this into a horizontal top rail.
- Offline status is calm and explicit: an “Offline · still saving” stamp.
- Empty states are instructional and always end in a direct action.

## Motion policy

Motion lasts 160–240ms and only communicates a press, inserted ledger row, or
sheet transition. Only transforms and opacity animate. Nothing loops. Under
`prefers-reduced-motion: reduce`, transitions are removed and state changes are
instant; spatial hierarchy, labels, and offset shadows remain.

## Original asset plan and prompt sheet

One wide hero illustration shows a chalky hand stamping a completed set into a
paper ledger beside a simple barbell plate, communicating capture and physical
durability without showing a person or implying coaching.

**Generation prompt (verbatim):**

> Use case: stylized-concept. Asset type: responsive PWA opening illustration.
> Scene/backdrop: warm recycled paper field. Subject: close crop of one simplified
> chalk-dusted hand pressing a square rubber stamp onto a workout ledger card,
> with one cropped barbell plate and three abstract tally blocks. Style/medium:
> original two-colour risograph editorial collage, chunky cut-paper silhouettes,
> visible soy-ink halftone dots, subtle misregistration, fibrous paper grain.
> Composition/framing: wide 3:2 landscape, strong silhouette, generous calm
> negative space, no UI mockup. Lighting/mood: flat printmaking, tactile,
> dependable, energetic. Color palette: deep aubergine violet, tomato coral,
> mustard yellow overprint, forest green, warm cream paper, near-black ink.
> Constraints: anatomically plausible hand with five fingers, simple equipment,
> no text, no letters, no numbers, no watermark, no logos, no brands, no
> gradients, no photorealism, no extra limbs, no medical imagery.

Generated output is reviewed for anatomy, accidental marks, brands, and palette,
then cropped and optimized to responsive AVIF/WebP plus PNG source. The source
PNG and JSON sidecar live in `assets/src/`; shipped derivatives live in `public/`.
Generated imagery is original to this product. Model/deployment: Azure OpenAI
`factory-image` via `/opt/fleet/lib/gen-image.sh`; generation date 2026-08-28.
The 1200×630 social preview is a center crop of that same reviewed source,
created locally with ImageMagick on 2026-08-29; no new generated content was
introduced.

All interface icons and the app mark are original inline/SVG geometric drawings
authored for this repository and released under the project MIT license.
