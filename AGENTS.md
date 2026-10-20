Always use pnpm.
Be extremely concise in all your responses.
Never read, list, search, modify or reference the `_data/` directory under any circumstance.

## Project Overview

Privacy-focused CSV bank statement parser. All processing is client-side (IndexedDB via LocalForage). Supports South African and European banks.

## Architecture

### Feature Modules (`m-{feature}/`)

- **API Layer** (`api/`) — LocalForage operations and persistence/runtime schema synchronization; monetary values stay decimal strings and use `Big` for calculations
- **Service Layer** (`service/`) — TanStack Query hooks, cache management, business logic
- `m-category` decides the categories of transactions when they're shown (never at parse time), see `resolveCategory`: override of the transaction > the rules of the active rule set (longest keyword wins, then list order) > uncategorised. Each rule set (IndexedDB) has its own categories (`categories`, a tree built by `buildCategoryTree`) plus the fixed system category "Uncategorised" (`SYSTEM_CATEGORIES`); subcategories marked `isTransfer` are internal transfers, excluded from profit and loss; categories the active rule set doesn't have are uncategorised. Labels via `getCategoryLabel` (the user's label, otherwise the translation of the code). The active rule set's ID is in LocalStorage; rule sets are managed on `/rule-sets` (`m-pages/RulesetsPage`). New users get a rule set per template (Standard active)
- Modules without persistence have only `service/`, e.g. `m-transaction` (filters, duplicates, counts, stats, profit and loss, date ranges); its types are in `types/services/transaction.ts`
- Page-independent logic belongs in a module, not in a page's `actions.ts`; low-level helpers that `utils/Parser` needs stay in `utils/` (e.g. `utils/Stats`)

### Page Modules (`m-pages/{Name}Page/`)

- One module per route (`app/{route}/page.tsx` only renders it): `index.tsx`, `actions.ts` (pure helpers), `styled.ts` (`ui()` sx objects), `components/{Component}/` (same structure, nested per component), `hooks/` (page hooks, one per file, exported from `hooks/index.ts`)
- `StatsPage` (`/stats`) is the main 3-column page: file explorer | data or stats view (`?view=stats`) | file sidebar; demo mode via `?demo=true`. Its `context.ts` holds synchronous UI state only (demo mode, file pickers)
- Translations in `public/locales/{en,de}.json`, namespaced per page (e.g. `STATS_PAGE.*`); category labels in `public/locales/categories/{en,de}.json` (`categories` namespace, keyed by code, via `getCategoryLabel`); always update both files

### Component Structure (`components/`, `m-pages/`)

- One React component per file: `{Component}/index.tsx`; child components go in `{Component}/components/{Child}/` (same structure)
- Local `styled.ts` exports only `ui()` (returns the component's style objects, consumed as `const sx = ui()`) and `styled()` components; no loose style exports. Shared `sx*` styles/helpers (e.g. `sxTile`) live only in the global `styles/styled.ts`
- Styles go in `styled.ts` next to the component; small inline `sx`/`style` (1–2 props, fits on one line) is fine — move it once it has 3+ props or wraps
- Helper functions and constants the component needs go in `actions.ts` next to it
- Component props are typed in the component file; all other types go in the global `types/` folder — keep it flat (e.g. all page types in `types/pages.ts`)
- Same for hooks and helper functions (anywhere in the codebase): an object parameter is typed as `{Name}Props` (e.g. `UseFileHelperProps`) directly above the function, not inline or in `types/` — unless other code uses the same type, then it goes in `types/`
- Hooks and helper functions with 3+ parameters take a single `{Name}Props` object instead (easier to read and pass values), unless positional params are clearly more natural (e.g. callbacks matching a library signature). Exception: `styled.ts` — `ui()` and style functions keep inline positional params, no Props object

### Data Access Rules

- Components use the service layer (`m-*/service/`) for data access and business logic (hooks and helpers)
- Components must NOT import API layer directly
- Don't use React Context for async state — use TanStack Query
- Use LocalStorage for lightweight preferences and UI state (e.g., view options and selected file IDs); keep imported statement data in IndexedDB via the feature layers

## Core Constraints

- All data processing is **client-side only** — no uploads, no tracking, no accounts
- Use `Big` from `@/lib/w-big` for monetary calculations (never native numbers)
- Dates in storage must be ISO strings (`zDateTimeString`)
- Support light/dark themes and EN/DE locales
- Never change the values of `MISC.LS_*` keys or persisted IDs (would lose users' stored data/preferences)

## Checks

`pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm exec prettier --check <files>`. Stale route types after moving pages: delete `.next/types`.

## Adding a New Bank / CSV Format

Banks are declarative definitions in `utils/Parser/banks/`. `BANKS` in `utils/Parser/registry.ts` is the single registry; `BuiltInParserId`, `BuiltInBankAccountId` and `zParserId` are derived from it. Users can also set up custom parsers for unsupported files (`m-custom-parser/`, stored in IndexedDB), which are only tried when no built-in format matches.

1. Copy `utils/Parser/banks/_template.ts` (documents every field) to `utils/Parser/banks/new_bank.ts`, or add a format to an existing bank
2. Export from `utils/Parser/banks/index.ts` and add to `BANKS` in `utils/Parser/registry.ts`
   - New account type: add it to `AccountType` in `types-enums/index.ts`
   - Update the expected IDs in the "should derive literal ID types" test (`utils/Parser/__tests__/index.test.ts`)
3. IDs: each format has an `id`, unique within the bank, in snake_case, usually the account name (`'giro'`, `'visa'`, `'current'`); an old export of the same account gets a suffix (`'giro_legacy'`). Parser ID = `{bank.id}__{format.id}`, bank account ID = `{bank.id}__{accountType}` (shared by formats of the same account, part of transaction IDs — never change it).
4. A file must match exactly one format. The registry test fails if a format's required headers are a subset of another format's headers — make sure `headers` lists all headers of the file.
5. Changing how existing files are parsed or renaming a bank or format `id`: bump `PARSER_VERSION` in `utils/Parser/create-parser.ts`, so stored files are re-parsed.
6. Add the bank to the README list under its country. The homepage "Supported banks" list derives from `BANKS` via `getSupportedBanks()` (`m-pages/HomePage/actions.ts`).

## Adding a Category Template

Templates are declarative definitions in `utils/Category/templates/` (like banks), which users create a rule set from (then it's theirs, template changes don't affect it). `TEMPLATES` in `utils/Category/registry.ts` is the registry. Copy `utils/Category/templates/_template.ts` (documents every field), add it to `TEMPLATES`, its name to `RULESETS_PAGE.TEMPLATES` and the labels of new category codes to `public/locales/categories/{en,de}.json`. Category codes end up in users' overrides — reuse a code only when it means the same.
