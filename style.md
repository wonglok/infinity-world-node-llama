# Design Prompt — Ethereal Sky "Links" Page

**Vibe:** A serene, heavenly dawn sky meeting a classical manuscript page. Romantic, luminous, calm — as if browsing links from inside a Renaissance painting.

## Atmosphere

- A full-viewport **sky gradient** that fades from cool blue-grey at top (`#c9ddf0`) through soft lavender (`#e2daea`), warm cream (`#f5ece1`), and settles into pearl (`#faf6ef`) at the bottom. It reads as early-morning light after rain.
- **Drifting clouds** — 5–6 soft, blurred white radial-gradient ellipses, each with pseudo-element lumps, animated to slide slowly horizontally at different speeds and directions. High blur (30-50px), low opacity (0.5–0.85). They move but feel weightless.
- **Golden light rays** radiating from the top of the viewport — large radial-gradient ellipses in warm cream/ivory at low opacity (0.3–0.4), overlaying the sky.
- **Sparkle particles** — tiny 3px gold dots scattered across the upper third of the page, pulsing in and out with a shimmer keyframe (opacity 0 → 0.9 → 0.3 → 0.7, with scale). They have a soft gold box-shadow glow. Laid out with staggered animation delays so they feel random and alive.

## Typography

- **Headings:** Playfair Display, weight 400 — a high-contrast elegant serif. Generous tracking (0.04em). Dark warm brown (`#4a3f35`). No uppercase — rely on the typeface's own dignity.
- **Body / links / footer:** Cormorant Garamond, weight 400–500 — refined literary serif with a lighter color (`#8a7b6e`). Slightly loose tracking (0.03–0.05em) for airiness.
- Fallback stack: Georgia, serif.

## Color Palette

| Role         | Hex       |
| ------------ | --------- |
| Text (dark)  | `#4a3f35` |
| Text (light) | `#8a7b6e` |
| Pearl / page | `#faf7f2` |
| Light gold   | `#e8d5b0` |
| Medium gold  | `#c9a96e` |
| Cloud white  | `#ffffff` |

## Layout

- Centered single-column, max-width ~520px, generous vertical padding.
- Title at top, underlined by a thin horizontal gold gradient rule (center solid gold, fading to transparent at both ends).
- An **ornamental divider** between title and links: an SVG with a gentle swooping curve path, three small gold circles (the center one larger), all in low-opacity gold. Feels like a book ornament or filigree.
- **Link cards** stacked vertically with ~18px gap.

## Link Cards (hero component)

- **Frosted glass:** `rgba(255,255,255,0.45)` background with `backdrop-filter: blur(12px)`, rounded 16px corners, and a 1px semi-transparent white border.
- **Layered shadows:** a soft warm outer shadow (`rgba(180,160,140,0.12)`), plus a subtle white inner highlight (`inset 0 0 0 1px rgba(255,255,255,0.3)`). This gives a luminous, dimensional quality — the card feels backlit.
- **Hover state:** card lifts 2px, background brightens to 65% opacity, border becomes more opaque, and a warm gold outer glow appears (`0 0 60px rgba(232,213,176,0.25)`). A pseudo-element reveal adds a radial highlight sweeping down from the top edge. Transitions use a 0.4s cubic-bezier(0.25, 0.1, 0.25, 1) curve — smooth, weighty, elegant.
- **Active state:** subtle 0.985 scale press.

## Motion

- **Entrance:** All main elements (heading, ornament, links, footer) animate in with `fadeDown` — opacity 0→1, translateY -20px→0. The heading goes first, ornament follows at 0.2s delay, links at 0.4s, footer at 0.6s. The image enters last (0.8s) with a gentle `fadeUpFloat` that overshoots slightly and settles.
- **Ambient perpetual:** clouds drift horizontally (28–50s cycles), particles pulse on staggered 3.5–5.5s loops. The page is never truly still.
- **Interactions:** card hover lift + glow, active press. No jarring transitions.

## Accent elements

- A rounded image at the bottom (80% width, 30px border-radius) with the same fadeUpFloat entrance.
- Footer in italic, centered, light color: "✦ · 樂樂感謝您 · ✦" — warm, personal, a benediction.

## Keywords for generation

_dreamy sky, frosted glass, classical serif, gold filigree, drifting clouds, luminous particles, Renaissance manuscript, soft dawn light, effervescent, pearl, heirloom elegance_
