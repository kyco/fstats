import type { ParentCategory, ParentCategoryCode } from '@/types'

// Labels are translated in `public/locales/categories/{en,de}.json`, the comments are the English ones for reference

export const INCOME_CATEGORIES: Record<ParentCategoryCode, ParentCategory> = {
  INC: {
    code: 'INC', // Earned Income
    subcategories: {
      INC_01: { code: 'INC_01' }, // Salary & Wages
      INC_02: { code: 'INC_02' }, // Freelance & Contract Work: Freelance & Self-Employment
      INC_03: { code: 'INC_03' }, // Business Income
      INC_04: { code: 'INC_04' }, // Side Hustle & Gig Work
      INC_05: { code: 'INC_05' }, // Bonuses & Commission
      INC_06: { code: 'INC_06' }, // Miscellaneous
    },
  },

  PAS: {
    code: 'PAS', // Passive Income
    subcategories: {
      PAS_01: { code: 'PAS_01' }, // Rental Income
      PAS_02: { code: 'PAS_02' }, // Investment Income
      PAS_03: { code: 'PAS_03' }, // Interest
      PAS_04: { code: 'PAS_04' }, // Miscellaneous
    },
  },

  OTH: {
    code: 'OTH', // Other Income
    subcategories: {
      OTH_01: { code: 'OTH_01' }, // Government Benefits
      OTH_02: { code: 'OTH_02' }, // Pension & Retirement
      OTH_03: { code: 'OTH_03' }, // Capital Gains
      OTH_04: { code: 'OTH_04' }, // Tax Refund
      OTH_05: { code: 'OTH_05' }, // Gifts
      OTH_06: { code: 'OTH_06' }, // Miscellaneous
    },
  },

  // Of the minimal rule sets, see `utils/Category/rulesets/minimal_germany.ts`
  SIN: {
    code: 'SIN', // Income (minimal)
    subcategories: {
      SIN_01: { code: 'SIN_01' }, // Income
      SIN_02: { code: 'SIN_02' }, // Government & Insurance
    },
  },

  TFI: {
    code: 'TFI', // Transfers & Uncategorised
    subcategories: {
      TFI_01: { code: 'TFI_01' }, // Internal Transfer
      TFI_02: { code: 'TFI_02' }, // Uncategorised
    },
  },
}

export const EXPENSE_CATEGORIES: Record<ParentCategoryCode, ParentCategory> = {
  HOU: {
    code: 'HOU', // Housing & Utilities
    subcategories: {
      HOU_01: { code: 'HOU_01' }, // Rent & Mortgage
      HOU_02: { code: 'HOU_02' }, // Utilities: Electricity, Heating, Water, Gas, Recycling
      HOU_03: { code: 'HOU_03' }, // Internet & Phone
      HOU_04: { code: 'HOU_04' }, // Home Insurance
      HOU_05: { code: 'HOU_05' }, // Maintenance & Repairs
      HOU_06: { code: 'HOU_06' }, // Levies
      HOU_07: { code: 'HOU_07' }, // Furniture & Appliances
      HOU_08: { code: 'HOU_08' }, // Miscellaneous
    },
  },

  TRN: {
    code: 'TRN', // Transport & Mobility
    subcategories: {
      TRN_01: { code: 'TRN_01' }, // Fuel & Petrol
      TRN_02: { code: 'TRN_02' }, // Vehicle Insurance
      TRN_03: { code: 'TRN_03' }, // Vehicle Maintenance: Servicing, Repairs, MOT, etc.
      TRN_04: { code: 'TRN_04' }, // Parking & Tolls
      TRN_05: { code: 'TRN_05' }, // Public Transport
      TRN_06: { code: 'TRN_06' }, // Ride-Sharing: Uber, Lyft, etc.
      TRN_07: { code: 'TRN_07' }, // Miscellaneous
    },
  },

  GRO: {
    code: 'GRO', // Food & Groceries
    subcategories: {
      GRO_01: { code: 'GRO_01' }, // Groceries
      GRO_02: { code: 'GRO_02' }, // Restaurants, Takeaways & Food Delivery
      GRO_03: { code: 'GRO_03' }, // Coffee & Drinks
      GRO_04: { code: 'GRO_04' }, // Work Lunches
      GRO_05: { code: 'GRO_05' }, // Miscellaneous
    },
  },

  HLT: {
    code: 'HLT', // Health & Medical
    subcategories: {
      HLT_01: { code: 'HLT_01' }, // Medical & Doctor Visits
      HLT_02: { code: 'HLT_02' }, // Pharmacy & Medication
      HLT_03: { code: 'HLT_03' }, // Gym & Fitness
      HLT_04: { code: 'HLT_04' }, // Health Insurance
      HLT_05: { code: 'HLT_05' }, // Mental Health & Therapy
      HLT_06: { code: 'HLT_06' }, // Wellness & Spa
      HLT_07: { code: 'HLT_07' }, // Miscellaneous
    },
  },

  FAM: {
    code: 'FAM', // Family & Lifestyle
    subcategories: {
      FAM_01: { code: 'FAM_01' }, // Childcare & Education
      FAM_02: { code: 'FAM_02' }, // Pet Care
      FAM_03: { code: 'FAM_03' }, // Clothing & Apparel
      FAM_04: { code: 'FAM_04' }, // Personal Care & Grooming
      FAM_05: { code: 'FAM_05' }, // Subscriptions (Netflix, Spotify, etc.)
      FAM_06: { code: 'FAM_06' }, // Entertainment & Leisure
      FAM_07: { code: 'FAM_07' }, // Travel & Holidays
      FAM_08: { code: 'FAM_08' }, // Gifts, Donations & Charities
      FAM_09: { code: 'FAM_09' }, // Miscellaneous
    },
  },

  FIN: {
    code: 'FIN', // Finance & Insurance
    subcategories: {
      FIN_01: { code: 'FIN_01' }, // Loan Repayments
      FIN_02: { code: 'FIN_02' }, // Credit Card Payments
      FIN_03: { code: 'FIN_03' }, // Insurance (Life, pension, disability, etc.)
      FIN_04: { code: 'FIN_04' }, // Savings & Investments
      FIN_05: { code: 'FIN_05' }, // Bank Fees & Interest
      FIN_06: { code: 'FIN_06' }, // Tax Payments
      FIN_07: { code: 'FIN_07' }, // Miscellaneous
    },
  },

  BUS: {
    code: 'BUS', // Business & Work
    subcategories: {
      BUS_01: { code: 'BUS_01' }, // Office Equipment & Supplies
      BUS_02: { code: 'BUS_02' }, // Workspace & Rent
      BUS_03: { code: 'BUS_03' }, // Software & Tools
      BUS_04: { code: 'BUS_04' }, // Marketing & Advertising
      BUS_05: { code: 'BUS_05' }, // Professional Services (Accountant, legal, etc.)
      BUS_06: { code: 'BUS_06' }, // Professional Development
      BUS_07: { code: 'BUS_07' }, // Miscellaneous
    },
  },

  // Of the minimal rule sets, see `utils/Category/rulesets/minimal_germany.ts`
  SOU: {
    code: 'SOU', // Expenses (minimal)
    subcategories: {
      SOU_01: { code: 'SOU_01' }, // Rent
      SOU_02: { code: 'SOU_02' }, // Phone & Internet
      SOU_03: { code: 'SOU_03' }, // Software & SaaS
      SOU_04: { code: 'SOU_04' }, // Travel
      SOU_05: { code: 'SOU_05' }, // Office Equipment
    },
  },

  TFO: {
    code: 'TFO', // Transfers & Uncategorised
    subcategories: {
      TFO_01: { code: 'TFO_01' }, // Internal Transfer
      TFO_02: { code: 'TFO_02' }, // Uncategorised
    },
  },
}

export const ALL_CATEGORIES: Record<ParentCategoryCode, ParentCategory> = {
  ...INCOME_CATEGORIES,
  ...EXPENSE_CATEGORIES,
}
