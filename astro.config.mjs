import {defineConfig} from 'astro/config'
import sanity from '@sanity/astro'
import react from '@astrojs/react'
import {loadEnv} from 'vite'
import {createRequire} from 'node:module'
import {writeFile, rm, rename} from 'node:fs/promises'
import {existsSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import path from 'node:path'
import {readSanityEnv} from './env.mjs'

const require = createRequire(import.meta.url)

/**
 * Windows fix for the embedded Studio.
 *
 * @sanity/astro dedupes `sanity` and `styled-components` by aliasing them to
 * their package directory, which it derives with
 *
 *     require.resolve('sanity/package.json').replace(/\/package\.json$/, '')
 *
 * That regex only matches forward slashes. On Windows require.resolve returns
 * `…\sanity\package.json`, nothing is stripped, and the alias ends up pointing
 * at package.json itself. Every import of `sanity` — including the ~400 names
 * sanity/structure.js and @sanity/vision pull from it — then fails with
 * "No matching export in node_modules/sanity/package.json", and /studio never
 * mounts.
 *
 * This runs after every other config hook, finds any alias left pointing at a
 * package.json, and repoints it at that package's real entry file. It is a
 * no-op on macOS and Linux, where the upstream regex works.
 *
 * Remove once https://github.com/sanity-io/sanity-astro is fixed upstream.
 */
function repairPackageJsonAliases() {
  /** `…/node_modules/foo/package.json` -> that package's real entry file. */
  const entryFor = (id) => {
    const packageDir = path.dirname(id)
    try {
      const {name} = require(path.join(packageDir, 'package.json'))
      // Resolve from inside the package so we get its own entry, not a hoisted
      // copy somewhere else in node_modules.
      return require.resolve(name, {paths: [packageDir]})
    } catch {
      // Leave it alone rather than guess — a wrong alias is worse than none.
      return null
    }
  }

  const isPackageJson = (id) => typeof id === 'string' && id.endsWith('package.json')

  return {
    name: 'renuenc:repair-package-json-aliases',
    enforce: 'pre',

    // Fixes the copy of the alias table the dependency pre-bundler reads.
    configResolved(config) {
      for (const entry of config.resolve?.alias ?? []) {
        if (!isPackageJson(entry?.replacement)) continue
        const resolved = entryFor(entry.replacement)
        if (resolved) entry.replacement = resolved
      }
    },

    // ...and catches it at request time. Vite's own alias plugin runs before
    // every other resolver and re-resolves what it rewrote, so by the time this
    // hook sees the id it is already the bogus package.json path.
    resolveId(id) {
      if (!isPackageJson(id) || !id.includes('node_modules')) return null
      return entryFor(id)
    },
  }
}

// astro.config runs before Astro wires up import.meta.env, so read .env directly.
const env = loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), '')

const {projectId, dataset, apiVersion} = readSanityEnv(
  {...env, ...process.env},
  {context: 'The Astro site (astro.config.mjs)'}
)

/**
 * One repo, two Netlify sites, one branch.
 *
 *   BUILD_TARGET=site    (default)  the public site. No /studio route at all.
 *   BUILD_TARGET=studio             the Studio, on its own subdomain.
 *
 * Set it per-site in Netlify's environment variables. Locally it is unset, so
 * `npm run dev` gives you both on one port, which is what you want while
 * working.
 */
const BUILD_TARGET = (process.env.BUILD_TARGET ?? env.BUILD_TARGET ?? 'site').toLowerCase()

if (!['site', 'studio'].includes(BUILD_TARGET)) {
  throw new Error(
    `\n  BUILD_TARGET is "${BUILD_TARGET}", which is not a thing.\n` +
      `  It must be "site" (the public pages) or "studio" (the Studio).\n` +
      `  Leave it unset for local development.\n`
  )
}

const IS_STUDIO_BUILD = BUILD_TARGET === 'studio'
const IS_DEV = process.argv.includes('dev')

// Say out loud which of the two things is being built. Both Netlify sites run
// from the same repo, so the single most likely deploy mistake is the Studio
// site running the public build command — which fails silently and just serves
// a second copy of the marketing site. This line makes that obvious in the log.
if (!IS_DEV) {
  const banner = IS_STUDIO_BUILD
    ? 'STUDIO  — Sanity Studio served at /, nothing else, noindex'
    : 'PUBLIC SITE  — marketing pages only, no /studio route'
  console.log(`\n  Build target: ${banner}\n`)
}

/**
 * Turn the shared build output into a Studio-only site, with the Studio at the
 * ROOT of its subdomain — studio.example.com/, not studio.example.com/studio.
 *
 * @sanity/astro cannot emit the Studio at "/" directly: it normalises
 * studioBasePath by stripping slashes, so "/" becomes an empty string and the
 * integration rejects it as unset. The Studio therefore has to be built at
 * /studio and moved afterwards.
 *
 * Moving it is safe because a static build uses the Studio's HASH router
 * (the island exports StudioComponentHash) — all navigation lives in "#/", the
 * generated HTML contains no reference to its own path, and its asset URLs are
 * absolute. So the same file works served from anywhere.
 *
 * What this leaves:
 *
 *   dist/index.html   the Studio
 *   dist/_astro/…     its bundles
 *   dist/_headers     noindex for the whole subdomain
 *
 * and no marketing pages, so the Studio subdomain is not a second copy of the
 * public site. No redirect is involved at all, which also sidesteps Netlify's
 * rule that an existing file shadows a non-forced redirect.
 */
function studioSiteFiles() {
  // Everything the public site owns, and which the Studio site must not serve.
  const PUBLIC_SITE_OUTPUT = ['index.html', 'services']

  return {
    name: 'renuenc:studio-site-files',
    hooks: {
      'astro:build:done': async ({dir, logger}) => {
        if (!IS_STUDIO_BUILD) return

        const out = fileURLToPath(dir)
        const studioHtml = path.join(out, 'studio', 'index.html')

        if (!existsSync(studioHtml)) {
          throw new Error(
            '\n  The studio build produced no dist/studio/index.html.\n' +
              '  Refusing to rearrange the output, because that would leave an\n' +
              '  empty site. Check studioBasePath in astro.config.mjs.\n'
          )
        }

        // Clear the marketing output first — index.html is about to be replaced
        // by the Studio, and dist/services has no business on this domain.
        for (const entry of PUBLIC_SITE_OUTPUT) {
          const target = path.join(out, entry)
          if (!existsSync(target)) continue
          await rm(target, {recursive: true, force: true})
          logger.info(`removed ${entry} — not part of the Studio site`)
        }

        // Promote the Studio to the root, then drop the now-empty /studio.
        await rename(studioHtml, path.join(out, 'index.html'))
        await rm(path.join(out, 'studio'), {recursive: true, force: true})
        logger.info('moved the Studio to / — it is now the whole site')

        await writeFile(path.join(out, '_headers'), '/*\n  X-Robots-Tag: noindex\n', 'utf8')
        logger.info('wrote _headers (noindex)')
      },
    },
  }
}

// https://astro.build/config
export default defineConfig({
  // Everything is generated at build time. Content is fetched during the build
  // and baked into the HTML — nothing is fetched in the browser.
  output: 'static',

  // One server, one port. The site is at /, the Studio is at /studio — they are
  // the same Astro app, not two things to run. 3333 is Sanity's own default
  // Studio port and is the origin allowed in this project's CORS settings.
  server: {port: 3333},

  integrations: [
    sanity({
      projectId,
      dataset,
      apiVersion,
      // Static build: always hit the live API so a build never ships stale content.
      useCdn: false,
      // Omitting studioBasePath is what keeps the Studio out of the public
      // build entirely — not a redirect or a hidden route, it is simply never
      // generated. In dev we always want it, so both are on one port.
      ...(IS_DEV || IS_STUDIO_BUILD ? {studioBasePath: '/studio'} : {}),
    }),
    // Only the Studio uses React. None of it reaches the public pages.
    react(),
    studioSiteFiles(),
  ],

  vite: {
    plugins: [repairPackageJsonAliases()],
  },
})
