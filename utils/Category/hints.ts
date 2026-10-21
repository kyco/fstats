/**
 * What library keywords are (see `utils/Category/library/`), e.g. 'supermarket'. A flat list: each library keyword has
 * one hint, rule sets map hints (and single library keywords) to their categories. The groups are only headings, e.g.
 * on `/library`. Translated in `public/locales/hints/{en,de}.json` (groups under `GROUPS`).
 *
 * Stored in users' rule sets: never rename or reuse one.
 */
export const HINT_GROUPS = [
  {
    id: 'income',
    hints: ['salary', 'benefits', 'pension', 'dividends'],
  },
  {
    id: 'housing',
    hints: [
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
    hints: ['telecom', 'mobile', 'internet'],
  },
  {
    id: 'groceries',
    hints: ['supermarket', 'bakery'],
  },
  {
    id: 'food',
    hints: ['restaurant', 'fast_food', 'food_delivery', 'coffee'],
  },
  {
    id: 'transport',
    hints: ['fuel', 'public_transport', 'rideshare', 'parking', 'tolls', 'car', 'car_rental', 'flights', 'ferry'],
  },
  {
    id: 'health',
    hints: ['pharmacy', 'medical', 'fitness', 'drugstore'],
  },
  {
    id: 'insurance',
    hints: ['insurance', 'health_insurance', 'home_insurance', 'vehicle_insurance', 'life_insurance'],
  },
  {
    id: 'shopping',
    hints: ['online_shopping', 'clothing', 'electronics', 'general_stores', 'pets'],
  },
  {
    id: 'leisure',
    hints: ['subscriptions', 'streaming', 'games', 'accommodation', 'education', 'donations'],
  },
  {
    id: 'software',
    hints: ['software', 'hosting'],
  },
  {
    id: 'finance',
    hints: ['bank_fees', 'interest', 'investments', 'cash', 'tax'],
  },
  {
    id: 'transfer',
    hints: ['own_account_transfer', 'card_settlement'],
  },
] as const

export type Hint = (typeof HINT_GROUPS)[number]['hints'][number]

export const HINTS: Hint[] = HINT_GROUPS.flatMap((group) => [...group.hints])

/**
 * The group (heading) of a hint, e.g. 'groceries' for 'supermarket'.
 */
export const getHintGroup = (hint: string) => {
  return HINT_GROUPS.find((group) => (group.hints as readonly string[]).includes(hint))?.id
}
