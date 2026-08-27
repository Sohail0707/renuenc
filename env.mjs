/**
 * Single source of truth for Sanity environment variables.
 *
 * Imported by astro.config.mjs (build/dev), by src/lib/sanity.ts (page render)
 * and by scripts/seed.mjs (seeding). Every one of those paths should fail with
 * the same readable message instead of a stack trace three layers deep in a
 * client library.
 */

/** @typedef {{name: string, required: boolean, why: string, example: string}} EnvVar */

/** @type {EnvVar[]} */
export const SANITY_ENV_VARS = [
  {
    name: 'PUBLIC_SANITY_PROJECT_ID',
    required: true,
    why: 'Which Sanity project to read content from.',
    example: 'abcd1234',
  },
  {
    name: 'PUBLIC_SANITY_DATASET',
    required: true,
    why: 'Which dataset inside that project (usually "production").',
    example: 'production',
  },
  {
    name: 'PUBLIC_SANITY_API_VERSION',
    required: false,
    why: 'Sanity API date to pin to. Defaults to 2024-10-01 when unset.',
    example: '2024-10-01',
  },
  {
    name: 'SANITY_API_WRITE_TOKEN',
    required: false,
    why: 'Editor token. Only the seed script needs it; the site never does.',
    example: 'skXXXXXXXX...',
  },
]

export const DEFAULT_API_VERSION = '2024-10-01'

class MissingEnvError extends Error {
  constructor(/** @type {string} */ message) {
    super(message)
    this.name = 'MissingSanityConfig'
    // A stack here is noise — the message is the whole point.
    this.stack = message
  }
}

/**
 * Build the human-readable "you forgot to fill in .env" message.
 * @param {string[]} missing
 * @param {string} context
 */
function explain(missing, context, lead) {
  const lines = [
    '',
    '  ┌───────────────────────────────────────────────────────────────┐',
    '  │  Sanity is not configured yet.                                │',
    '  └───────────────────────────────────────────────────────────────┘',
    '',
    lead ?? `  ${context} needs these environment variables, and they are missing:`,
    '',
  ]

  for (const name of missing) {
    const spec = SANITY_ENV_VARS.find((v) => v.name === name)
    lines.push(`    • ${name}`)
    if (spec) lines.push(`        ${spec.why}`)
  }

  lines.push(
    '',
    '  To fix this:',
    '',
    '    1. Copy .env.example to .env   →   cp .env.example .env',
    '    2. Open .env and fill in the real values.',
    '       Project ID and dataset are on https://sanity.io/manage',
    '       (pick your project → the ID is shown at the top).',
    '       An editor token, if you need one, is under API → Tokens.',
    '    3. Run the command again.',
    '',
    '  If you are deploying, set the same variables in your host\'s',
    '  environment settings (on Netlify: Site configuration → Environment',
    '  variables) — .env is not uploaded.',
    ''
  )

  return lines.join('\n')
}

/**
 * Validate and normalise Sanity config from a plain object of env values.
 *
 * @param {Record<string, string | undefined>} source
 * @param {{context?: string, requireWriteToken?: boolean}} [options]
 * @returns {{projectId: string, dataset: string, apiVersion: string, token: string | undefined}}
 */
export function readSanityEnv(source, options = {}) {
  const {context = 'This site', requireWriteToken = false} = options

  const get = (/** @type {string} */ name) => {
    const value = source?.[name]
    return typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined
  }

  const projectId = get('PUBLIC_SANITY_PROJECT_ID')
  const dataset = get('PUBLIC_SANITY_DATASET')
  const apiVersion = get('PUBLIC_SANITY_API_VERSION') ?? DEFAULT_API_VERSION
  const token = get('SANITY_API_WRITE_TOKEN')

  // Checked first, and on its own: someone who copied .env.example without
  // editing it is also missing the token, and being told about the token is not
  // the useful half of that message.
  if (projectId === 'your-project-id') {
    throw new MissingEnvError(
      explain(
        [],
        context,
        `  .env still has the placeholder value from .env.example:\n` +
          `\n      PUBLIC_SANITY_PROJECT_ID=your-project-id\n` +
          `\n  ${context} needs your real project ID here.`
      )
    )
  }

  const missing = []
  if (!projectId) missing.push('PUBLIC_SANITY_PROJECT_ID')
  if (!dataset) missing.push('PUBLIC_SANITY_DATASET')
  if (requireWriteToken && !token) missing.push('SANITY_API_WRITE_TOKEN')

  if (missing.length > 0) {
    throw new MissingEnvError(explain(missing, context))
  }

  return {
    projectId: /** @type {string} */ (projectId),
    dataset: /** @type {string} */ (dataset),
    apiVersion,
    token,
  }
}
