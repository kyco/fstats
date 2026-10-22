# Categorisation

How transactions get their categories, and how to extend it. Categories are resolved when transactions are shown, never
at parse time, so changing anything here needs no `PARSER_VERSION` bump.

## Terms

Shown in the UI with a letter (`LibraryRef`):

| UI                     | Code                               | What it is                                                                 |
| ---------------------- | ---------------------------------- | -------------------------------------------------------------------------- |
| **Tag (T)**            | tag (`TAGS`, `mappings.tags`)      | Built in, what a transaction is (Benefits), has keywords, mapped at once   |
| **Keyword (K)**        | library keyword (`LibraryKeyword`) | Built in, a named merchant or bank text (Kindergeld), mapped on its own    |
| **Rule (R)**, built in | `LibraryKeyword.keywords[]`        | The texts a keyword recognises (KINDERGELD, FAMILIENKASSE)                 |
| **Rule (R-001)**       | `CategoryRule`                     | Yours, a keyword you create; kept in your library, shared by all rule sets |

The headings tags are listed under on `/library` (`TAG_GROUPS`, e.g. Groceries) are sections without a letter.

## Principles

- **Two layers.** The library says _what_ a transaction is (e.g. "REWE, a supermarket"). A rule set says _which
  category_ that is for this user. The library never names a category.
- **The user owns their categories.** Rule sets are copied from templates once and never follow template changes. A tax
  rule set, an accounting rule set and a personal one can be switched between and categorise the same identified
  transactions differently.
- **Unknown is fine.** An unrecognised or unmapped transaction stays uncategorised. Nothing guesses.
- **The user always wins.** Overrides and the user's own rules come before the library.
- **Explainable.** Every category has a visible source: an override, a rule (`R-014`), a tag (T) or a library keyword (K)
  (`de.rewe`), with the matched text highlighted.
- **Offline.** The library is bundled with the app; nothing is fetched or sent.

## Resolution order

First match wins (see `resolveCategory` in `m-category/service/engine.ts`):

1. **Override** of the transaction in the active rule set (set for that transaction only; overrides belong to a rule set)
2. **Preset** (demo data only)
3. **Rules** of the active rule set: the longest matching keyword wins, then list order. A rule the rule set doesn't map
   itself but that belongs to a tag or library keyword (`library`) applies where the rule set maps that (by direction,
   like step 4)
4. **Library**: the best matching library keyword identifies the transaction, then the rule set maps it:
   1. `mappings[direction].keywords[id]` (that library keyword only; `null` = don't categorise it)
   2. `mappings[direction].tags[tag]` for its tag
   3. otherwise: recognised, but not mapped → uncategorised
5. **Uncategorised** (`null`, not a category)

Categories the rule set doesn't have (e.g. one deleted) are skipped.

### Choosing the library keyword

Library keywords limited to the transaction's bank win over general ones, then the more specific match: `equals` > `startsWith` >
`containsWord`, then the longer keyword, then the ID (deterministic). The winning library keyword is always the result, even
when the rule set doesn't map it: falling through to a weaker match would be surprising.

## The library (`utils/Category/library/`)

One library, built in and the same for all rule sets (rule sets only store mappings). Browsable on `/library`
(`m-pages/LibraryPage`); `getLibraryHref` links to a tag, library keyword or rule.

Packs of library keywords (`libraryKeywords`), registered in `LIBRARY` (`utils/Category/registry.ts`) like `BANKS`:

- `global.ts` (international), `de.ts`, `gb.ts`, `za.ts`, … by country
- `banks/{bank}.ts`: texts of one bank (fees, interest, card settlements), only matched for its transactions (`bank`)

A library keyword (documented in `library/_template.ts`):

| Field       | Meaning                                                                                                  |
| ----------- | -------------------------------------------------------------------------------------------------------- |
| `id`        | Unique in the pack, snake_case. The full ID `{pack}.{id}` (e.g. `de.rewe`) is stored in users' rule sets |
| `name`      | Shown to the user, e.g. "REWE"                                                                           |
| `tag`       | What it is, one of `TAGS` (`utils/Category/tags.ts`)                                                     |
| `keywords`  | Matched as whole words, ignoring case, all words of a keyword in any order                               |
| `match`     | Optional: `startsWith` or `equals` for short or ambiguous names                                          |
| `direction` | Optional: `in` or `out`, e.g. tax refunds vs. tax payments                                               |
| `examples`  | 1–3 anonymised descriptions as banks write them; tested to resolve to this library keyword               |

### Tags (`utils/Category/tags.ts`)

A flat list (`supermarket`, `bakery`, `bank_fees`, …): each library keyword has exactly one tag, a rule set maps each
tag to one of its categories (no inheritance). `TAG_GROUPS` only groups them under headings (Groceries, Transport, …)
for browsing; groups can't be mapped. Translated in `public/locales/tags/{en,de}.json` (groups under `GROUPS`). Tags
describe; they don't decide: a tax rule set can split what a personal one groups.

### Stable IDs

Library keyword IDs (`{pack}.{id}`) and tag IDs end up in users' rule sets: never rename or reuse them. Remove a library keyword only when
it is wrong; its mappings then do nothing.

## Templates (`utils/Category/templates/`)

Starter rule sets: categories plus `tags` (tag → category) and optionally `keywords` (library keyword → category). Creating a
rule set copies them; later template changes only reach rule sets created afterwards. Templates change often until they
fit many users, so nothing depends on them: the engine only knows the active rule set.

Current template: `default` (Standard: about 12 broad categories, one of them for self-employed work). Category IDs are
plain slugs (`groceries`), generated ones are random (`c_k3m9qz7w`); nothing is encoded in them.

## Your rules (IndexedDB)

The user's own library: keyword rules (`CategoryRule`, store `fstats__category_rules`), shared by all rule sets like the
built-in library. A rule set maps a rule to one of its categories; editing a rule changes it everywhere, deleting it
removes it from all rule sets. Listed on `/library` with where they're used.

A rule can belong to a tag or library keyword (`library`, optional), extending the library for this user (e.g. another
benefit with "Benefits", added on `/library` with "Add rule to this tag"). It then goes wherever each rule set maps that
tag or library keyword, unless the rule set maps the rule itself. Its own mapping wins.

"Suggest for the library" on a rule opens the issue form `.github/ISSUE_TEMPLATE/new-library-keyword.yml`, prefilled with
the rule (`getRuleIssueHref`); nothing is sent, the user reviews it on GitHub.

## Rule sets (IndexedDB)

`categories`, `rules` (which of your rules it uses, rule ID → category) and `mappings` (per direction: tags and library keywords →
category). Categories, rules and what's mapped to a category are changed on `/rule-sets`; where tags and library
keywords go in each rule set, and your rules, on `/library`; and from a transaction ("this transaction", "all from REWE", "all matching" a new rule).

## Quality gates (tests)

`m-category/service/__tests__/library.test.ts`:

- IDs unique, valid tags, non-empty keywords (at least 3 characters), tags translated
- every example resolves to its own library keyword against the whole library (none shadows another)
- bank packs reference existing banks

`utils/Category/__tests__/registry.test.ts`: templates map only to their own categories (right direction), the standard
and country templates map every tag the library uses for money out, translations exist.

## Contributing library keywords

1. Add the library keyword to the pack of its country (or `global.ts`, or `banks/{bank}.ts` for bank texts)
2. Pick the fitting tag; add a new one to `TAG_GROUPS` and both `tags` locale files only when none fits
3. Add real-looking, anonymised examples (no names, IBANs or account numbers)
4. `pnpm test`

Prefer precision over coverage: a missing library keyword leaves a transaction uncategorised, a wrong one silently miscategorises
it.

## Status

Done:

- Library packs, tags, library keyword and tag mappings in rule sets, templates as mappings
- Engine order above, bank-limited library keywords, candidate index
- "Recognised as …" source on transactions, "all from …" mapping from a transaction
- Mapping tags and library keywords per rule set on `/library`, search them
- Templates for the UK and South Africa
- Rules belonging to a tag or library keyword, "Suggest for the library" from a rule

Next:

- **Change notice**: snapshot categories per rule set; after an update or edit show "12 transactions changed category"
  with the list, and an option to keep the old ones as overrides
- **Coverage panel**: share categorised by source, top uncategorised descriptions with "create rule"
- **Signals besides text**: SEPA creditor ID, IBAN, MCC where banks export them
- Lazy-load packs by country once the library is large
