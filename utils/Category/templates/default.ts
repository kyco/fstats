import { defineTemplate } from '../definition'

/**
 * Detailed categories, the rule set of new users.
 */
export const defaultTemplate = defineTemplate({
  id: 'default',

  income: {
    categories: [
      // Earned Income
      { code: 'INC', color: 'green', children: ['INC_01', 'INC_02', 'INC_03', 'INC_04', 'INC_05', 'INC_06'] },
      // Passive Income
      { code: 'PAS', color: 'teal', children: ['PAS_01', 'PAS_02', 'PAS_03', 'PAS_04'] },
      // Other Income
      { code: 'OTH', color: 'lightGreen', children: ['OTH_01', 'OTH_02', 'OTH_03', 'OTH_04', 'OTH_05', 'OTH_06'] },
      // Transfers between own accounts
      { code: 'TRI', color: 'cyan', children: ['TRI_01'], isTransfer: true },
    ],
    rules: [
      {
        category: 'PAS_03',
        keywords: ['Interest Received', 'INTEREST ON CREDIT BALANCE'],
      },

      {
        category: 'OTH_06',
        keywords: ['PAYMENT-THANK YOU', 'PAYMENT - THANK YOU', 'AMAZON PRIM', 'AMZN Mktp', 'STEAM PURCHASE'],
      },

      {
        category: 'TRI_01',
        keywords: ['Visa-Kartenabrechnung'],
      },
    ],
  },

  expense: {
    categories: [
      // Housing & Utilities
      {
        code: 'HOU',
        color: 'blue',
        children: ['HOU_01', 'HOU_02', 'HOU_03', 'HOU_04', 'HOU_05', 'HOU_06', 'HOU_07', 'HOU_08'],
      },
      // Transport & Mobility
      {
        code: 'TRN',
        color: 'indigo',
        children: ['TRN_01', 'TRN_02', 'TRN_03', 'TRN_04', 'TRN_05', 'TRN_06', 'TRN_07'],
      },
      // Food & Groceries
      { code: 'GRO', color: 'orange', children: ['GRO_01', 'GRO_02', 'GRO_03', 'GRO_04', 'GRO_05'] },
      // Health & Medical
      { code: 'HLT', color: 'pink', children: ['HLT_01', 'HLT_02', 'HLT_03', 'HLT_04', 'HLT_05', 'HLT_06', 'HLT_07'] },
      // Family & Lifestyle
      {
        code: 'FAM',
        color: 'purple',
        children: ['FAM_01', 'FAM_02', 'FAM_03', 'FAM_04', 'FAM_05', 'FAM_06', 'FAM_07', 'FAM_08', 'FAM_09'],
      },
      // Finance & Insurance
      { code: 'FIN', color: 'red', children: ['FIN_01', 'FIN_02', 'FIN_03', 'FIN_04', 'FIN_05', 'FIN_06', 'FIN_07'] },
      // Business & Work
      { code: 'BUS', color: 'brown', children: ['BUS_01', 'BUS_02', 'BUS_03', 'BUS_04', 'BUS_05', 'BUS_06', 'BUS_07'] },
      // Transfers between own accounts
      { code: 'TRO', color: 'cyan', children: ['TRO_01'], isTransfer: true },
    ],
    rules: [
      {
        category: 'HOU_03',
        keywords: ['TELEKOM'],
      },
      {
        category: 'HOU_05',
        keywords: ['HERKULES', 'HORNBACH', 'OBI', 'BAUHAUS', 'TOOM', 'GARDENA'],
      },
      {
        category: 'HOU_07',
        keywords: ['IKEA', 'JYSK'],
      },

      {
        category: 'GRO_01',
        keywords: [
          'REWE',
          'EDEKA',
          'ALDI',
          'LIDL',
          'PENNY',
          'NETTO',
          'Kaufland',
          'NORMA',
          'SPAR',
          'SOUTHERN CO-OP',
          'TESCO',
          'Checkers',
          'BAECKER',
          'BACKEREI',
        ],
      },

      {
        category: 'TRN_01',
        keywords: ['SHELL', 'TOTAL'],
      },
      {
        category: 'TRN_04',
        keywords: ['Parkgarage', 'PAYBYPHONE'],
      },
      {
        category: 'TRN_06',
        keywords: ['WIGHTLINK'],
      },
      {
        category: 'TRN_07',
        keywords: ['2THELOO'],
      },

      {
        category: 'FAM_05',
        keywords: ['GOOGLE*YOUTUBE', 'GOOGLE *YouTube', 'Google YouTube Dublin', 'YouTube'],
      },
      {
        category: 'FAM_06',
        keywords: ['STEAM PURCHASE', 'STEAMGAMES.COM'],
      },
      {
        category: 'FAM_09',
        keywords: ['AMZN Mktp', 'AMAZON PRIM', 'TEDI'],
      },

      {
        category: 'HLT_02',
        keywords: ['ROSSMANN', 'DM DROGERIE', 'Müller', 'APOTHEKE', 'PHARMACY'],
      },

      {
        category: 'FIN_02',
        keywords: ['Internet Banking Payment: Fnb Cheque Account'],
      },
      {
        category: 'FIN_04',
        keywords: ['Internet Banking Payment: Luno (stb)'],
      },
      {
        category: 'FIN_05',
        keywords: [
          'Monthly Account Admin Fee',
          'International Processing Card Purchase Fee',
          'INTEREST',
          '#INT PYMT FEE',
          '#CREDIT CARD ACCOUNT FEE',
          '#CREDIT FACILITY SERVICE FEE',
          'Payment Fee',
        ],
      },

      {
        category: 'BUS_03',
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
        category: 'TRO_01',
        keywords: ['Summe Monatsabrechnung Visa-Karte', 'Internet Banking Transfer'],
      },
    ],
  },
})
