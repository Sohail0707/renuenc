/**
 * Make the Studio's Publish button rebuild the public site.
 *
 *   npm run setup:deploy-hook -- https://api.netlify.com/build_hooks/XXXXXXXX
 *
 * Creates a GROQ-powered Sanity webhook that pings a Netlify build hook when a
 * service page is published, unpublished or deleted.
 *
 * Where the Netlify URL comes from:
 *   Netlify -> the PUBLIC site -> Site configuration -> Build & deploy
 *   -> Build hooks -> Add build hook -> copy the URL
 *
 * Two details do the real work and are easy to get wrong by hand:
 *
 *   rule.filter    only service pages. Without it, every image upload builds.
 *   includeDrafts  false. The Studio autosaves constantly; without this you
 *                  would burn a build every few seconds while someone types.
 *
 * Re-running replaces the existing hook rather than adding a second one, so you
 * never end up with two builds per publish.
 *
 * API notes, because they cost an afternoon:
 *   - The endpoint is the PROJECT subdomain, not api.sanity.io.
 *   - GROQ webhooks need `type: 'document'` and the nested `rule` object.
 *     A flat `on`/`filter` is the older "transaction" hook, which has no filter
 *     and fires on every mutation in the dataset.
 *   - Listing them requires the vX API. The dated versions return
 *     "Document hook not supported in this API version" and an empty array,
 *     which looks exactly like having no webhooks at all.
 */

import 'dotenv/config'
import {readSanityEnv} from '../env.mjs'

const HOOK_NAME = 'Netlify rebuild on publish'

const buildHookUrl = process.argv[2]

function usage(message) {
  console.error(
    `\n  ${message}\n\n` +
      '  Usage:\n' +
      '    npm run setup:deploy-hook -- <netlify-build-hook-url>\n\n' +
      '  Get the URL from Netlify, on the PUBLIC site:\n' +
      '    Site configuration -> Build & deploy -> Build hooks -> Add build hook\n\n' +
      '  It looks like:\n' +
      '    https://api.netlify.com/build_hooks/64f0a1b2c3d4e5f6a7b8c9d0\n'
  )
  process.exit(1)
}

if (!buildHookUrl) usage('No Netlify build hook URL given.')
if (!/^https:\/\/api\.netlify\.com\/build_hooks\/\w+/.test(buildHookUrl)) {
  usage(`That does not look like a Netlify build hook URL:\n    ${buildHookUrl}`)
}

const {projectId, dataset, token} = readSanityEnv(process.env, {
  context: 'The deploy-hook setup script',
  requireWriteToken: true,
})

const BASE = `https://${projectId}.api.sanity.io`

async function sanity(path, init = {}) {
  const response = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...init.headers,
    },
  })

  const text = await response.text()
  const body = text ? JSON.parse(text) : null

  if (!response.ok) {
    const error = new Error(body?.message || `${response.status} ${response.statusText}`)
    error.statusCode = response.status
    throw error
  }

  return body
}

async function main() {
  console.log(`\n  Project ${projectId}, dataset ${dataset}\n`)

  // Only the vX listing renders document hooks; the dated versions return [].
  const existing = await sanity(`/vX/hooks/projects/${projectId}`)
  const previous = (existing ?? []).find((hook) => hook.name === HOOK_NAME)

  const definition = {
    type: 'document',
    name: HOOK_NAME,
    description: 'Rebuilds the public Netlify site when a service page is published.',
    url: buildHookUrl,
    dataset,
    rule: {
      on: ['create', 'update', 'delete'],
      filter: "_type == 'servicePage'",
      projection: '{_id}',
    },
    httpMethod: 'POST',
    apiVersion: 'v2021-03-25',
    includeDrafts: false,
  }

  if (previous) {
    await sanity(`/vX/hooks/projects/${projectId}/${previous.id}`, {
      method: 'DELETE',
    })
    console.log(`  Removed the previous "${HOOK_NAME}" webhook.`)
  }

  const created = await sanity(`/v2021-10-01/hooks/projects/${projectId}`, {
    method: 'POST',
    body: JSON.stringify(definition),
  })

  console.log(`  Created "${HOOK_NAME}" (${created.id}).`)
  console.log(
    '\n  Publishing a service page will now trigger a Netlify build.\n' +
      '  A build takes a minute or two, so it is not instant — that is normal\n' +
      '  for a statically generated site.\n\n' +
      '  Delivery history:\n' +
      `    ${BASE}/v2021-10-04/hooks/projects/${projectId}/${created.id}/attempts\n` +
      '  or sanity.io/manage -> API -> Webhooks -> the hook -> Deliveries.\n'
  )
}

main().catch((error) => {
  if (error?.name === 'MissingSanityConfig') {
    console.error(error.message)
    process.exit(1)
  }

  if (error?.statusCode === 401 || error?.statusCode === 403) {
    console.error(
      '\n  Sanity refused to manage webhooks with this token.\n\n' +
        '  Use a token with Administrator permissions\n' +
        '  (sanity.io/manage -> API -> Tokens), or set the webhook up by hand:\n\n' +
        '    sanity.io/manage -> your project -> API -> Webhooks -> Create webhook\n' +
        `      URL      ${buildHookUrl}\n` +
        `      Dataset  ${dataset}\n` +
        '      Trigger  Create, Update, Delete\n' +
        '      Filter   _type == "servicePage"\n' +
        '      Drafts   off\n'
    )
    process.exit(1)
  }

  console.error('\n  Could not set up the webhook:\n')
  console.error(error)
  process.exit(1)
})
