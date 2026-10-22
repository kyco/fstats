/**
 * Template for a library pack: library keywords recognising what transactions are (e.g. "REWE, a supermarket"), which rule sets
 * map to their categories. See `docs/categorisation.md`.
 *
 * 1. Add library keywords to the pack of their country (`de.ts`, `gb.ts`, `za.ts`), `global.ts`, or `banks/{bank}.ts` for texts
 *    of one bank. For a new pack, copy this file and add it to `LIBRARY` in `utils/Category/registry.ts`
 * 2. Run `pnpm test`, which checks that every example is recognised as its library keyword
 *
 * Prefer precision over coverage: a missing library keyword leaves a transaction uncategorised, a wrong one silently
 * miscategorises it.
 */
import { CategoryRuleDirection, CategoryRuleMatch, Country } from '@/types-enums'

import { defineLibraryPack } from '../definition'

export const newPack = defineLibraryPack({
  /**
   * The country in lower case ('de'), or the bank ID for bank packs. Part of the library keyword IDs, never change it.
   */
  id: 'xx',
  /**
   * Only for bank packs: their library keywords only match transactions of this bank (e.g. fee texts), and win over others.
   */
  // bank: 'fnb',
  libraryKeywords: [
    {
      /**
       * Unique in the pack, snake_case. The full ID ('xx.example_shop') is stored in users' rule sets: never rename or
       * reuse it.
       */
      id: 'example_shop',
      name: 'Example Shop',
      /**
       * What it is, one of `TAGS` (`utils/Category/tags.ts`). Add a tag (to a group of `TAG_GROUPS`, with its
       * translations in `public/locales/tags/{en,de}.json`) only when none fits.
       */
      tag: 'supermarket',
      /**
       * Matched as whole words, ignoring case; all words of a keyword in any order. At least 3 characters, avoid
       * common words, first names and surnames (e.g. not 'Müller' alone).
       */
      keywords: ['EXAMPLE SHOP', 'EXAMPLESHOP.COM'],
      /**
       * Optional: only at the start of the description, or the whole description.
       */
      match: CategoryRuleMatch.CONTAINS_WORD,
      /**
       * Optional: only money in or out (e.g. salary). Rule sets map both directions separately anyway.
       */
      direction: CategoryRuleDirection.ANY,
      /**
       * Optional: only for transactions of banks of these countries, for names meaning something else elsewhere.
       */
      countries: [Country.DE],
      /**
       * 1–3 descriptions as banks write them, anonymised (no names, IBANs or card numbers).
       */
      examples: ['EXAMPLE SHOP 1234//BERLIN/DE'],
    },
  ],
})
