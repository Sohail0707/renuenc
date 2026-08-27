import {defineField, defineType} from 'sanity'
import {CheckmarkCircleIcon} from '@sanity/icons/CheckmarkCircle'

/**
 * "What's included" — a grid of ticked lines. No images, so it's the fastest
 * section for an editor to fill in.
 */
export const checklistGrid = defineType({
  name: 'checklistGrid',
  title: 'Tick-list of what’s included',
  type: 'object',
  icon: CheckmarkCircleIcon,

  fields: [
    defineField({
      name: 'heading',
      title: 'Section heading',
      type: 'string',
      description: 'Something like "What’s included in every visit". One line is plenty.',
      validation: (rule) => rule.required().warning('Every section reads better with a heading.'),
    }),

    defineField({
      name: 'intro',
      title: 'Short line under the heading',
      type: 'text',
      rows: 3,
      description:
        'One or two sentences setting up the list. Optional — leave it empty and the list moves up to sit under the heading.',
    }),

    defineField({
      name: 'items',
      title: 'The list',
      type: 'array',
      of: [{type: 'string'}],
      options: {sortable: true},
      description:
        'One line per item, each gets a green tick. Keep each one under about eight words so it stays on a single line. Drag the handles to reorder. Six or nine items fill the grid evenly.',
      validation: (rule) => rule.min(1).warning('An empty list will render as an empty gap.'),
    }),

    defineField({
      name: 'columns',
      title: 'How many columns?',
      type: 'string',
      initialValue: 'three',
      options: {
        list: [
          {title: 'Two', value: 'two'},
          {title: 'Three', value: 'three'},
        ],
        layout: 'dropdown',
      },
      description:
        'Three is tighter and suits short items. Two gives each line more room, which is better if your items run long. On a phone both settings stack into one column automatically.',
      validation: (rule) => rule.required(),
    }),
  ],

  preview: {
    select: {title: 'heading', columns: 'columns', items: 'items'},
    prepare({title, columns, items}) {
      const count = Array.isArray(items) ? items.length : 0
      const cols = columns === 'two' ? 'Two columns' : 'Three columns'
      return {
        title: title || 'Tick-list (no heading yet)',
        subtitle: `Tick-list · ${cols} · ${count} item${count === 1 ? '' : 's'}`,
      }
    },
  },
})
