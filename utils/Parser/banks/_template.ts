/**
 * Template for adding a bank.
 *
 * 1. Copy to `utils/Parser/banks/{bank_id}.ts`, rename the export and
 *    update every field to match the bank's CSV export
 * 2. Export it from `banks/index.ts` and add it to `BANKS` in `registry.ts`
 * 3. Add the new parser IDs to the "should derive literal ID types" test
 *    in `utils/Parser/__tests__/index.test.ts`
 * 4. Run `pnpm typecheck` and `pnpm test`, then upload a real export
 */
import { AccountType, Country, Currency } from '@/types-enums'

import { defineBank } from '../definition'

export const newBank = defineBank({
  /**
   * Unique ID in snake_case, e.g. 'ing' or 'first_national'.
   * Changing it later requires bumping `PARSER_VERSION`.
   */
  id: 'new_bank',
  /**
   * Display name.
   */
  name: 'New Bank',
  /**
   * Bank website.
   */
  url: 'https://www.example.com/',
  /**
   * Shown on the home page. New countries: add to `Country` in
   * `types-enums/index.ts` and to `COUNTRY` in `public/locales/{en,de}.json`.
   */
  country: Country.GB,
  /**
   * Currency of all amounts, e.g. `Currency.EUR`, `Currency.GBP`.
   */
  currency: Currency.GBP,
  /**
   * One entry per CSV format, e.g. one per account type, or an old and a new
   * export of the same account. A file must match exactly one format.
   */
  formats: [
    {
      /**
       * Unique within the bank, in snake_case, usually the account name, e.g.
       * 'current', 'giro', 'visa'. An old export of the same account gets a
       * suffix, e.g. 'giro_legacy'. Changing it later requires bumping
       * `PARSER_VERSION`.
       */
      id: 'current',
      /**
       * `AccountType.CURRENT`, `AccountType.SAVINGS` or
       * `AccountType.CREDIT_CARD`. New types: add to `AccountType`.
       */
      accountType: AccountType.CURRENT,
      /**
       * Display name, e.g. 'Current Account', 'Giro', 'Visa'.
       */
      accountName: 'Current Account',
      /**
       * date-fns format (https://date-fns.org/docs/parse), e.g.
       * 'dd/MM/yyyy', 'dd.MM.yyyy', 'yyyy-MM-dd HH:mm'.
       * Rows with a non-matching date are skipped (e.g. footers).
       */
      dateFormat: 'dd/MM/yyyy',
      /**
       * 'en' for "1,234.56", 'de' for "1.234,56".
       */
      numberFormat: 'en',
      /**
       * All CSV headers as in the file, any order (case, whitespace and quotes
       * are ignored). The header row is found automatically. A file matches if
       * all non-optional headers are present. Optional header:
       *
       *   { header: 'Balance', optional: true }
       */
      headers: [
        'Date',
        'Type',
        'Description',
        'Reference',
        'Money In',
        'Money Out',
        { header: 'Balance', optional: true },
      ],
      /**
       * Required fields, values are headers from `headers`.
       */
      columns: {
        /**
         * Parsed with `dateFormat`.
         */
        date: 'Date',
        /**
         * E.g. the payee or booking text. A list uses the first non-empty column, e.g.
         * `['Name', 'Description']`.
         */
        description: 'Description',
        /**
         * One of:
         *
         *   { type: 'signed', header: 'Amount' }
         *   One column, negative for money out.
         *
         *   { type: 'inOut', in: 'Money In', out: 'Money Out' }
         *   Separate columns. Out is always stored as negative, whether the
         *   file has it positive or negative.
         *
         *   { type: 'firstOf', headers: ['Money In', 'Money Out', 'Fee'] }
         *   First non-empty of several signed columns.
         */
        amount: {
          type: 'inOut',
          in: 'Money In',
          out: 'Money Out',
        },
      },
      /**
       * Optional data, values are headers from `headers` or `null`:
       * - `balance`: balance after the transaction
       * - `reference`: payment reference
       * - `transactionType`: e.g. 'Direct Debit', 'Card Payment'
       * - `category`, `parentCategory`: the bank's own categories
       */
      extraColumns: {
        balance: 'Balance',
        reference: 'Reference',
        transactionType: 'Type',
        category: null,
        parentCategory: null,
      },
    },
  ],
})
