/**
 * Template for adding a category template, which users can create a rule set from (and then change).
 *
 * 1. Copy to `utils/Category/templates/{template_id}.ts` and rename the export
 * 2. Export it from `templates/index.ts` and add it to `TEMPLATES` in `registry.ts`
 * 3. Add its name to `RULESETS_PAGE.TEMPLATES` and the labels of new category codes to
 *    `public/locales/categories/{en,de}.json`
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
     * Parent categories for money in, with the codes of their subcategories (`{PARENT}_{NN}`). Codes of other
     * templates can be reused when they mean the same, a category set for a single transaction then stays when
     * switching rule sets. The system category "Uncategorised" (`SYSTEM_CATEGORIES`) is always there. With
     * `isTransfer`, the subcategories are internal transfers, excluded from profit and loss (e.g. 'TRI' and 'TRO' of
     * the standard template).
     */
    categories: [
      { code: 'INC', color: 'green', children: ['INC_01'] },
      { code: 'TRI', color: 'cyan', children: ['TRI_01'], isTransfer: true },
    ],
    /**
     * Rules for money in (also zero amounts). Keywords match whole words of the description, ignoring case. When
     * several keywords match, the longest wins.
     */
    rules: [
      {
        category: 'INC_01',
        keywords: ['SALARY'],
      },
    ],
  },
  /**
   * Like `income`, for money out.
   */
  expense: {
    categories: [{ code: 'GRO', color: 'orange', children: ['GRO_01'] }],
    rules: [
      {
        category: 'GRO_01',
        keywords: ['REWE', 'ALDI'],
      },
    ],
  },
})
