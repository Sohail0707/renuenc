/* ===========================================================================
 *
 *   STARTER CONTENT FOR THE DEMO PAGE
 *
 *   This is the only file you need to touch to change what gets seeded. It is
 *   plain text and arrays — no Sanity API, nothing here can break the build.
 *   Edit it and re-run `npm run seed`; the same document is overwritten, so you
 *   never end up with duplicates.
 *
 *   ---------------------------------------------------------------------
 *   WHERE THIS COPY CAME FROM — read this before showing it to the client
 *   ---------------------------------------------------------------------
 *   renuenc.com blocks automated requests (403), so this is NOT the live page
 *   text. It is original copy written for the trade: accurate about how
 *   commercial tile and grout cleaning actually works, and deliberately free of
 *   invented statistics, case studies or certifications. It reads as real copy
 *   so the demo looks like a real page, but every word is replaceable.
 *
 *   Worth checking against the live site before this goes in front of anyone:
 *     · the service-area towns listed in the last FAQ
 *     · whether colour sealing is a service they actually offer
 *     · drying times, if they quote different ones
 *
 *   ---------------------------------------------------------------------
 *   PHOTOS
 *   ---------------------------------------------------------------------
 *   Everything below points at `placeholder.jpg` — the ballroom photo, reused,
 *   obviously a stand-in. Drop real tile and grout photos into `seed/images/`,
 *   change the `imageFile` names to match, and re-run the seed. A name with no
 *   matching file is skipped with a warning rather than failing the run.
 *
 *   ---------------------------------------------------------------------
 *   WHY THE SECTIONS ARE IN THIS ORDER
 *   ---------------------------------------------------------------------
 *   The first two sections are the same type with the layout dropdown set
 *   differently — "Image right" then "Image left" — so the page zig-zags and
 *   the effect of that dropdown is visible without changing anything. All five
 *   section types are used once. Drag them into a different order in the Studio
 *   and rebuild; nothing here needs to change for that to work.
 *
 * ======================================================================== */

const PLACEHOLDER = 'placeholder.jpg'

export const page = {
  // ---------------------------------------------------------------------
  // Page basics
  // ---------------------------------------------------------------------

  /** The <h1> and the name in the Studio's page list. */
  title: 'Tile and Grout Cleaning',

  /** Becomes /services/tile-and-grout-cleaning */
  slug: 'tile-and-grout-cleaning',

  /** The blue clickable line in Google. ~60 characters. */
  seoTitle: 'Commercial Tile & Grout Cleaning in North Carolina | Renue NC',

  /** The grey paragraph under it in Google. ~155 characters. */
  seoDescription:
    'Commercial tile and grout deep cleaning for hotels, restaurants and healthcare across North Carolina. Same-shift turnaround. Free quote — call 919-307-1778.',

  // ---------------------------------------------------------------------
  // The sections, in the order they appear on the page
  // ---------------------------------------------------------------------
  sections: [
    // ---- 1. Opening block — photo on the RIGHT, white background --------
    {
      _type: 'introWithImage',
      heading: 'Mopping cannot reach grout. We can.',

      // One string per paragraph. Add or remove lines freely.
      body: [
        'Grout is porous. A damp mop moves soil across a floor and presses a share of it down into the joints, which is why a lobby can be cleaned every night and still look grey along the grout lines. What you are looking at is not dirt sitting on the surface — it is soil that has settled below it.',
        'We remove it with commercial hot-water extraction: cleaning solution driven into the grout line under pressure, and the spent water pulled straight back out in the same pass. Nothing is left to dry into the joint, and the floor is back in service the same shift.',
      ],

      imageFile: PLACEHOLDER,
      imageAlt: 'Tiled hotel lobby floor after deep cleaning',

      layout: 'imageRight',
      background: 'white',
    },

    // ---- 2. Same section type, photo on the LEFT, grey background -------
    //         Side by side with the block above, this is the clearest way
    //         to show the client what the layout dropdown actually does.
    {
      _type: 'introWithImage',
      heading: 'Built around your operating hours',

      body: [
        'Most of our work happens between last service and first arrivals. We schedule around your floor plan so one route is always open, protect adjacent surfaces and fixtures before anything gets wet, and set the space back the way we found it.',
        'That matters most where a closed floor costs you money — hotel lobbies and corridors, restaurant kitchens and dining rooms, healthcare entrances and treatment areas.',
      ],

      imageFile: PLACEHOLDER,
      imageAlt: 'Technician working on a tiled corridor overnight',

      layout: 'imageLeft',
      background: 'lightGrey',
    },

    // ---- 3. What's included --------------------------------------------
    {
      _type: 'checklistGrid',
      heading: 'What’s included in every visit',
      intro: 'Quoted as a single scope. Nothing gets added to the price once the truck is on site.',

      // One line per tick. Six fills the three-column grid evenly.
      items: [
        'Pre-inspection and test patch',
        'Furniture and fixtures protected',
        'Grout lines mechanically agitated',
        'Hot-water extraction, same-pass recovery',
        'Neutralising rinse',
        'Space reset before we leave',
      ],

      columns: 'three',
    },

    // ---- 4. The process, as a row of cards on brand green ---------------
    {
      _type: 'cardRow',
      heading: 'How the job runs',
      intro: 'Three stages, one visit.',

      cards: [
        {
          imageFile: PLACEHOLDER,
          imageAlt: 'Technician testing a small patch of grout',
          title: 'Inspect',
          body: 'We test an inconspicuous patch first to see how the grout responds, then agree the scope and the access plan in writing. No surprises once we are on site.',
        },
        {
          imageFile: PLACEHOLDER,
          imageAlt: 'Hot-water extraction machine cleaning grout lines',
          title: 'Deep clean',
          body: 'Solution goes into the grout line under pressure and comes back out with the soil in the same pass. No standing water, and no slurry drying back into the joints.',
        },
        {
          imageFile: PLACEHOLDER,
          imageAlt: 'Penetrating sealer being applied to dry grout',
          title: 'Protect',
          body: 'Once the floor is dry we can apply a penetrating sealer, so spills sit on top of the grout long enough to be wiped up instead of soaking in.',
        },
      ],

      background: 'brandGreen',
    },

    // ---- 5. Before and after -------------------------------------------
    //         Swap these for a real pair shot from the same spot. That pair
    //         is usually the most persuasive thing on a cleaning page.
    {
      _type: 'beforeAfterStrip',
      heading: 'Before and after',
      intro: 'The same floor, photographed from the same position before we started and after we finished.',

      images: [
        {imageFile: PLACEHOLDER, alt: 'Lobby grout before cleaning — dark and evenly greyed'},
        {imageFile: PLACEHOLDER, alt: 'The same lobby grout after cleaning'},
      ],
    },

    // ---- 6. FAQs --------------------------------------------------------
    {
      _type: 'faqAccordion',
      heading: 'Frequently asked questions',

      items: [
        {
          question: 'How long does the floor take to dry?',
          answer:
            'Around 30 to 45 minutes in a well-ventilated space. Recovery happens in the same pass as the cleaning, so there is no standing water left to evaporate. We will walk the area with you before we leave.',
        },
        {
          question: 'Can you work overnight?',
          answer:
            'Yes, and for most hotel and restaurant work we prefer to. Overnight scheduling means the floor is dry and the space is reset before your first guests arrive.',
        },
        {
          question: 'Will the pressure damage my tile or grout?',
          answer:
            'No. We test a small area first and set the pressure to the condition of the grout. Where grout has already failed or gone missing we will tell you before we start — cleaning will not repair it, and we would rather flag it than hide it.',
        },
        {
          question: 'How white will the grout get?',
          answer:
            'Cleaning restores grout to its own colour, not to a colour it never was. If the grout is permanently stained, or was installed in a darker shade than you remember, a colour seal is the way to change it. Ask and we will quote that separately.',
        },
        {
          question: 'How often should commercial tile be deep cleaned?',
          answer:
            'Most commercial floors want it every 12 to 18 months. High-traffic entrances and kitchen floors are usually closer to 6 to 12. Sealed floors go longer between visits.',
        },
        {
          question: 'Do you cover my area?',
          answer:
            'We work across North Carolina, including Raleigh, Durham, Greensboro and Charlotte. Call 919-307-1778 and we will confirm scheduling for your location.',
        },
      ],

      columns: 'one',
    },
  ],
}
