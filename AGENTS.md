Always use pnpm.
Be extremely concise in all your responses.
Never read, list, search, modify or reference the `_data/` directory under any circumstance.

## Project Overview

Privacy-focused CSV bank statement parser. All processing is client-side (IndexedDB via LocalForage). Supports South African and European banks.

## Architecture

### Feature Modules (`m-{feature}/`)

- **API Layer** (`api/`) — LocalForage operations and persistence/runtime schema synchronization; monetary values stay decimal strings and use `Big` for calculations
- **Service Layer** (`service/`) — TanStack Query hooks, cache management, business logic

### Page Modules (`m-pages/{Name}Page/`)

- One module per route (`app/{route}/page.tsx` only renders it): `index.tsx`, `actions.ts` (pure helpers), `styled.ts` (`ui()` sx objects), `components/{Component}/` (same structure, nested per component)
- `StatsPage` (`/stats`) is the main 3-column page: file explorer | data or stats view (`?view=stats`) | file sidebar; demo mode via `?demo=true`. Its `context.ts` holds synchronous UI state only (demo mode, file pickers)
- Translations in `public/locales/{en,de}.json`, namespaced per page (e.g. `STATS_PAGE.*`); category labels in `public/locales/categories/{en,de}.json` (`categories` namespace, keyed by code, via `getCategoryLabel`); always update both files

### Component Structure (`components/`, `m-pages/`)

- One React component per file: `{Component}/index.tsx`; child components go in `{Component}/components/{Child}/` (same structure)
- Styles go in `styled.ts` next to the component; small inline `sx`/`style` (1–2 props, fits on one line) is fine — move it once it has 3+ props or wraps
- Helper functions and constants the component needs go in `actions.ts` next to it
- Component props are typed in the component file; all other types go in the global `types/` folder — keep it flat (e.g. all page types in `types/pages.ts`)

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
