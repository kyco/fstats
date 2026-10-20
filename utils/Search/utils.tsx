import type { TextRange } from '@/types'

// Accents, e.g. of "ä" once decomposed into "a" and the diaeresis
const COMBINING_MARKS = /\p{M}/gu

/**
 * Lowercase text without accents and "ß" as "ss", so e.g. "muller" finds "Müller" and "strasse" finds "Straße".
 */
const foldText = (text: string) => {
  return text.toLowerCase().normalize('NFD').replace(COMBINING_MARKS, '').replace(/ß/g, 'ss')
}

/**
 * Query of the search field, see `foldText`. Empty when there is nothing to search for.
 */
export const toSearchQuery = (search: string) => {
  return foldText(search.trim())
}

/**
 * Text of the cells to search in, see `foldText`. Separated, so matches don't span cells.
 */
export const toSearchText = (cells: string[]) => {
  return foldText(cells.join('\n'))
}

type FilterBySearchProps<T> = {
  rows: T[]
  searchTexts: string[]
  query: string
}

/**
 * The rows whose search text (see `toSearchText`, by row index) contains the query, all rows without a query.
 */
export const filterBySearch = <T,>({ rows, searchTexts, query }: FilterBySearchProps<T>) => {
  return query ? rows.filter((_, index) => searchTexts[index].includes(query)) : rows
}

/**
 * The ranges of the matches of the query (see `toSearchQuery`), e.g. "a" matches the "ä" of "Bäcker".
 */
const getSearchRanges = (text: string, query: string) => {
  const ranges: TextRange[] = []

  if (!query) {
    return ranges
  }

  // Folded per character with the original range of each folded character, as folding can change the length (ß to ss)
  let folded = ''
  const starts: number[] = []
  const ends: number[] = []
  let index = 0

  for (const char of text) {
    const foldedChar = foldText(char)
    folded += foldedChar

    for (let i = 0; i < foldedChar.length; i++) {
      starts.push(index)
      ends.push(index + char.length)
    }
    index += char.length
  }

  let last = 0

  for (let match = folded.indexOf(query); match !== -1; match = folded.indexOf(query, match + query.length)) {
    const start = starts[match]

    // Skips a match starting within the character the previous one ended in (e.g. "s" in "ß")
    if (start >= last) {
      const end = ends[match + query.length - 1]
      ranges.push([start, end])
      last = end
    }
  }

  return ranges
}

/**
 * Splits the text into parts, the odd ones match the query (see `getSearchRanges`) or are in the other ranges (e.g. the
 * matches of a rule). Overlapping ones are merged.
 */
export const splitMatches = (text: string, query: string, ranges: TextRange[] = []) => {
  const sorted = [...getSearchRanges(text, query), ...ranges].sort((a, b) => a[0] - b[0])
  const merged: TextRange[] = []

  for (const [start, end] of sorted) {
    const previous = merged.at(-1)

    if (previous && start <= previous[1]) {
      previous[1] = Math.max(previous[1], end)
    } else {
      merged.push([start, end])
    }
  }

  const parts: string[] = []
  let last = 0

  for (const [start, end] of merged) {
    parts.push(text.slice(last, start), text.slice(start, end))
    last = end
  }

  parts.push(text.slice(last))
  return parts
}

/**
 * The text with the matches of the search query (and the other ranges, see `splitMatches`) wrapped in `<mark>`.
 */
export const highlightMatches = (text: string, query: string, ranges?: TextRange[]) => {
  // eslint-disable-next-line react/no-array-index-key
  return splitMatches(text, query, ranges).map((part, index) => (index % 2 ? <mark key={index}>{part}</mark> : part))
}
