'use client'

import { Search } from '@mui/icons-material'
import { Box, InputAdornment, Link, TextField, Typography } from '@mui/material'
import NextLink from 'next/link'
import { Fragment, useMemo, useState } from 'react'

import type { CategoryId, CategoryRuleset, CategoryTree, LibraryKeyword } from '@/types'
import { CategoryDirection } from '@/types-enums'
import { ROUTES } from '@/common'
import { NewCategoryDialog, SegmentedToggle } from '@/components'
import type { RulesetUpdate } from '@/m-category/service'
import {
  addNamedCategory,
  getCategoryLabel,
  getLibraryKeywords,
  groupKeywordsByHint,
  searchLibraryKeywords,
  setHintMapping,
  setKeywordMapping,
} from '@/m-category/service'
import { HINT_GROUPS, toCategoryId } from '@/utils/Category'
import { toggleKeys } from '@/utils/Set'
import { Trans, useTranslation } from '@/lib/i18n'

import { EXCLUDED, getCategoryOptions, getKeywordHintMapping, NO_MAPPING } from './actions'
import HintRow from './components/HintRow'
import KeywordRow from './components/KeywordRow'
import { ui } from './styled'

type LibrarySectionProps = {
  ruleset: CategoryRuleset
  tree: CategoryTree
  onUpdate: (update: RulesetUpdate) => void
}

/**
 * Which categories what the library recognises goes into, for money out or in: by hint (grouped under headings), or by
 * single library keyword. Searching lists the matching library keywords.
 */
const Component = ({ ruleset, tree, onUpdate }: LibrarySectionProps) => {
  const sx = ui()
  const { t } = useTranslation()
  const [direction, setDirection] = useState<CategoryDirection>(CategoryDirection.OUT)
  const [query, setQuery] = useState('')
  // Hints showing their library keywords, all collapsed at first
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const libraryKeywords = useMemo(() => getLibraryKeywords(), [])
  const keywordsByHint = useMemo(() => groupKeywordsByHint(libraryKeywords), [libraryKeywords])
  const mappings = ruleset.mappings[direction]
  const options = useMemo(() => getCategoryOptions({ tree, direction, t }), [tree, direction, t])
  const found = query.trim() ? searchLibraryKeywords({ libraryKeywords, query, t }) : null

  const toLabel = (id: string | null) => (id ? getCategoryLabel({ id, tree, t }) : null)

  // Searched for in a category select, asks where to add it, then maps to it (in one change)
  const [creating, setCreating] = useState<{ name: string; map: (category: CategoryId) => RulesetUpdate } | null>(null)

  const createAndMap = ({ label, parentId }: { label: string; parentId: CategoryId | null }) => {
    if (creating) {
      const { id, update } = addNamedCategory({ ruleset, label, parentId, direction })
      onUpdate((current) => creating.map(id)(update(current)))
    }
    setCreating(null)
  }

  const renderKeyword = (libraryKeyword: LibraryKeyword, depth: number, showHint = false) => {
    const own = mappings.keywords[libraryKeyword.id]

    return (
      <KeywordRow
        key={libraryKeyword.id}
        libraryKeyword={libraryKeyword}
        depth={depth}
        value={own === null ? EXCLUDED : (own ?? NO_MAPPING)}
        hintCategoryLabel={toLabel(getKeywordHintMapping({ libraryKeyword, mappings }))}
        hintLabel={showHint ? t(libraryKeyword.hint, { ns: 'hints' }) : undefined}
        options={options}
        onChange={(value) =>
          onUpdate(
            setKeywordMapping({
              direction,
              key: libraryKeyword.id,
              category: value === EXCLUDED ? null : value ? toCategoryId(value) : undefined,
            }),
          )
        }
        onCreate={(name) =>
          setCreating({ name, map: (category) => setKeywordMapping({ direction, key: libraryKeyword.id, category }) })
        }
      />
    )
  }

  const renderHint = (hint: string) => {
    const isExpanded = expanded.has(hint)
    const hintKeywords = keywordsByHint.get(hint) ?? []

    return (
      <Fragment key={hint}>
        <HintRow
          label={t(hint, { ns: 'hints' })}
          keywordCount={hintKeywords.length}
          isExpanded={isExpanded}
          onToggle={() => setExpanded((prev) => toggleKeys(prev, [hint]))}
          value={mappings.hints[hint] ?? NO_MAPPING}
          options={options}
          onChange={(value) =>
            onUpdate(setHintMapping({ direction, key: hint, category: value ? toCategoryId(value) : undefined }))
          }
          onCreate={(name) =>
            setCreating({ name, map: (category) => setHintMapping({ direction, key: hint, category }) })
          }
        />
        {isExpanded ? hintKeywords.map((libraryKeyword) => renderKeyword(libraryKeyword, 0)) : null}
      </Fragment>
    )
  }

  return (
    <Box component="section">
      <Typography component="h3" sx={sx.title}>
        {t('RULESETS_PAGE.LIBRARY.SECTION_TITLE')}
      </Typography>
      <Typography component="p" sx={sx.description}>
        <Trans
          i18nKey="RULESETS_PAGE.LIBRARY.DESCRIPTION"
          components={{ library: <Link component={NextLink} href={ROUTES.LIBRARY} /> }}
        />
      </Typography>

      <Box sx={sx.toolbar}>
        <SegmentedToggle
          value={direction}
          onChange={setDirection}
          options={[
            { value: CategoryDirection.OUT, label: t('RULESETS_PAGE.LIBRARY.MONEY_OUT') },
            { value: CategoryDirection.IN, label: t('RULESETS_PAGE.LIBRARY.MONEY_IN') },
          ]}
        />
        <TextField
          size="small"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('RULESETS_PAGE.LIBRARY.SEARCH')}
          slotProps={{
            htmlInput: { 'aria-label': t('RULESETS_PAGE.LIBRARY.SEARCH') },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={sx.searchIcon} />
                </InputAdornment>
              ),
            },
          }}
          sx={sx.search}
        />
      </Box>

      {found ? (
        found.length ? (
          found.map((libraryKeyword) => renderKeyword(libraryKeyword, -1, true))
        ) : (
          <Typography component="p" sx={sx.empty}>
            {t('RULESETS_PAGE.LIBRARY.NO_MATCHES')}
          </Typography>
        )
      ) : (
        // Groups are headings only, hints are what rule sets map
        HINT_GROUPS.map((group) => (
          <Box key={group.id} sx={sx.group}>
            <Typography component="h4" sx={sx.groupTitle}>
              {t(`GROUPS.${group.id}`, { ns: 'hints' })}
            </Typography>
            {group.hints.map(renderHint)}
          </Box>
        ))
      )}

      {creating ? (
        <NewCategoryDialog
          name={creating.name}
          tree={tree}
          direction={direction}
          onSave={createAndMap}
          onClose={() => setCreating(null)}
        />
      ) : null}
    </Box>
  )
}

export default Component
