import {defineField, defineType} from 'sanity'
import {HelpCircleIcon} from '@sanity/icons/HelpCircle'

/**
 * Questions that open and close. Native <details>/<summary>, so it works with
 * no JavaScript at all.
 */
export const faqAccordion = defineType({
  name: 'faqAccordion',
  title: 'Questions and answers',
  type: 'object',
  icon: HelpCircleIcon,

  fields: [
    defineField({
      name: 'heading',
      title: 'Section heading',
      type: 'string',
      initialValue: 'Frequently asked questions',
      description: 'Usually just "Frequently asked questions". Change it if you prefer.',
      validation: (rule) => rule.required().warning('Every section reads better with a heading.'),
    }),

    defineField({
      name: 'items',
      title: 'The questions',
      type: 'array',
      options: {sortable: true},
      description:
        'Put the question you get asked most at the top and drag the rest below it — people rarely read past the third one. Every question starts closed; visitors click to open.',
      of: [
        defineField({
          name: 'faq',
          title: 'Question',
          type: 'object',
          icon: HelpCircleIcon,
          fields: [
            defineField({
              name: 'question',
              title: 'The question',
              type: 'string',
              description:
                'Write it the way a customer would ask it, not the way you would title it. "How long does it take to dry?" beats "Drying times".',
              validation: (rule) => rule.required().warning('A question with no text cannot be clicked open.'),
            }),
            defineField({
              name: 'answer',
              title: 'The answer',
              type: 'text',
              rows: 5,
              description:
                'Two to four sentences. Answer it in the first sentence, then add the detail — people stop reading once they have what they came for.',
            }),
          ],
          preview: {
            select: {title: 'question', subtitle: 'answer'},
            prepare({title, subtitle}) {
              return {title: title || 'Untitled question', subtitle}
            },
          },
        }),
      ],
    }),

    defineField({
      name: 'columns',
      title: 'How many columns?',
      type: 'string',
      initialValue: 'one',
      options: {
        list: [
          {title: 'One', value: 'one'},
          {title: 'Two', value: 'two'},
        ],
        layout: 'dropdown',
      },
      description:
        'One column is easier to read and is the safe choice. Two fits more on screen at once, which is worth it once you have six or more questions. On a phone both settings show one column.',
      validation: (rule) => rule.required(),
    }),
  ],

  preview: {
    select: {title: 'heading', columns: 'columns', items: 'items'},
    prepare({title, columns, items}) {
      const count = Array.isArray(items) ? items.length : 0
      const cols = columns === 'two' ? 'Two columns' : 'One column'
      return {
        title: title || 'Questions and answers (no heading yet)',
        subtitle: `Questions and answers · ${count} question${count === 1 ? '' : 's'} · ${cols}`,
      }
    },
  },
})
