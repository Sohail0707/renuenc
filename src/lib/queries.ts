import {sanityClient} from 'sanity:client'
import type {ServicePage} from './types'

/**
 * Every field the renderer needs, in one round trip. Image assets are left as
 * references on purpose — @sanity/image-url builds CDN URLs straight from a
 * ref, so dereferencing them here would only make the payload bigger.
 */
const SERVICE_PAGE_FIELDS = /* groq */ `
  _id,
  title,
  "slug": slug.current,
  seoTitle,
  seoDescription,
  sections[]{
    ...,
    _type == "cardRow" => { cards[]{ ... } },
    _type == "faqAccordion" => { items[]{ ... } },
    _type == "beforeAfterStrip" => { images[]{ ... } }
  }
`

/**
 * The env vars can be present and still be wrong — a typo in the project ID, a
 * dataset that was never created, a private dataset with no token. Sanity's own
 * error for that is a one-line message on top of a client-internals stack
 * trace, which is exactly the thing that makes a build look broken rather than
 * misconfigured. Translate it once, here.
 */
function explainFetchFailure(error: unknown): never {
  const message = error instanceof Error ? error.message : String(error)
  const {projectId, dataset} = sanityClient.config()

  const hint = /not found/i.test(message)
    ? [
        `  Sanity has no dataset called "${dataset}" in project "${projectId}".`,
        '',
        '  Check both values against https://sanity.io/manage:',
        '    · PUBLIC_SANITY_PROJECT_ID — shown at the top of the project page',
        '    · PUBLIC_SANITY_DATASET    — under Datasets, usually "production"',
        '',
        '  If the project is new, the dataset may not have been created yet.',
      ]
    : /unauthorized|permission|401|403/i.test(message)
      ? [
          `  Sanity refused to read dataset "${dataset}" in project "${projectId}".`,
          '',
          '  The dataset is probably private. Either make it public',
          '  (sanity.io/manage → Datasets → Visibility), or use a public dataset.',
        ]
      : [
          `  Could not read from project "${projectId}", dataset "${dataset}".`,
          '',
          `  Sanity said: ${message}`,
          '',
          '  If you are offline, that is the likely cause — this content is fetched',
          '  at build time, so the build needs a network connection.',
        ]

  const formatted = [
    '',
    '  ┌───────────────────────────────────────────────────────────────┐',
    '  │  Could not fetch content from Sanity.                         │',
    '  └───────────────────────────────────────────────────────────────┘',
    '',
    ...hint,
    '',
  ].join('\n')

  const wrapped = new Error(formatted)
  wrapped.name = 'SanityFetchFailed'
  wrapped.stack = formatted
  throw wrapped
}

/** All published service pages. Called at build time by getStaticPaths. */
export async function getAllServicePages(): Promise<ServicePage[]> {
  try {
    return await sanityClient.fetch(
      /* groq */ `*[_type == "servicePage" && defined(slug.current)]
        | order(title asc) {${SERVICE_PAGE_FIELDS}}`
    )
  } catch (error) {
    return explainFetchFailure(error)
  }
}
