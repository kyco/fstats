/**
 * Template for adding a built-in category rule set.
 *
 * 1. Copy to `utils/Category/rulesets/{ruleset_id}.ts` and rename the export
 * 2. Export it from `rulesets/index.ts` and add it to `RULESETS` in `registry.ts`
 * 3. Add its name to `STATS_PAGE.CATEGORY_RULES.RULESETS` in `public/locales/{en,de}.json`
 * 4. Run `pnpm typecheck` and `pnpm test`
 */
import { defineRuleset } from '../definition'

export const newRuleset = defineRuleset({
  /**
   * Unique ID in snake_case, e.g. 'germany'. Stored as the selected rule set, never change it.
   */
  id: 'new_ruleset',
  /**
   * Rules for money in (also zero amounts). Keywords match whole words of the description, ignoring case. When
   * several keywords match, the longest wins. Category codes are in `common/categories.ts`.
   */
  income: [
    {
      category: 'PAS_03',
      keywords: ['Interest Received'],
    },
  ],
  /**
   * Rules for money out, like `income`.
   */
  expense: [
    {
      category: 'GRO_01',
      keywords: ['REWE', 'ALDI'],
    },
  ],
})
