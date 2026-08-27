import {defineField, defineType} from 'sanity'
import {TransferIcon} from '@sanity/icons/Transfer'

/**
 * A band of results photos. The proof section — for a cleaning business this
 * is usually the most persuasive block on the page.
 */
export const beforeAfterStrip = defineType({
  name: 'beforeAfterStrip',
  title: 'Before and after photos',
  type: 'object',
  icon: TransferIcon,

  fields: [
    defineField({
      name: 'heading',
      title: 'Section heading',
      type: 'string',
      initialValue: 'Before and after',
      description: 'Something like "See the difference" or "Before and after".',
      validation: (rule) => rule.required().warning('Every section reads better with a heading.'),
    }),

    defineField({
      name: 'intro',
      title: 'Short line under the heading',
      type: 'text',
      rows: 3,
      description:
        'One or two sentences of context — where the job was, what the problem had been. Optional.',
    }),

    defineField({
      name: 'images',
      title: 'Photos',
      type: 'array',
      options: {sortable: true},
      description:
        'Upload them in pairs and in order: the "before" first, then the matching "after" straight after it. They are laid out left to right, so a pair sits side by side. Two or four photos is the usual choice.',
      of: [
        defineField({
          name: 'shot',
          title: 'Photo',
          type: 'object',
          icon: TransferIcon,
          fields: [
            defineField({
              name: 'image',
              title: 'Photo',
              type: 'image',
              options: {hotspot: true},
              description:
                'Shoot before and after from the same spot if you can — that is what makes the pair convincing. Use the crop tool to keep the same part of the floor in frame on both.',
            }),
            defineField({
              name: 'alt',
              title: 'Photo description (for screen readers and Google)',
              type: 'string',
              description:
                'A few words, e.g. "Lobby grout before cleaning — dark and stained". Say whether it is the before or the after.',
            }),
          ],
          preview: {
            select: {title: 'alt', media: 'image'},
            prepare({title, media}) {
              return {title: title || 'Photo (no description yet)', media}
            },
          },
        }),
      ],
      validation: (rule) => rule.min(1).warning('With no photos this section renders as an empty gap.'),
    }),
  ],

  preview: {
    select: {title: 'heading', images: 'images', media: 'images.0.image'},
    prepare({title, images, media}) {
      const count = Array.isArray(images) ? images.length : 0
      return {
        title: title || 'Before and after (no heading yet)',
        subtitle: `Before and after · ${count} photo${count === 1 ? '' : 's'}`,
        media,
      }
    },
  },
})
