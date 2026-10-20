# fstats

A privacy-focused bank statement parser.

Turn your bank's CSV exports into detailed income and expense stats. Everything runs in your browser: no uploads, no tracking, no account and no internet connection required.

Try it for free at [fstats.site](https://fstats.site/).

## How it works

1. Go to [fstats.site/stats](https://fstats.site/stats)
2. Turn off your internet connection (optional)
3. Add your files
4. View and analyse your statements

### Privacy

Your files are stored only in your browser and never leave your device.

By default, your files **get deleted** when you close the tab or browser window. To keep them between sessions, open the "Settings" page and enable "Persist data".

### Supported banks

#### United Kingdom

- [Lloyds](utils/Parser/banks/lloyds.ts)

#### Germany

- [Comdirect](utils/Parser/banks/comdirect.ts)
- [ING](utils/Parser/banks/ing.ts)
- [N26](utils/Parser/banks/n26.ts)
- [Trade Republic](utils/Parser/banks/trade_republic.ts)

#### South Africa

- [Capitec](utils/Parser/banks/capitec.ts)
- [FNB](utils/Parser/banks/fnb.ts)

### Categories

Transactions are categorised by the active rule set, chosen in the toolbar of the stats page. A rule set has your own categories (parent categories with subcategories, for money in or out) and the keyword rules that assign them (the longest matching keyword wins). Manage them on the rule sets page: create a rule set from a template ([Standard](utils/Category/templates/default.ts), [Minimal - Germany](utils/Category/templates/minimal_germany.ts)), as a copy or empty, then rename, add, reorder or delete categories and rules. Click the category of a transaction to change it for that transaction only, or to create a rule for all matching transactions in the active rule set.

## Development

See [DEVELOPMENT.md](DEVELOPMENT.md).

### Important files

- [utils/Parser](./utils/Parser/create-parser.ts): how CSV files are parsed
- [m-category](./m-category/service/engine.ts): how transactions are categorised
