import { defineLibraryPack } from '../../definition'

/**
 * Texts of FNB statements, only matched for FNB transactions.
 */
export const fnbPack = defineLibraryPack({
  id: 'fnb',
  bank: 'fnb',
  libraryKeywords: [
    {
      id: 'fees',
      name: 'FNB fees',
      tag: 'bank_fees',
      keywords: [
        'Monthly Account Admin Fee',
        'International Processing Card Purchase Fee',
        '#INT PYMT FEE',
        '#CREDIT CARD ACCOUNT FEE',
        '#CREDIT FACILITY SERVICE FEE',
        'Payment Fee',
      ],
      examples: ['#INT PYMT FEE', 'Monthly Account Admin Fee'],
    },
    {
      id: 'internet_banking_transfer',
      name: 'Internet Banking Transfer',
      tag: 'own_account_transfer',
      keywords: ['Internet Banking Transfer'],
      examples: ['Internet Banking Transfer To Savings'],
    },
  ],
})
