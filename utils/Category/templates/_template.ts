/**
 * Template for adding a category template, which users can create a rule set from (and then change).
 *
 * 1. Copy to `utils/Category/templates/{template_id}.ts` and rename the export
 * 2. Export it from `templates/index.ts` and add it to `TEMPLATES` in `registry.ts`
 * 3. Add its name and description to `RULESETS_PAGE.TEMPLATES` and `RULESETS_PAGE.TEMPLATE_DESCRIPTIONS`, and the
 *    labels of new categories to `public/locales/categories/{en,de}.json`
 * 4. Run `pnpm typecheck` and `pnpm test`
 */
import { defineTemplate } from '../definition'

export const newTemplate = defineTemplate({
  /**
   * Unique ID in snake_case, e.g. 'germany'.
   */
  id: 'new_template',
  income: {
    /**
     * Parent categories for money in, with the IDs of their subcategories. IDs are slugs, unique in the template (parent
     * categories and subcategories), labelled by their translations. Reuse an ID of another template only when it means
     * the same. With `isTransfer`, the subcategories are internal transfers, excluded from profit and loss.
     * Transactions nothing assigns are uncategorised, there's no category for that.
     */
    categories: [
      { id: 'income', color: 'green', children: ['salary'] },
      { id: 'income_transfers', color: 'cyan', children: ['transfers_in'], isTransfer: true },
    ],
    /**
     * Categories of what the library recognises (see `utils/Category/library/`), by hint (`HINTS`), for money in (also
     * zero amounts). Unmapped hints stay uncategorised.
     */
    hints: {
      salary: 'salary',
      own_account_transfer: 'transfers_in',
      card_settlement: 'transfers_in',
    },
    /**
     * Optional: categories of single library keywords, before their hints (`null` leaves them uncategorised).
     */
    keywords: {
      'global.dividends': 'salary',
    },
  },
  /**
   * Like `income`, for money out.
   */
  expense: {
    categories: [{ id: 'food', color: 'orange', children: ['groceries'] }],
    hints: {
      supermarket: 'groceries',
      bakery: 'groceries',
    },
  },
})
