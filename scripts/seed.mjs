/**
 * Seed one servicePage into Sanity.
 *
 *   npm run seed
 *
 * The copy lives in scripts/seed-content.mjs — that is the file to edit.
 * This one is just the plumbing: it uploads the photos, turns the plain
 * strings into the shapes Sanity expects, and writes the document.
 *
 * Running it twice is safe. The document has a fixed _id, so a second run
 * overwrites the first rather than creating a duplicate.
 */

import {createClient} from '@sanity/client'
import {randomUUID} from 'node:crypto'
import {readFile} from 'node:fs/promises'
import {existsSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import path from 'node:path'
import 'dotenv/config'

import {readSanityEnv} from '../env.mjs'
import {page} from './seed-content.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const IMAGE_DIR = path.join(ROOT, 'seed', 'images')

// A stable id, so re-seeding updates the same page instead of piling up copies.
const DOCUMENT_ID = 'servicePage-seeded-demo'

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

// Read lazily, so a missing variable is reported by main()'s error handler as a
// readable message rather than as an uncaught throw during module evaluation.
let config
let client

function connect() {
  config = readSanityEnv(process.env, {
    context: 'The seed script (npm run seed)',
    requireWriteToken: true,
  })

  client = createClient({
    projectId: config.projectId,
    dataset: config.dataset,
    apiVersion: config.apiVersion,
    token: config.token,
    useCdn: false,
  })
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const key = () => randomUUID().replace(/-/g, '').slice(0, 12)

/** Plain strings -> Portable Text paragraphs. */
function toPortableText(paragraphs) {
  return (paragraphs ?? [])
    .filter((text) => typeof text === 'string' && text.trim() !== '')
    .map((text) => ({
      _type: 'block',
      _key: key(),
      style: 'normal',
      markDefs: [],
      children: [{_type: 'span', _key: key(), text, marks: []}],
    }))
}

const uploaded = new Map()
const missingImages = new Set()

/**
 * Upload seed/images/<fileName> once and return an image field value.
 * A missing file is a warning, not a crash — the section renders without it.
 */
async function uploadImage(fileName) {
  if (!fileName) return undefined
  if (uploaded.has(fileName)) return uploaded.get(fileName)

  const filePath = path.join(IMAGE_DIR, fileName)
  if (!existsSync(filePath)) {
    missingImages.add(fileName)
    uploaded.set(fileName, undefined)
    return undefined
  }

  process.stdout.write(`  uploading ${fileName} … `)
  const asset = await client.assets.upload('image', await readFile(filePath), {filename: fileName})
  console.log('done')

  const value = {_type: 'image', asset: {_type: 'reference', _ref: asset._id}}
  uploaded.set(fileName, value)
  return value
}

/** One section from seed-content.mjs -> the document shape Sanity stores. */
async function buildSection(section) {
  const base = {_key: key(), _type: section._type}

  switch (section._type) {
    case 'introWithImage':
      return {
        ...base,
        heading: section.heading,
        body: toPortableText(section.body),
        image: await uploadImage(section.imageFile),
        imageAlt: section.imageAlt,
        layout: section.layout ?? 'imageRight',
        background: section.background ?? 'white',
      }

    case 'checklistGrid':
      return {
        ...base,
        heading: section.heading,
        intro: section.intro,
        items: section.items ?? [],
        columns: section.columns ?? 'three',
      }

    case 'cardRow':
      return {
        ...base,
        heading: section.heading,
        intro: section.intro,
        cards: await Promise.all(
          (section.cards ?? []).map(async (card) => ({
            _key: key(),
            image: await uploadImage(card.imageFile),
            imageAlt: card.imageAlt,
            title: card.title,
            body: card.body,
          }))
        ),
        background: section.background ?? 'white',
      }

    case 'faqAccordion':
      return {
        ...base,
        heading: section.heading,
        items: (section.items ?? []).map((item) => ({
          _key: key(),
          question: item.question,
          answer: item.answer,
        })),
        columns: section.columns ?? 'one',
      }

    case 'beforeAfterStrip':
      return {
        ...base,
        heading: section.heading,
        intro: section.intro,
        images: await Promise.all(
          (section.images ?? []).map(async (shot) => ({
            _key: key(),
            image: await uploadImage(shot.imageFile),
            alt: shot.alt,
          }))
        ),
      }

    default:
      throw new Error(
        `seed-content.mjs has a section with _type "${section._type}", which is not one of the ` +
          `five section types. Valid types: introWithImage, checklistGrid, cardRow, ` +
          `faqAccordion, beforeAfterStrip.`
      )
  }
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

async function main() {
  connect()
  console.log(`\nSeeding "${page.title}" into ${config.projectId}/${config.dataset}\n`)

  // Images first, so the whole upload happens before anything is written.
  const sections = []
  for (const section of page.sections ?? []) {
    sections.push(await buildSection(section))
  }

  const doc = {
    _id: DOCUMENT_ID,
    _type: 'servicePage',
    title: page.title,
    slug: {_type: 'slug', current: page.slug},
    seoTitle: page.seoTitle,
    seoDescription: page.seoDescription,
    sections,
  }

  await client.createOrReplace(doc)

  console.log(`\n  Created ${sections.length} sections on /services/${page.slug}`)

  if (missingImages.size > 0) {
    console.log('\n  Photos referenced in seed-content.mjs that are not in seed/images/:')
    for (const name of missingImages) console.log(`    · ${name}`)
    console.log('  Those sections were seeded without a photo. Drop the files in and re-run.')
  }

  const placeholders = JSON.stringify(doc).match(/<< REPLACE >>/g)?.length ?? 0
  if (placeholders > 0) {
    console.log(
      `\n  Heads up: ${placeholders} "<< REPLACE >>" placeholders are still in the content.` +
        `\n  Open scripts/seed-content.mjs and swap them for the real copy.`
    )
  }

  console.log('\n  Done. Run `npm run dev` and open http://localhost:3333/studio\n')
}

main().catch((error) => {
  // readSanityEnv already formats its own message; don't bury it in a stack.
  if (error?.name === 'MissingSanityConfig') {
    console.error(error.message)
    process.exit(1)
  }

  if (error?.statusCode === 401 || error?.statusCode === 403) {
    console.error(
      '\n  Sanity rejected the token.\n\n' +
        '  SANITY_API_WRITE_TOKEN in .env needs "Editor" permissions.\n' +
        '  Create one at sanity.io/manage → your project → API → Tokens.\n'
    )
    process.exit(1)
  }

  console.error('\n  Seeding failed:\n')
  console.error(error)
  process.exit(1)
})
