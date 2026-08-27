import {defineArrayMember, defineField, defineType} from 'sanity'
import {DocumentIcon} from '@sanity/icons/Document'
import {SplitVerticalIcon} from '@sanity/icons/SplitVertical'
import {CheckmarkCircleIcon} from '@sanity/icons/CheckmarkCircle'
import {ThLargeIcon} from '@sanity/icons/ThLarge'
import {HelpCircleIcon} from '@sanity/icons/HelpCircle'
import {TransferIcon} from '@sanity/icons/Transfer'

export const servicePage = defineType({
  name: 'servicePage',
  title: 'Service page',
  type: 'document',
  icon: DocumentIcon,

  groups: [
    {name: 'content', title: 'Page content', default: true},
    {name: 'seo', title: 'Google & sharing'},
  ],

  fields: [
    defineField({
      name: 'title',
      title: 'Page name',
      type: 'string',
      group: 'content',
      description:
        'What this page is called, e.g. "Tile and Grout Cleaning". This is the big heading at the top of the page and it is what you will see in the list of pages here in the Studio.',
      validation: (rule) => rule.required().error('A page needs a name before it can be published.'),
    }),

    defineField({
      name: 'slug',
      title: 'Web address',
      type: 'slug',
      group: 'content',
      options: {source: 'title', maxLength: 96},
      description:
        'The last part of the address, so "tile-and-grout-cleaning" gives you renuenc.com/services/tile-and-grout-cleaning. Click Generate to build it from the page name. Once the page is live, changing this breaks any link anyone has saved or shared — so set it once and leave it.',
      validation: (rule) => rule.required().error('Without a web address the page has nowhere to live.'),
    }),

    defineField({
      name: 'sections',
      title: 'Page sections — drag to reorder',
      type: 'array',
      group: 'content',
      description:
        'This is the page itself, built out of blocks. Click "Add item" to add a section, and drag any section by the handle on its left to move it up or down — the live page follows the order you see here. Nothing is locked: you can put the questions above the photos, or the tick-list first, whenever you like.',
      options: {
        sortable: true,
        // Show the five section types as a grid of named, icon-labelled cards
        // rather than a plain text menu.
        insertMenu: {
          showIcons: true,
          views: [{name: 'grid'}, {name: 'list'}],
        },
      },
      of: [
        defineArrayMember({type: 'introWithImage', icon: SplitVerticalIcon}),
        defineArrayMember({type: 'checklistGrid', icon: CheckmarkCircleIcon}),
        defineArrayMember({type: 'cardRow', icon: ThLargeIcon}),
        defineArrayMember({type: 'faqAccordion', icon: HelpCircleIcon}),
        defineArrayMember({type: 'beforeAfterStrip', icon: TransferIcon}),
      ],
    }),

    defineField({
      name: 'seoTitle',
      title: 'Google headline',
      type: 'string',
      group: 'seo',
      description:
        'The blue clickable line people see in Google results. Around 60 characters — past that Google cuts it off mid-word. Put the service and the place in it: "Tile & Grout Cleaning in North Carolina | Renue NC". Leave empty and the page name is used instead.',
      validation: (rule) =>
        rule.max(70).warning('Over about 70 characters Google will trim the end of this.'),
    }),

    defineField({
      name: 'seoDescription',
      title: 'Google summary',
      type: 'text',
      rows: 3,
      group: 'seo',
      description:
        'The grey paragraph under the headline in Google results. Around 155 characters. It does not change your ranking, but it is your advert — write it as a reason to click, and mention the phone number or "free quote" if you can fit it.',
      validation: (rule) =>
        rule.max(180).warning('Over about 180 characters Google will trim the end of this.'),
    }),
  ],

  preview: {
    select: {title: 'title', slug: 'slug.current', sections: 'sections'},
    prepare({title, slug, sections}) {
      const count = Array.isArray(sections) ? sections.length : 0
      return {
        title: title || 'Untitled page',
        subtitle: `/services/${slug ?? '…'} · ${count} section${count === 1 ? '' : 's'}`,
      }
    },
  },
})
