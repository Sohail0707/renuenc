import {defineField, defineType} from 'sanity'
import {SplitVerticalIcon} from '@sanity/icons/SplitVertical'

/**
 * Text on one side, a photo on the other. The workhorse section.
 */
export const introWithImage = defineType({
  name: 'introWithImage',
  title: 'Text with a photo beside it',
  type: 'object',
  icon: SplitVerticalIcon,

  fields: [
    defineField({
      name: 'heading',
      title: 'Section heading',
      type: 'string',
      description:
        'The big line at the top of this block. Two lines works best — longer and it starts to crowd the photo next to it.',
      validation: (rule) => rule.required().warning('Every section reads better with a heading.'),
    }),

    defineField({
      name: 'body',
      title: 'Paragraphs',
      type: 'array',
      of: [
        {
          type: 'block',
          // Deliberately small toolbar. Every option here already has a matching
          // style on the site, so nothing an editor picks can look broken.
          styles: [
            {title: 'Normal paragraph', value: 'normal'},
            {title: 'Small heading', value: 'h3'},
          ],
          lists: [{title: 'Bulleted list', value: 'bullet'}],
          marks: {
            decorators: [
              {title: 'Bold', value: 'strong'},
              {title: 'Italic', value: 'em'},
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    title: 'Web address',
                    description: 'Paste the full address, including the https:// at the front.',
                  },
                ],
              },
            ],
          },
        },
      ],
      description:
        'The body copy. Two or three short paragraphs is the sweet spot — a wall of text next to a photo makes the photo look like an afterthought. You can bold words, add bullets, and add links.',
    }),

    defineField({
      name: 'image',
      title: 'Photo',
      type: 'image',
      options: {hotspot: true},
      description:
        'A landscape (wider than tall) photo works best here. After uploading, click the crop icon to set which part of the photo must always stay visible when the page is viewed on a phone.',
    }),

    defineField({
      name: 'imageAlt',
      title: 'Photo description (for screen readers and Google)',
      type: 'string',
      description:
        'Describe what is in the photo in a few words, e.g. "Restored tile floor in a hotel lobby". Nobody sees this on the page — it is read aloud to blind visitors and it helps you show up in Google image search.',
    }),

    defineField({
      name: 'layout',
      title: 'Which side is the photo on?',
      type: 'string',
      initialValue: 'imageRight',
      options: {
        list: [
          {title: 'Image right', value: 'imageRight'},
          {title: 'Image left', value: 'imageLeft'},
        ],
        layout: 'dropdown',
      },
      description:
        'Flips the block. If you have two of these sections in a row, alternate them — text/photo then photo/text — so the page zig-zags instead of marching down one side.',
      validation: (rule) => rule.required(),
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
        ],
        layout: 'dropdown',
      },
      description:
        'Light grey separates this block from the one above it. Do not put two greys next to each other — they merge into one big grey slab.',
      validation: (rule) => rule.required(),
    }),
  ],

  preview: {
    select: {title: 'heading', layout: 'layout', media: 'image'},
    prepare({title, layout, media}) {
      return {
        title: title || 'Text with a photo (no heading yet)',
        subtitle: `Text with a photo · ${layout === 'imageLeft' ? 'Image left' : 'Image right'}`,
        media,
      }
    },
  },
})
