# Renue Systems of North Carolina — hero rebuild (demo)

A hand-coded rebuild of the top of **renuenc.com**: utility bar, nav, hero, and a
trust strip. Hero only — the page ends cleanly below it. No framework, no build
step, no npm.

```
index.html
style.css
images/
  hero-ballroom.jpg      2560 × 1654
  renue-nc-logo.png       315 × 124
```

## Deploy to Netlify (drag and drop)

1. Go to <https://app.netlify.com/drop>.
2. Drag this whole folder (the one containing `index.html`) onto the drop zone.
3. Netlify gives you a live URL in a few seconds. That's the demo link.

No build command, no environment variables, no configuration. Opening
`index.html` directly from disk works too, though a local static server
(`python -m http.server`) is closer to how it will actually be served.

## What's real vs. what's demo

**Real, pulled from the live site — nothing substituted with stock:**

- `images/hero-ballroom.jpg` is their own ballroom photo
  (`wp-content/uploads/2026/02/ball-room-and-meeting-room-scaled.jpg`), one of
  the four slides in their current hero slideshow.
- `images/renue-nc-logo.png` is the actual RenueNC logo file.
- **Brand green `#6DA858`** and **brand blue/teal `#75AADE`** are sampled, not
  guessed. Both are Elementor global colours in the live stylesheet, and both
  were confirmed by reading pixels out of the logo PNG. They're defined as
  `--brand-green` and `--brand-teal` at `:root`.
- **Fonts match the live site**, not an approximation: their headings are
  **Barlow Condensed** and their body text is **Manrope**. Both loaded from
  Google Fonts (the only external request on the page).

**Demo shortcuts, deliberate:**

- Every `href` is `#`. Nothing navigates.
- "Our Services" has a visual caret but no dropdown.
- The hospitality brands in the trust strip are set as styled text rather than
  logo images. That's the right call for a pitch asset — it avoids using
  Marriott / IHG / Best Western / Avendra trademark files in a demo, and it
  reads as intentional restraint rather than a missing asset.
- The only JavaScript on the page is ~10 lines that open and close the mobile
  menu.

## The three things this fixes

1. **The hero is actually a hero.** On the current site the photo is inset with
   white margins and sits under a green band, so it reads as a boxed Elementor
   banner rather than the top of a page. Here the photo is full-bleed edge to
   edge, the nav sits directly on it, and a left-weighted gradient carries the
   copy — strongest behind the text, clearing toward the right so the ballroom
   is still doing its job.

2. **Credibility moved above the fold.** The hospitality brand logos are
   currently buried down near the footer, where a GM evaluating vendors will
   never see them. They're now a quiet band along the bottom edge of the hero:
   "Preferred deep cleaning partner for — Marriott · IHG · Best Western ·
   Avendra." Low emphasis on purpose; it's a signal, not a billboard.

3. **Two CTAs, one of them the phone.** The current hero offers a single
   "Get Started" button and no phone CTA, despite the phone number being the
   likely primary conversion path for a facilities manager who wants a quote
   today. There are now two: a solid green "Get a Free Quote" and an outlined
   "Call 919-307-1778" beside it. On mobile they stack full-width.

A fourth, smaller fix worth noting in the pitch: the current H1 is set loose,
which is a lot of why it reads as templated. Here it's `clamp()`-scaled with a
1.05 line-height and slight negative tracking, so it holds its shape from 375px
to 1920px.

## Responsiveness and accessibility

- Tested at **375, 768, 1280, and 1920**. No horizontal overflow at any width.
- Under 900px the nav collapses to a hamburger; the trust strip stacks and
  scrolls horizontally.
- At 375px the gradient switches from a left wash to a top-to-bottom one,
  because at that width the copy spans the full column and a left-only wash
  leaves the right edge of the text sitting on bare photo.
- Semantic `header` / `nav` / `h1`, a real `<button>` for the menu toggle, alt
  text on the logo, and `aria-label`s on the icon-only links.
- Visible `:focus-visible` outlines on every interactive element.
- The hero image carries explicit `width`/`height` and the logo has an
  `aspect-ratio`, so nothing shifts on load.
- The only motion is a 0.5s fade-and-rise on the hero copy, disabled under
  `prefers-reduced-motion`. No parallax, no animated gradients.
