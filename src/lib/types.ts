/** Shapes returned by the GROQ queries in queries.ts. */

export type SanityImage = {
  _type: 'image'
  asset: {_ref: string; _type: 'reference'}
  hotspot?: {x: number; y: number; height: number; width: number}
  crop?: {top: number; bottom: number; left: number; right: number}
}

export type PortableTextBlock = Record<string, unknown>

export type IntroWithImage = {
  _key: string
  _type: 'introWithImage'
  heading?: string
  body?: PortableTextBlock[]
  image?: SanityImage
  imageAlt?: string
  layout?: 'imageLeft' | 'imageRight'
  background?: 'white' | 'lightGrey'
}

export type ChecklistGrid = {
  _key: string
  _type: 'checklistGrid'
  heading?: string
  intro?: string
  items?: string[]
  columns?: 'two' | 'three'
}

export type CardRow = {
  _key: string
  _type: 'cardRow'
  heading?: string
  intro?: string
  cards?: {
    _key: string
    image?: SanityImage
    imageAlt?: string
    title?: string
    body?: string
  }[]
  background?: 'white' | 'lightGrey' | 'brandGreen'
}

export type FaqAccordion = {
  _key: string
  _type: 'faqAccordion'
  heading?: string
  items?: {_key: string; question?: string; answer?: string}[]
  columns?: 'one' | 'two'
}

export type BeforeAfterStrip = {
  _key: string
  _type: 'beforeAfterStrip'
  heading?: string
  intro?: string
  images?: {_key: string; image?: SanityImage; alt?: string}[]
}

export type Section =
  | IntroWithImage
  | ChecklistGrid
  | CardRow
  | FaqAccordion
  | BeforeAfterStrip

export type ServicePage = {
  _id: string
  title: string
  slug: string
  seoTitle?: string
  seoDescription?: string
  sections?: Section[]
}
