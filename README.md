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

## Development

See [DEVELOPMENT.md](DEVELOPMENT.md).

### Important files

- [utils/Parser](./utils/Parser/create-parser.ts): how CSV files are parsed
