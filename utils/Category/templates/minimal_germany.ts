import { defineTemplate } from '../definition'

/**
 * A few broad categories for German accounts, see `SIMPLE_CATEGORIES.md`.
 */
export const minimalGermanyTemplate = defineTemplate({
  id: 'minimal_germany',

  income: {
    categories: [
      // Income
      { code: 'SIN', color: 'lime', children: ['SIN_01', 'SIN_02'] },
      // Transfers between own accounts
      { code: 'TRI', color: 'cyan', children: ['TRI_01'], isTransfer: true },
    ],
    rules: [
      {
        category: 'SIN_01',
        keywords: ['Gehalt', 'Lohn', 'SALARY'],
      },
      {
        category: 'SIN_02',
        keywords: ['Finanzamt', 'Bundeskasse', 'Krankenkasse', 'MEDICAL AID'],
      },
      {
        category: 'TRI_01',
        keywords: ['Visa-Kartenabrechnung'],
      },
    ],
  },

  expense: {
    categories: [
      // Expenses
      { code: 'SOU', color: 'amber', children: ['SOU_01', 'SOU_02', 'SOU_03', 'SOU_04', 'SOU_05'] },
      // Transfers between own accounts
      { code: 'TRO', color: 'cyan', children: ['TRO_01'], isTransfer: true },
    ],
    rules: [
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
        category: 'TRO_01',
        keywords: ['Summe Monatsabrechnung Visa-Karte', 'Internet Banking Transfer'],
      },
    ],
  },
})
