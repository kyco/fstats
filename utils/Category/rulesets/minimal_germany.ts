import { defineRuleset } from '../definition'

/**
 * A few broad categories for German accounts, see `SIMPLE_CATEGORIES.md`.
 */
export const minimalGermanyRuleset = defineRuleset({
  id: 'minimal_germany',

  income: [
    {
      category: 'SIN_01',
      keywords: ['Gehalt', 'Lohn', 'SALARY'],
    },
    {
      category: 'SIN_02',
      keywords: ['Finanzamt', 'Bundeskasse', 'Krankenkasse', 'MEDICAL AID'],
    },
    {
      category: 'TFI_01',
      keywords: ['Visa-Kartenabrechnung'],
    },
  ],

  expense: [
    {
      category: 'SOU_01',
      keywords: ['Miete', 'RENT'],
    },
    {
      category: 'SOU_02',
      keywords: ['TELEKOM', 'VODAFONE'],
    },
    {
      category: 'SOU_03',
      keywords: [
        'CLAUDE.AI',
        'GITHUB',
        'Google CLOUD',
        'GOOGLE*CLOUD',
        'DIGITALOCEAN.COM',
        'NAME-CHEAP.COM',
        'DNH*GODADDY',
        'Microsoft',
      ],
    },
    {
      category: 'SOU_04',
      keywords: ['DB Vertrieb', 'Deutsche Bahn', 'WIGHTLINK', 'Parkgarage', 'PAYBYPHONE'],
    },
    {
      category: 'SOU_05',
      keywords: ['IKEA'],
    },
    {
      category: 'TFO_01',
      keywords: ['Summe Monatsabrechnung Visa-Karte', 'Internet Banking Transfer'],
    },
  ],
})
