import { AccountType, Country, Currency } from '@/types-enums'

import { defineBank } from '../definition'

export const tradeRepublic = defineBank({
  id: 'trade_republic',
  name: 'Trade Republic',
  url: 'https://traderepublic.com/',
  country: Country.DE,
  currency: Currency.EUR,
  formats: [
    {
      id: 'current',
      accountType: AccountType.CURRENT,
      accountName: 'Cash',
      dateFormat: 'yyyy-MM-dd',
      numberFormat: 'en',
      headers: [
        'date',
        'category',
        'type',
        'amount',
        { header: 'datetime', optional: true },
        { header: 'account_type', optional: true },
        { header: 'asset_class', optional: true },
        { header: 'name', optional: true },
        { header: 'symbol', optional: true },
        { header: 'shares', optional: true },
        { header: 'price', optional: true },
        { header: 'fee', optional: true },
        { header: 'tax', optional: true },
        { header: 'currency', optional: true },
        { header: 'original_amount', optional: true },
        { header: 'original_currency', optional: true },
        { header: 'fx_rate', optional: true },
        { header: 'description', optional: true },
        { header: 'transaction_id', optional: true },
        { header: 'counterparty_name', optional: true },
        { header: 'counterparty_iban', optional: true },
        { header: 'payment_reference', optional: true },
        { header: 'mcc_code', optional: true },
      ],
      columns: {
        date: 'date',
        description: ['name', 'description'],
        amount: {
          type: 'signed',
          header: 'amount',
        },
      },
      extraColumns: {
        balance: null,
        reference: 'payment_reference',
        transactionType: 'type',
        category: 'category',
        parentCategory: null,
      },
    },
  ],
})
