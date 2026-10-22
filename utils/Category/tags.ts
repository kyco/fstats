/**
 * What library keywords are (see `utils/Category/library/`), e.g. 'supermarket'. A flat list: each library keyword has
 * one tag, rule sets map tags (and single library keywords) to their categories. The groups are only headings, e.g.
 * on `/library`. Translated in `public/locales/tags/{en,de}.json` (groups under `GROUPS`).
 *
 * Stored in users' rule sets: never rename or reuse one.
 */
export const TAG_GROUPS = [
  {
    id: 'income',
    tags: ['salary', 'benefits', 'pension', 'dividends'],
  },
  {
    id: 'housing',
    tags: [
      'rent',
      'mortgage',
      'utilities',
      'energy',
      'water',
      'property_tax',
      'levies',
      'home_security',
      'broadcasting_fee',
      'diy',
      'furniture',
    ],
  },
  {
    id: 'telecom',
    tags: ['telecom', 'mobile', 'internet'],
  },
  {
    id: 'groceries',
    tags: ['supermarket', 'bakery'],
  },
  {
    id: 'food',
    tags: ['restaurant', 'fast_food', 'food_delivery', 'coffee'],
  },
  {
    id: 'transport',
    tags: ['fuel', 'public_transport', 'rideshare', 'parking', 'tolls', 'car', 'car_rental', 'flights', 'ferry'],
  },
  {
    id: 'health',
    tags: ['pharmacy', 'medical', 'fitness', 'drugstore'],
  },
  {
    id: 'insurance',
    tags: ['insurance', 'health_insurance', 'home_insurance', 'vehicle_insurance', 'life_insurance'],
  },
  {
    id: 'shopping',
    tags: ['online_shopping', 'clothing', 'electronics', 'general_stores', 'pets'],
  },
  {
    id: 'leisure',
    tags: ['subscriptions', 'streaming', 'games', 'accommodation', 'education', 'donations'],
  },
  {
    id: 'software',
    tags: ['software', 'hosting'],
  },
  {
    id: 'finance',
    tags: ['bank_fees', 'interest', 'investments', 'cash', 'tax'],
  },
  {
    id: 'transfer',
    tags: ['own_account_transfer', 'card_settlement'],
  },
] as const

export type Tag = (typeof TAG_GROUPS)[number]['tags'][number]

export const TAGS: Tag[] = TAG_GROUPS.flatMap((group) => [...group.tags])

/**
 * The group (heading) of a tag, e.g. 'groceries' for 'supermarket'.
 */
export const getTagGroup = (tag: string) => {
  return TAG_GROUPS.find((group) => (group.tags as readonly string[]).includes(tag))?.id
}
