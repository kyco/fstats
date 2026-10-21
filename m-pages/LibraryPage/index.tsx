'use client'

import { Search } from '@mui/icons-material'
import { Box, Card, InputAdornment, Link, TextField, Typography } from '@mui/material'
import NextLink from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { CONFIG, getLibraryTarget, ROUTES } from '@/common'
import { PageWrapper } from '@/components'
import {
  getLibraryKeywords,
  groupKeywordsByHint,
  searchLibraryKeywords,
  useCategoryRules,
  useCategoryRulesets,
} from '@/m-category/service'
import { HINT_GROUPS, HINTS } from '@/utils/Category'
import { Trans, useTranslation } from '@/lib/i18n'

import { getExpandedHints, getRuleUses, searchRules, toAnchorId } from './actions'
import HintSection from './components/HintSection'
import KeywordCard from './components/KeywordCard'
import RuleCard from './components/RuleCard'
import { ui } from './styled'

/**
 * The library shared by all rule sets (built in, read-only): what it recognises, by hint. Rule sets map hints and
 * library keywords to their categories. `?hint=` or `?keyword=` (see `getLibraryHref`) opens and scrolls to one.
 */
const Component = () => {
  const sx = ui()
  const { t } = useTranslation()
  const target = getLibraryTarget(useSearchParams())
  const libraryKeywords = useMemo(() => getLibraryKeywords(), [])
  const keywordsByHint = useMemo(() => groupKeywordsByHint(libraryKeywords), [libraryKeywords])
  const { data: rules = [] } = useCategoryRules()
  const { data: rulesets = [] } = useCategoryRulesets()
  const targetKeyword = libraryKeywords.find((libraryKeyword) => libraryKeyword.id === target.keyword)
  const [query, setQuery] = useState('')
  // Hints showing their specific hints and library keywords: the linked one open, unless toggled
  const targetHints = useMemo(
    () => new Set(getExpandedHints({ hint: target.hint, libraryKeyword: targetKeyword })),
    [target.hint, targetKeyword],
  )
  const [toggled, setToggled] = useState<Map<string, boolean>>(new Map())
  const isExpanded = (hint: string) => toggled.get(hint) ?? targetHints.has(hint)
  const found = query.trim() ? searchLibraryKeywords({ libraryKeywords, query, t }) : null
  const shownRules = query.trim() ? searchRules({ rules, query }) : rules
  const anchorId = target.rule
    ? toAnchorId('rule', target.rule)
    : targetKeyword
      ? toAnchorId('keyword', targetKeyword.id)
      : target.hint
        ? toAnchorId('hint', target.hint)
        : null

  // Once the rules are loaded, they're listed first
  const hasRules = !!rules.length
  useEffect(() => {
    if (anchorId) {
      requestAnimationFrame(() => document.getElementById(anchorId)?.scrollIntoView({ block: 'start' }))
    }
  }, [anchorId, hasRules])

  const toggle = (hint: string) => setToggled((prev) => new Map(prev).set(hint, !isExpanded(hint)))

  return (
    <PageWrapper>
      <Card sx={sx.card}>
        <Typography component="h1" sx={sx.title}>
          {t('LIBRARY_PAGE.TITLE')}
        </Typography>
        <Typography component="p" sx={sx.description}>
          <Trans
            i18nKey="LIBRARY_PAGE.DESCRIPTION"
            components={{ rulesets: <Link component={NextLink} href={ROUTES.RULESETS} /> }}
          />
        </Typography>
        <Typography component="p" sx={sx.description}>
          <Trans
            i18nKey="LIBRARY_PAGE.CONTRIBUTE"
            components={{
              github: <Link href={`${CONFIG.GITHUB_URL}/blob/develop/docs/categorisation.md`} target="_blank" />,
            }}
          />
        </Typography>

        <Box sx={sx.toolbar}>
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
          <Typography component="span" sx={sx.counts}>
            {t('LIBRARY_PAGE.COUNTS', { keywords: libraryKeywords.length, hints: HINTS.length })}
          </Typography>
        </Box>

        <Typography component="h2" sx={sx.sectionTitle}>
          {t('LIBRARY_PAGE.YOUR_RULES')}
        </Typography>
        {shownRules.length ? (
          <Box sx={sx.rules}>
            {shownRules.map((rule) => (
              <RuleCard
                key={rule.id}
                rule={rule}
                uses={getRuleUses({ rule, rulesets, t })}
                isTarget={toAnchorId('rule', rule.id) === anchorId}
              />
            ))}
          </Box>
        ) : (
          <Typography component="p" sx={sx.empty}>
            {t(rules.length ? 'RULESETS_PAGE.LIBRARY.NO_MATCHES' : 'LIBRARY_PAGE.NO_RULES')}
          </Typography>
        )}

        <Typography component="h2" sx={sx.sectionTitle}>
          {t('LIBRARY_PAGE.BUILT_IN')}
        </Typography>
        {found ? (
          found.length ? (
            <Box sx={sx.found}>
              {found.map((libraryKeyword) => (
                <KeywordCard key={libraryKeyword.id} libraryKeyword={libraryKeyword} showHint />
              ))}
            </Box>
          ) : (
            <Typography component="p" sx={sx.empty}>
              {t('RULESETS_PAGE.LIBRARY.NO_MATCHES')}
            </Typography>
          )
        ) : (
          // Groups are headings only, hints are what rule sets map
          HINT_GROUPS.map((group) => (
            <Box key={group.id} sx={sx.group}>
              <Typography component="h3" sx={sx.groupTitle}>
                {t(`GROUPS.${group.id}`, { ns: 'hints' })}
              </Typography>
              {group.hints.map((hint) => (
                <HintSection
                  key={hint}
                  hint={hint}
                  libraryKeywords={keywordsByHint.get(hint) ?? []}
                  isExpanded={isExpanded(hint)}
                  onToggle={() => toggle(hint)}
                  targetId={anchorId}
                />
              ))}
            </Box>
          ))
        )}
      </Card>
    </PageWrapper>
  )
}

export default Component
