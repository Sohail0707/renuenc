import {defineConfig} from 'astro/config'
import sanity from '@sanity/astro'
import react from '@astrojs/react'
import {loadEnv} from 'vite'
import {createRequire} from 'node:module'
import {writeFile} from 'node:fs/promises'
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

/**
 * The Studio subdomain serves the same built output as the public site, so
 * without these two files it would be a second, indexable copy of the marketing
 * pages sitting on a URL nobody should land on.
 *
 *   _redirects  sends / straight to /studio
 *   _headers    tells search engines not to index any of it
 */
function studioSiteFiles() {
  return {
    name: 'renuenc:studio-site-files',
    hooks: {
      'astro:build:done': async ({dir, logger}) => {
        if (!IS_STUDIO_BUILD) return

        const out = fileURLToPath(dir)
        await writeFile(path.join(out, '_redirects'), '/    /studio/    302\n', 'utf8')
        await writeFile(
          path.join(out, '_headers'),
          '/*\n  X-Robots-Tag: noindex\n',
          'utf8'
        )
        logger.info('studio build: wrote _redirects (/ → /studio) and _headers (noindex)')
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
