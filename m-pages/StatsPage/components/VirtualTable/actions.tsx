import type { VirtualTableColumn } from '@/types'

// Of the header and each row, including the border. Also the estimate of the virtualizer, which measures rows
export const ROW_HEIGHT = 28 // px

// Relative, columns without a width get an equal share
const DEFAULT_COLUMN_WIDTH = 100

export const OVERSCAN = 20

/**
 * CSS widths of the columns. Relative widths become percentages. With fixed px columns, the percentages would add up
 * to more than the table width, so the widest relative column is left `auto` to take the remaining space instead.
 */
export const getColWidths = (columns: VirtualTableColumn[] | null, columnCount: number) => {
  const relativeWidths = Array.from({ length: columnCount }, (_, index) =>
    columns?.[index]?.fixedWidth === undefined ? (columns?.[index]?.width ?? DEFAULT_COLUMN_WIDTH) : 0,
  )
  const totalWidth = relativeWidths.reduce((sum, width) => sum + width, 0)
  const hasFixed = columns?.some((column) => column.fixedWidth !== undefined) ?? false
  const autoIndex = hasFixed ? relativeWidths.indexOf(Math.max(...relativeWidths)) : -1

  return relativeWidths.map((width, index) => {
    const fixedWidth = columns?.[index]?.fixedWidth

    if (fixedWidth !== undefined) {
      return `${fixedWidth}px`
    }

    return index === autoIndex ? 'auto' : `${(width / totalWidth) * 100}%`
  })
}

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
 * Splits the text into parts, the odd ones match the query (see `toSearchQuery`), e.g. "a" matches the "ä" of "Bäcker".
 */
export const splitMatches = (text: string, query: string) => {
  if (!query) {
    return [text]
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

  const parts: string[] = []
  let last = 0

  for (let match = folded.indexOf(query); match !== -1; match = folded.indexOf(query, match + query.length)) {
    const start = starts[match]

    // Skips a match starting within the character the previous one ended in (e.g. "s" in "ß")
    if (start >= last) {
      const end = ends[match + query.length - 1]
      parts.push(text.slice(last, start), text.slice(start, end))
      last = end
    }
  }

  parts.push(text.slice(last))
  return parts
}

/**
 * The text with the matches of the search query wrapped in `<mark>`.
 */
export const highlightMatches = (text: string, query: string) => {
  // eslint-disable-next-line react/no-array-index-key
  return splitMatches(text, query).map((part, index) => (index % 2 ? <mark key={index}>{part}</mark> : part))
}
