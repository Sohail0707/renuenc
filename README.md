# Renue Systems of North Carolina — demo site + page builder

A hand-coded rebuild of the top of **renuenc.com**, now running on Astro with a
Sanity Studio embedded at `/studio`.

The point of the build is the Studio. Service pages are assembled from five
section blocks that the owner can **drag into any order**, each with layout
dropdowns that visibly change the page. Nothing about the page order or the
layout is fixed in code.

```
astro.config.mjs        Astro + Sanity wiring, reads .env
sanity.config.ts        the Studio: schema, sidebar, plugins
sanity.cli.ts           only for `npx sanity …` commands
env.mjs                 env-var validation, shared by the site and the seed script
.env.example            copy to .env and fill in

src/
  pages/
    index.astro         home page — the original hero, plus a list of service pages
    services/[slug].astro   one static page per servicePage in Sanity
  components/
    Hero.astro          hero + trust strip, markup unchanged from the static build
    Masthead.astro      nav bar
    UtilityBar.astro    phone + social strip
    PortableText.astro  rich text -> HTML, at build time
    sections/           one component per section type, plus SectionRenderer
  sanity/schemaTypes/   the schema the client actually sees
  styles/
    style.css           the original stylesheet, untouched
    sections.css        the page-builder sections, built on the same tokens
  lib/                  Sanity client, GROQ queries, types

scripts/
  seed-content.mjs      the starter page copy — plain strings, edit freely
  seed.mjs              uploads photos, writes the document
seed/images/            drop the real photos here (git-ignored)
public/images/          hero photo and logo
```

---

## 1. Fill in `.env`

```bash
cp .env.example .env
```

Then open `.env` and set:

| Variable | Where to get it |
| --- | --- |
| `PUBLIC_SANITY_PROJECT_ID` | [sanity.io/manage](https://sanity.io/manage) → your project → shown at the top |
| `PUBLIC_SANITY_DATASET` | usually `production` |
| `PUBLIC_SANITY_API_VERSION` | leave as `2024-10-01` |
| `SANITY_API_WRITE_TOKEN` | Editor token, for seeding and the deploy hook — see step 3 |

If you don't have a Sanity project yet:

```bash
npx sanity login
```

```bash
npx sanity init --create-project "Renue NC" --dataset production
```

Nothing is hardcoded. If a variable is missing the app stops with a plain-English
message telling you which one and how to fix it — not a stack trace. `.env` is
git-ignored.

## 2. Run it

```bash
npm install
```

```bash
npm run dev
```

**One server, one port.** The site and the Studio are the same Astro app:

| | |
| --- | --- |
| Site | <http://localhost:3333> |
| Studio | <http://localhost:3333/studio> |

There is nothing else to start. The port is set in `astro.config.mjs`, so
`npm run dev` needs no flags.

Why 3333 and not Astro's default 4321: a Studio origin has to be registered with
your Sanity project *and* allow credentialed requests, and 3333 is the one that
is. If you ever want a different port, register it first:

```bash
npx sanity cors add http://localhost:3333 --credentials
```

`--credentials` is not optional. If the Studio loads but says *"Enable
credentials for this Studio"*, the origin is allowed but was added without that
flag, and login and saving will not work. CORS entries cannot be edited — delete
and re-add:

```bash
npx sanity cors delete http://localhost:3333
```

## 3. Seed the starter page

```bash
npm run seed
```

That creates **Tile and Grout Cleaning** at `/services/tile-and-grout-cleaning`
with six sections — every section type used once, and the first two set to
"Image right" then "Image left" so the layout dropdown proves itself without
anyone touching a setting.

It needs `SANITY_API_WRITE_TOKEN` in `.env` (sanity.io/manage → **API** →
**Tokens** → **Add API token**, permissions **Editor**). Nothing else uses that
token — it does not go on Netlify.

Re-running overwrites the same document instead of creating a duplicate, so it is
safe to run as often as you like while you edit the copy.

### About that copy

`scripts/seed-content.mjs` holds all of it as plain strings — no Sanity API,
nothing that can break the build. **It is not the live renuenc.com text**:
that site blocks automated requests, so this is original copy written for the
trade — accurate about how commercial tile and grout cleaning works, and free of
invented statistics or case studies. The header comment in that file lists the
three things worth checking against the live page before a client sees it.

Photos all point at `seed/images/placeholder.jpg`, which is the ballroom photo
reused — obviously a stand-in. Drop real photos into `seed/images/`, update the
`imageFile` names, re-run. A name with no matching file is skipped with a
warning rather than failing the run.

Once you are editing in the Studio rather than reseeding, this script has done
its job and you can forget about it.

## 4. Deploy to Netlify — two sites, one repo

The public site and the Studio go to **two separate Netlify sites built from the
same repo and branch**. The only thing that differs is one environment variable:

| | `BUILD_TARGET` | Result |
| --- | --- | --- |
| Public site | `site` (or unset) | No `/studio` route is generated at all |
| Studio | `studio` | `/` redirects to `/studio`, whole site `noindex` |

`netlify.toml` holds the build command and publish directory for both, so there
is nothing to configure per-site except the environment variables.

### A note on the subdomain

`studio.renuenc.netlify.app` **is not possible.** Netlify site names allow only
letters, numbers and hyphens — no dots — so a free Netlify subdomain is always a
single label: `something.netlify.app`. You cannot add a dotted third level to it,
because you do not control DNS for `netlify.app`.

Two options that do work:

- **`renuenc-studio.netlify.app`** — just name the second site `renuenc-studio`.
  Nothing else changes.
- **`studio.renuenc.com`** — the real answer once the domain is in play. Add it
  as a custom domain on the Studio site and point a CNAME at it. This is what
  you want in production anyway; the client should never see a netlify.app URL.

Nothing in the code depends on the hostname, so switching later is a DNS change
and one CORS entry, not a rebuild.

### Site 1 — the public site

1. Netlify → **Add new site → Import an existing project** → pick the repo.
2. Leave the build settings alone; `netlify.toml` supplies them.
3. **Site configuration → Environment variables**, add:
   - `PUBLIC_SANITY_PROJECT_ID`
   - `PUBLIC_SANITY_DATASET`
   - `PUBLIC_SANITY_API_VERSION`
   - `BUILD_TARGET` = `site`  *(optional — it is the default)*
4. Deploy.

Do **not** put `SANITY_API_WRITE_TOKEN` on either site. Only `npm run seed` uses
it, and a write token has no business on a web host.

### Site 2 — the Studio

1. **Add new site → Import an existing project** → the **same repo**.
2. **Site configuration → General → Site details → Change site name** →
   `renuenc-studio`.
3. Environment variables: the same three `PUBLIC_SANITY_*` values, plus
   - `BUILD_TARGET` = `studio`
4. Deploy.
5. Register the Studio's URL with Sanity, or it will refuse to log you in:

```bash
npx sanity cors add https://renuenc-studio.netlify.app --credentials
```

`--credentials` is not optional — see the note in step 2.

## 5. Make Publish rebuild the site

Content is fetched at build time, so publishing in the Studio changes nothing
until a build runs. Point Sanity at a Netlify build hook and the Publish button
does it for you.

**Get the build hook** (already done for this project):
Netlify → the **public** site → **Site configuration → Build & deploy → Build
hooks → Add build hook**. Copy the URL. For this project it is:

```
https://api.netlify.com/build_hooks/6a903ddc07893270cb045aa0
```

**Create the webhook** at sanity.io/manage → project `243k5ekb` → **API** →
**Webhooks** → **Create webhook**:

| Field | Value |
| --- | --- |
| Name | `Netlify rebuild on publish` |
| URL | the build hook URL above |
| Dataset | `production` |
| Trigger on | Create, Update, Delete |
| Filter | `_type == "servicePage"` |
| HTTP method | `POST` |
| API version | `v2021-03-25` |
| Drafts | **off** |

The last two rows are the ones that matter. Without the **filter**, every image
upload triggers a build. Without **drafts off**, every autosave does — and the
Studio autosaves constantly, so you would burn a build every few seconds while
someone is typing.

This has to be done in the UI. Sanity's public management API only exposes the
older webhook type, which has no filter and fires on every mutation in the
dataset — exactly the build-spamming behaviour above. The filtered kind is only
creatable from Manage or the interactive CLI prompt.

**Check it works:** publish a change, then Netlify → **Deploys** should show a
build starting within a few seconds. Delivery history is at sanity.io/manage →
**API → Webhooks →** the hook **→ Deliveries**.

A build takes a minute or two, so Publish is not instant. That is inherent to a
statically generated site and worth saying out loud when demoing, so a slow
refresh does not read as a bug.

---

## The page builder

One document type, **Service page**, with a `sections` array. Five section types:

| Section | What it is | Layout options |
| --- | --- | --- |
| Text with a photo beside it | heading, rich text, photo | Image right / Image left · White / Light grey |
| Tick-list of what's included | heading, intro, list of lines | Two / Three columns |
| Row of cards with photos | heading, intro, photo cards | White / Light grey / Brand green |
| Questions and answers | heading, question + answer pairs | One / Two columns |
| Before and after photos | heading, intro, photos | — |

Five, deliberately. A long "Add item" menu is the thing that makes a CMS feel
complicated, which is the opposite of what this demo is for.

**Reordering.** The sections list is drag-sortable. Grab a section by the handle
on its left, drop it somewhere else, publish, rebuild — the page follows. There is
no second list of positions anywhere in the code: `SectionRenderer.astro` maps
each entry's `_type` to a component and renders the array in the order Sanity
returns it.

**Editor experience.** Every field has a title in business language ("Photos", not
"imageArray") and a description explaining the practical constraint — "Three cards
fit neatly on a row. Four will wrap." Every section type has its own icon and a
preview line, so the sections list reads as *"Our process · Row of cards · 3 cards
· Brand green"* rather than a column of "Object".

**Layout options do real work.** "Image left" and "Image right" swap the two grid
columns while leaving the reading order in the HTML unchanged, so the page changes
visibly and screen readers still get text before photo. Backgrounds are one CSS
class per dropdown value; on Brand green the text flips to white automatically.

### Adding a sixth section type

One schema file in `src/sanity/schemaTypes/sections/`, one line in that folder's
`index.ts`, one component in `src/components/sections/`, one line in the
`COMPONENTS` map in `SectionRenderer.astro`. Nothing else knows about section
types.

---

## How it is built

- **Static generation.** Every service page is a real `.html` file with the copy
  already in the markup. `getStaticPaths` fetches from Sanity during the build.
  Nothing is fetched in the browser, so Google and a JavaScript-off visitor both
  see the full page.
- **No page-builder library, no Tailwind.** Plain CSS on the custom properties the
  hero already declared — `--brand-green`, `--ink`, `--font-head`, `--wrap`,
  `--gutter`. `sections.css` adds three tokens (`--grey-bg`, `--line`, `--muted`)
  and touches none of the hero's selectors.
- **No client-side JavaScript on the public pages.** The FAQ accordion is native
  `<details>`/`<summary>`. The only script is the ten lines that open the mobile
  menu, unchanged from the static build. React ships with the Studio only.
- **Responsive at 375, 768 and 1280.** Every multi-column layout collapses to one
  column on a phone; the text/photo split stacks with the photo on top under both
  layout settings. No horizontal overflow at any of the three widths.

### Known workaround

`astro.config.mjs` carries a plugin called `repairPackageJsonAliases`. It exists
because `@sanity/astro` dedupes `sanity` by stripping `/package.json` off a
resolved path with a forward-slash-only regex, which never matches on Windows —
so the alias points at `package.json` itself and the Studio dies with ~400
"No matching export in sanity/package.json" errors. The plugin repoints any alias
left aiming at a `package.json` to that package's real entry file. It is a no-op
on macOS and Linux, and should be deleted once the bug is fixed upstream.

The project is pinned to **Astro 5**. Astro 7's rolldown-based bundler hits the
same Sanity resolution problem through a different code path.

---

## What's real vs. what's demo

**Real, pulled from the live site — nothing substituted with stock:**

- `public/images/hero-ballroom.jpg` is their own ballroom photo
  (`wp-content/uploads/2026/02/ball-room-and-meeting-room-scaled.jpg`), one of the
  four slides in their current hero slideshow.
- `public/images/renue-nc-logo.png` is the actual RenueNC logo file.
- **Brand green `#6DA858`** and **brand blue/teal `#75AADE`** are sampled, not
  guessed. Both are Elementor global colours in the live stylesheet, and both were
  confirmed by reading pixels out of the logo PNG. They're `--brand-green` and
  `--brand-teal` at `:root`.
- **Fonts match the live site**: Barlow Condensed for headings, Manrope for body.

**Demo shortcuts, deliberate:**

- Nav and hero `href`s are still `#`. "Our Services" has a caret but no dropdown.
- The hospitality brands in the trust strip are styled text rather than logo
  images — the right call for a pitch asset, since it avoids using Marriott / IHG /
  Best Western / Avendra trademark files, and reads as restraint rather than a
  missing asset.
- Service pages use a plain dark page head rather than a photo hero, so the
  section blocks are what the eye goes to.

## The three things the hero fixes

1. **The hero is actually a hero.** On the current site the photo is inset with
   white margins and sits under a green band, so it reads as a boxed Elementor
   banner rather than the top of a page. Here the photo is full-bleed edge to
   edge, the nav sits directly on it, and a left-weighted gradient carries the
   copy — strongest behind the text, clearing toward the right so the ballroom is
   still doing its job.

2. **Credibility moved above the fold.** The hospitality brand logos are currently
   buried near the footer, where a GM evaluating vendors will never see them.
   They're now a quiet band along the bottom edge of the hero. Low emphasis on
   purpose; it's a signal, not a billboard.

3. **Two CTAs, one of them the phone.** The current hero offers a single "Get
   Started" button and no phone CTA, despite the phone being the likely primary
   conversion path for a facilities manager who wants a quote today. There are now
   two, and on mobile they stack full-width.

## Accessibility

- Semantic `header` / `nav` / `h1`, a real `<button>` for the menu toggle, alt
  text on the logo, `aria-label`s on the icon-only links.
- Visible `:focus-visible` outlines on every interactive element.
- The hero image carries explicit `width`/`height` and the logo has an
  `aspect-ratio`, so nothing shifts on load. Section images do the same.
- The only motion is a 0.5s fade-and-rise on the hero copy and the FAQ's rotating
  plus sign, both disabled under `prefers-reduced-motion`.
- Every image field in the Studio has a companion "Photo description" field with a
  description explaining what alt text is for, in the client's terms.
