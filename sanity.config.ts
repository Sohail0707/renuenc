import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './src/sanity/schemaTypes'

/**
 * Read a variable from wherever this file happens to be running.
 *
 * The Studio is bundled by Vite, where PUBLIC_* vars arrive on
 * `import.meta.env`. The same file is also loaded by the Sanity CLI in plain
 * Node (`npx sanity cors add …`, `npx sanity schema validate`), where only
 * `process.env` exists. Reading both keeps one config working in both.
 */
function readEnv(name: string): string | undefined {
  const fromVite = (import.meta as {env?: Record<string, string | undefined>}).env?.[name]
  if (fromVite) return fromVite

  if (typeof process !== 'undefined' && process.env?.[name]) return process.env[name]

  return undefined
}

const projectId = readEnv('PUBLIC_SANITY_PROJECT_ID')
const dataset = readEnv('PUBLIC_SANITY_DATASET')
const apiVersion = readEnv('PUBLIC_SANITY_API_VERSION') || '2024-10-01'

if (!projectId || !dataset) {
  // astro.config.mjs catches this first for `npm run dev`. This is the safety
  // net for anything that loads the Studio config on its own.
  throw new Error(
    'Sanity is not configured yet.\n\n' +
      'sanity.config.ts needs PUBLIC_SANITY_PROJECT_ID and PUBLIC_SANITY_DATASET.\n' +
      'Copy .env.example to .env and fill in the values from https://sanity.io/manage.\n'
  )
}

export default defineConfig({
  name: 'renuenc',
  title: 'Renue NC — Website Content',
  basePath: '/studio',

  projectId,
  dataset,

  plugins: [
    structureTool({
      // A flat, obvious sidebar: one entry, "Service pages". No nested folders
      // for a nervous editor to get lost in.
      structure: (S) =>
        S.list()
          .title('Website')
          .items([
            S.listItem()
              .title('Service pages')
              .schemaType('servicePage')
              .child(S.documentTypeList('servicePage').title('Service pages')),
          ]),
    }),
    // GROQ playground. Handy when demoing, invisible to the client otherwise.
    visionTool({defaultApiVersion: apiVersion}),
  ],

  schema: {
    types: schemaTypes,
  },
})
