import {defineField, defineType} from 'sanity'
import {ThLargeIcon} from '@sanity/icons/ThLarge'

/**
 * A row of photo cards. Used on the live site for the service breakdowns.
 */
export const cardRow = defineType({
  name: 'cardRow',
  title: 'Row of cards with photos',
  type: 'object',
  icon: ThLargeIcon,

  fields: [
    defineField({
      name: 'heading',
      title: 'Section heading',
      type: 'string',
      description: 'The line above the row of cards, e.g. "Our tile and grout process".',
      validation: (rule) => rule.required().warning('Every section reads better with a heading.'),
    }),

    defineField({
      name: 'intro',
      title: 'Short line under the heading',
      type: 'text',
      rows: 3,
      description:
        'One or two sentences before the cards start. Optional — leave it empty and the cards move up.',
    }),

    defineField({
      name: 'cards',
      title: 'The cards',
      type: 'array',
      options: {sortable: true},
      description:
        'Three cards fit neatly on a row. Four will wrap onto a second row with one card sitting on its own, which looks unbalanced — use three or six. Drag a card by its handle to change the order.',
      of: [
        defineField({
          name: 'card',
          title: 'Card',
          type: 'object',
          icon: ThLargeIcon,
          fields: [
            defineField({
              name: 'image',
              title: 'Photo',
              type: 'image',
              options: {hotspot: true},
              description:
                'All the cards in a row are cropped to the same shape, so photos of different sizes will still line up. Use the crop tool to pick what stays in frame.',
            }),
            defineField({
              name: 'imageAlt',
              title: 'Photo description (for screen readers and Google)',
              type: 'string',
              description: 'A few words describing the photo, e.g. "Technician steam-cleaning grout lines".',
            }),
            defineField({
              name: 'title',
              title: 'Card title',
              type: 'string',
              description:
                'Short. Two or three words. Longer titles wrap to a second line and knock the cards out of alignment with each other.',
              validation: (rule) => rule.required().warning('A card with no title reads as a broken image.'),
            }),
            defineField({
              name: 'body',
              title: 'Card text',
              type: 'text',
              rows: 4,
              description:
                'Two or three sentences. Keep the three cards in a row roughly the same length — if one is much longer, that card gets taller than its neighbours.',
            }),
          ],
          preview: {
            select: {title: 'title', subtitle: 'body', media: 'image'},
            prepare({title, subtitle, media}) {
              return {title: title || 'Untitled card', subtitle, media}
            },
          },
        }),
      ],
    }),

    defineField({
      name: 'background',
      title: 'Background colour',
      type: 'string',
      initialValue: 'white',
      options: {
        list: [
          {title: 'White', value: 'white'},
          {title: 'Light grey', value: 'lightGrey'},
          {title: 'Brand green', value: 'brandGreen'},
        ],
        layout: 'dropdown',
      },
      description:
        'Brand green makes this block shout, so use it once per page at most — usually on the section you most want people to read. The text turns white automatically on green, you do not have to change anything.',
      validation: (rule) => rule.required(),
    }),
  ],

  preview: {
    select: {title: 'heading', background: 'background', cards: 'cards', media: 'cards.0.image'},
    prepare({title, background, cards, media}) {
      const count = Array.isArray(cards) ? cards.length : 0
      const bg =
        background === 'brandGreen' ? 'Brand green' : background === 'lightGrey' ? 'Light grey' : 'White'
      return {
        title: title || 'Row of cards (no heading yet)',
        subtitle: `Row of cards · ${count} card${count === 1 ? '' : 's'} · ${bg}`,
        media,
      }
    },
  },
})
