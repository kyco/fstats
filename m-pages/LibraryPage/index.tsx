'use client'

import { Add, Search } from '@mui/icons-material'
import { Box, Button, Card, InputAdornment, Link, TextField, Typography } from '@mui/material'
import NextLink from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import type { CategoryRule, LibraryKeyword, LibraryMappingTarget, LibraryRef } from '@/types'
import { CONFIG, getLibraryHref, getLibraryTarget, ROUTES } from '@/common'
import { PageWrapper } from '@/components'
import {
  buildCategoryTree,
  getLibraryKeywords,
  getRuleIssueHref,
  getRuleRef,
  groupKeywordsByTag,
  searchLibraryKeywords,
  useActiveRuleset,
  useCategoryRules,
  useMutateRemoveCategoryRule,
} from '@/m-category/service'
import { TAG_GROUPS, TAGS } from '@/utils/Category'
import { Trans, useTranslation } from '@/lib/i18n'

import { belongsToTag, getExpandedTags, getMappingSummary, getRuleUses, searchRules, toAnchorId } from './actions'
import KeywordCard from './components/KeywordCard'
import LibraryRuleDialog from './components/LibraryRuleDialog'
import MappingDialog from './components/MappingDialog'
import RuleCard from './components/RuleCard'
import TagSection from './components/TagSection'
import { ui } from './styled'

/**
 * The library shared by all rule sets (built in, read-only): what it recognises, by tag. Rule sets map tags and
 * library keywords to their categories. `?tag=` or `?keyword=` (see `getLibraryHref`) opens and scrolls to one. The
 * user's rules are listed first, and can be added here.
 */
const Component = () => {
  const sx = ui()
  const { t } = useTranslation()
  const router = useRouter()
  const target = getLibraryTarget(useSearchParams())
  const libraryKeywords = useMemo(() => getLibraryKeywords(), [])
  const keywordsByTag = useMemo(() => groupKeywordsByTag(libraryKeywords), [libraryKeywords])
  const { data: rules = [] } = useCategoryRules()
  const { ruleset: activeRuleset, rulesets } = useActiveRuleset()
  const activeTree = useMemo(
    () => (activeRuleset ? buildCategoryTree(activeRuleset.categories) : null),
    [activeRuleset],
  )
  const targetKeyword = libraryKeywords.find((libraryKeyword) => libraryKeyword.id === target.keyword)
  const [query, setQuery] = useState('')
  // A new rule without one
  // A new rule without one, belonging to `library` when added to a tag
  const [ruleDialog, setRuleDialog] = useState<{ rule?: CategoryRule; library?: LibraryRef } | null>(null)
  const { mutate: deleteRule } = useMutateRemoveCategoryRule()
  const [mappingTarget, setMappingTarget] = useState<LibraryMappingTarget | null>(null)
  // Tags showing their specific tags and library keywords: the linked one open, unless toggled
  const targetTags = useMemo(
    () => new Set(getExpandedTags({ tag: target.tag, libraryKeyword: targetKeyword })),
    [target.tag, targetKeyword],
  )
  const [toggled, setToggled] = useState<Map<string, boolean>>(new Map())
  const isExpanded = (tag: string) => toggled.get(tag) ?? targetTags.has(tag)
  const found = query.trim() ? searchLibraryKeywords({ libraryKeywords, query, t }) : null
  const shownRules = query.trim() ? searchRules({ rules, query }) : rules
  const anchorId = target.rule
    ? toAnchorId('rule', target.rule)
    : targetKeyword
      ? toAnchorId('keyword', targetKeyword.id)
      : target.tag
        ? toAnchorId('tag', target.tag)
        : null

  // Once the rules are loaded, they're listed first
  const hasRules = !!rules.length
  useEffect(() => {
    if (anchorId) {
      requestAnimationFrame(() => document.getElementById(anchorId)?.scrollIntoView({ block: 'start' }))
    }
  }, [anchorId, hasRules])

  // From the user's library and all rule sets
  // Nothing is sent, the user reviews the issue on GitHub
  const suggestWithConfirm = (rule: CategoryRule) => {
    if (confirm(t('LIBRARY_PAGE.CONFIRM_SUGGEST', { keyword: rule.keyword }))) {
      window.open(getRuleIssueHref(rule), '_blank', 'noopener,noreferrer')
    }
  }

  const renderRule = (rule: CategoryRule, hasAnchor = true) => (
    <RuleCard
      key={rule.id}
      rule={rule}
      uses={getRuleUses({ rule, rulesets, t })}
      isTarget={hasAnchor && toAnchorId('rule', rule.id) === anchorId}
      hasAnchor={hasAnchor}
      onEdit={() => setRuleDialog({ rule })}
      onDelete={() => deleteRuleWithConfirm(rule)}
      onSuggest={() => suggestWithConfirm(rule)}
    />
  )

  const deleteRuleWithConfirm = (rule: CategoryRule) => {
    const values = { rule: getRuleRef(rule.number), keyword: rule.keyword }
    if (confirm(t('STATS_PAGE.CATEGORY_RULES.CONFIRM_DELETE_RULE', values))) {
      deleteRule(rule.id)
    }
  }

  // In the active rule set
  const getMapping = (mapping: Pick<LibraryMappingTarget, 'type' | 'key'>) =>
    activeRuleset && activeTree
      ? getMappingSummary({ ruleset: activeRuleset, tree: activeTree, target: mapping, t })
      : null

  const toKeywordTarget = (libraryKeyword: LibraryKeyword): LibraryMappingTarget => ({
    type: 'keyword',
    key: libraryKeyword.id,
    name: libraryKeyword.name,
    tag: libraryKeyword.tag,
  })

  const renderKeyword = (libraryKeyword: LibraryKeyword) => (
    <KeywordCard
      key={libraryKeyword.id}
      libraryKeyword={libraryKeyword}
      showTag
      mapping={getMapping({ type: 'keyword', key: libraryKeyword.id })}
      rulesetName={activeRuleset?.name ?? null}
      onEditMapping={() => setMappingTarget(toKeywordTarget(libraryKeyword))}
    />
  )

  const toggle = (tag: string) => setToggled((prev) => new Map(prev).set(tag, !isExpanded(tag)))

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
            {t('LIBRARY_PAGE.COUNTS', { keywords: libraryKeywords.length, tags: TAGS.length })}
          </Typography>
        </Box>

        <Typography component="h2" sx={sx.sectionTitle}>
          {t('LIBRARY_PAGE.YOUR_RULES')}
        </Typography>
        <Button size="small" startIcon={<Add />} onClick={() => setRuleDialog({})} sx={sx.addRule}>
          {t('RULESETS_PAGE.ADD_RULE')}
        </Button>
        {shownRules.length ? (
          <Box sx={sx.rules}>{shownRules.map((rule) => renderRule(rule))}</Box>
        ) : (
          <Typography component="p" sx={sx.empty}>
            {t(rules.length ? 'RULESETS_PAGE.LIBRARY.NO_MATCHES' : 'LIBRARY_PAGE.NO_RULES')}
          </Typography>
        )}

        <Typography component="h2" sx={sx.sectionTitle}>
          {t('LIBRARY_PAGE.BUILT_IN')}
        </Typography>
        {activeRuleset ? (
          <Typography component="p" sx={sx.note}>
            {t('LIBRARY_PAGE.MAPPINGS_OF', { name: activeRuleset.name })}
          </Typography>
        ) : null}
        {found ? (
          found.length ? (
            <Box sx={sx.found}>{found.map(renderKeyword)}</Box>
          ) : (
            <Typography component="p" sx={sx.empty}>
              {t('RULESETS_PAGE.LIBRARY.NO_MATCHES')}
            </Typography>
          )
        ) : (
          // Groups are headings only, tags are what rule sets map
          TAG_GROUPS.map((group) => (
            <Box key={group.id} sx={sx.group}>
              <Typography component="h3" sx={sx.groupTitle}>
                {t(`GROUPS.${group.id}`, { ns: 'tags' })}
              </Typography>
              {group.tags.map((tag) => (
                <TagSection
                  key={tag}
                  tag={tag}
                  libraryKeywords={keywordsByTag.get(tag) ?? []}
                  isExpanded={isExpanded(tag)}
                  onToggle={() => toggle(tag)}
                  targetId={anchorId}
                  mapping={getMapping({ type: 'tag', key: tag })}
                  rulesetName={activeRuleset?.name ?? null}
                  getKeywordMapping={(libraryKeyword) => getMapping({ type: 'keyword', key: libraryKeyword.id })}
                  onEditMapping={(libraryKeyword) =>
                    setMappingTarget(
                      libraryKeyword
                        ? toKeywordTarget(libraryKeyword)
                        : { type: 'tag', key: tag, name: t(tag, { ns: 'tags' }) },
                    )
                  }
                  rules={rules.filter((rule) => belongsToTag(rule, tag)).map((rule) => renderRule(rule, false))}
                  onAddRule={() => setRuleDialog({ library: { type: 'tag', key: tag } })}
                />
              ))}
            </Box>
          ))
        )}
      </Card>

      {mappingTarget ? <MappingDialog target={mappingTarget} onClose={() => setMappingTarget(null)} /> : null}

      {ruleDialog ? (
        <LibraryRuleDialog
          rule={ruleDialog.rule}
          library={ruleDialog.library}
          useCount={ruleDialog.rule ? getRuleUses({ rule: ruleDialog.rule, rulesets, t }).length : 0}
          onSaved={(rule) => {
            setRuleDialog(null)
            // Shows the rule, even if the search wouldn't
            setQuery('')
            router.replace(getLibraryHref({ rule: rule.id }), { scroll: false })
          }}
          onClose={() => setRuleDialog(null)}
        />
      ) : null}
    </PageWrapper>
  )
}

export default Component
