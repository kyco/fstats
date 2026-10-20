'use client'

import { Add, LabelOutlined } from '@mui/icons-material'
import { Button, Grid } from '@mui/material'
import { useState } from 'react'

import { EmptyDisplay, PageWrapper } from '@/components'
import { useActiveRuleset } from '@/m-category/service'
import { useTranslation } from '@/lib/i18n'

import { NewRulesetDialog, RulesetEditor, RulesetList } from './components'

/**
 * The user's rule sets: their categories and the rules assigning them. One is active and decides the categories on the
 * stats page.
 */
const Component = () => {
  const { t } = useTranslation()
  const { ruleset: activeRuleset, rulesets, setActiveId, isLoading } = useActiveRuleset()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  // The active one until another is selected
  const selected = rulesets.find((ruleset) => ruleset.id === selectedId) ?? activeRuleset

  if (isLoading) {
    return <PageWrapper />
  }

  return (
    <PageWrapper>
      {/* Without rule sets, in place of the list and the editor */}
      {rulesets.length ? (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <RulesetList
              rulesets={rulesets}
              activeId={activeRuleset?.id}
              selectedId={selected?.id}
              onSelect={setSelectedId}
              onActivate={setActiveId}
              onCreate={() => setIsCreating(true)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            {selected ? (
              <RulesetEditor
                key={selected.id}
                ruleset={selected}
                rulesets={rulesets}
                isActive={selected.id === activeRuleset?.id}
              />
            ) : null}
          </Grid>
        </Grid>
      ) : (
        <EmptyDisplay
          icon={LabelOutlined}
          title={t('RULESETS_PAGE.NO_RULESETS_TITLE')}
          subtitle={t('RULESETS_PAGE.NO_RULESETS')}
          onClick={() => setIsCreating(true)}
          actions={
            <Button variant="contained" startIcon={<Add />} onClick={() => setIsCreating(true)}>
              {t('RULESETS_PAGE.NEW_RULESET')}
            </Button>
          }
        />
      )}

      <NewRulesetDialog
        isOpen={isCreating}
        rulesets={rulesets}
        onClose={() => setIsCreating(false)}
        onCreated={(id) => {
          setSelectedId(id)
          setIsCreating(false)
        }}
      />
    </PageWrapper>
  )
}

export default Component
