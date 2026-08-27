import type {SchemaTypeDefinition} from 'sanity'

import {servicePage} from './servicePage'
import {introWithImage} from './sections/introWithImage'
import {checklistGrid} from './sections/checklistGrid'
import {cardRow} from './sections/cardRow'
import {faqAccordion} from './sections/faqAccordion'
import {beforeAfterStrip} from './sections/beforeAfterStrip'

/**
 * Five section types. Deliberately five — a long "Add item" menu is the thing
 * that makes a CMS feel complicated, which is the opposite of the point here.
 */
export const schemaTypes: SchemaTypeDefinition[] = [
  servicePage,
  introWithImage,
  checklistGrid,
  cardRow,
  faqAccordion,
  beforeAfterStrip,
]
