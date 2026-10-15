'use client'

import { Alert, Box, Button, Step as MuiStep, StepLabel, Stepper, Tab, Tabs } from '@mui/material'
import type { KeyboardEvent } from 'react'
import { Fragment, useMemo, useState } from 'react'

import type { CustomParserMapping, RowData, SetupDraft, StatsFile } from '@/types'
import { SetupPreviewTab, SetupStep } from '@/types-enums'
import {
  getAmountValues,
  getHeaderRowProblem,
  getPreview,
  isNamed,
  isValidPreview,
  toDraft,
  toMapping,
  useMutateAddCustomParser,
} from '@/m-custom-parser/service'
import { detectMapping, getMatchingNumberFormats, looksLikeHeader } from '@/utils/Parser'
import { useTranslation } from '@/lib/i18n'

import { useWorkspaceFiles } from '../../../../context'
import PreviewSection from '../../../PreviewSection'
import { getPreviewCaption, getPreviewMessageKey, SETUP_STEPS } from '../../actions'
import AccountForm from '../AccountForm'
import AmountFormats from '../AmountFormats'
import ColumnMapping from '../ColumnMapping'
import CsvRows from '../CsvRows'
import HeaderRowSection from '../HeaderRowSection'
import SetupPreview from '../SetupPreview'
import StepIcon from '../StepIcon'
import StepPanel from '../StepPanel'
import { HEADER_ROW_PROBLEM_KEYS, STEP_LABEL_KEYS } from './actions'
import { ui } from './styled'

type SetupStepsProps = {
  file: StatsFile
  rows: RowData[]
  scrollElement: HTMLElement | null
  onSaved: (mapping: CustomParserMapping) => void
}

const Component = ({ file, rows, scrollElement, onSaved }: SetupStepsProps) => {
  const sx = ui()
  const { t } = useTranslation()
  const { setSelectedFileIds } = useWorkspaceFiles()
  const { mutate: addCustomParser, isPending, error: saveError } = useMutateAddCustomParser()
  const [previewTab, setPreviewTab] = useState<SetupPreviewTab>(SetupPreviewTab.PREVIEW)
  const [draft, setDraft] = useState<SetupDraft>(() =>
    toDraft(detectMapping(rows), { accountName: t('STATS_PAGE.PARSER_SETUP.DEFAULT_ACCOUNT_NAME') }),
  )
  const preview = useMemo(() => getPreview(rows, draft), [rows, draft])
  const [step, setStep] = useState<SetupStep>(SetupStep.REVIEW)
  // Steps are reached in order, those up to the furthest one can be opened from the stepper, back and forth
  const [furthestIndex, setFurthestIndex] = useState(0)
  const stepIndex = SETUP_STEPS.indexOf(step)
  const previousStep = SETUP_STEPS[stepIndex - 1]
  // The columns can only be mapped with a row of column names
  const headerProblem = getHeaderRowProblem(rows, draft.headerIndex)
  // Possible (e.g. numbered columns), so only a warning
  const isDataRow = !looksLikeHeader(rows[draft.headerIndex] ?? [])

  const update = (changes: Partial<SetupDraft>) => setDraft((prev) => ({ ...prev, ...changes }))

  // The columns differ per header row, so they are detected again, keeping the account
  const changeHeaderRow = (headerIndex: number) => {
    setDraft((prev) => ({
      ...toDraft(detectMapping(rows, headerIndex), { bankName: prev.bankName, accountName: prev.accountName }),
      currency: prev.currency,
    }))
  }

  const save = () => {
    const mapping = toMapping(draft, rows)

    if (!mapping) {
      return
    }

    addCustomParser(mapping, {
      onSuccess: () => {
        setSelectedFileIds((prev) => (prev.includes(file.id) ? prev : [...prev, file.id]))
        onSaved(mapping)
      },
    })
  }

  const goTo = (nextStep: SetupStep) => {
    setStep(nextStep)
    setFurthestIndex((prev) => Math.max(prev, SETUP_STEPS.indexOf(nextStep)))
  }

  const backButton = previousStep ? (
    <Button onClick={() => goTo(previousStep)}>{t('STATS_PAGE.PARSER_SETUP.BACK')}</Button>
  ) : null

  // Like the date format: picked when connecting the amounts, can be changed if they don't tell (e.g. only "1,234")
  const amountValues = useMemo(
    () => getAmountValues({ rows, headerIndex: draft.headerIndex, columns: draft.columns }),
    [rows, draft.headerIndex, draft.columns],
  )
  const isNumberMismatch =
    amountValues.length > 0 && !getMatchingNumberFormats(amountValues).includes(draft.numberFormat)

  // Also above the buttons, which are disabled without a preview
  const previewMessageKey = getPreviewMessageKey(preview)
  const previewWarning = previewMessageKey ? <Alert severity="warning">{t(previewMessageKey)}</Alert> : null

  const renderStep = () => {
    switch (step) {
      case SetupStep.REVIEW:
        return (
          <StepPanel
            title={t('STATS_PAGE.PARSER_SETUP.QUESTION')}
            isFullWidth
            actions={
              <Button variant="contained" onClick={() => goTo(SetupStep.FIX)} disabled={!!headerProblem}>
                {t('STATS_PAGE.PARSER_SETUP.CONTINUE')}
              </Button>
            }
          >
            <AmountFormats draft={draft} isNumberMismatch={isNumberMismatch} onChange={update} />
            <HeaderRowSection rows={rows} headerIndex={draft.headerIndex} onChange={changeHeaderRow} />
            {/* Why "Continue" is disabled */}
            {headerProblem ? (
              <Alert severity="error" sx={sx.problem}>
                <strong>{t(HEADER_ROW_PROBLEM_KEYS[headerProblem])}</strong>{' '}
                {t('STATS_PAGE.PARSER_SETUP.HEADER_ROW_PROBLEM')}
              </Alert>
            ) : isDataRow ? (
              // Possible (e.g. numbered columns), so it doesn't block
              <Alert severity="warning" sx={sx.problem}>
                <strong>{t('STATS_PAGE.PARSER_SETUP.HEADER_ROW_DATA')}</strong>{' '}
                {t('STATS_PAGE.PARSER_SETUP.HEADER_ROW_DATA_HINT')}
              </Alert>
            ) : null}
          </StepPanel>
        )
      case SetupStep.FIX:
        return (
          <StepPanel
            title={t('STATS_PAGE.PARSER_SETUP.FIX_TITLE')}
            hint={t('STATS_PAGE.PARSER_SETUP.FIX_HINT')}
            isFullWidth
            actions={
              <>
                <Button variant="contained" onClick={() => goTo(SetupStep.NAME)} disabled={!isValidPreview(preview)}>
                  {t('STATS_PAGE.PARSER_SETUP.CONTINUE')}
                </Button>
                {backButton}
              </>
            }
          >
            <ColumnMapping rows={rows} draft={draft} onChange={update} />
            {previewWarning}
          </StepPanel>
        )
      case SetupStep.NAME:
        return (
          <StepPanel
            title={t('STATS_PAGE.PARSER_SETUP.NAME_TITLE')}
            hint={t('STATS_PAGE.PARSER_SETUP.NAME_HINT')}
            actions={
              <>
                <Button
                  variant="contained"
                  onClick={save}
                  disabled={!isNamed(draft) || !isValidPreview(preview) || isPending}
                  loading={isPending}
                >
                  {t('STATS_PAGE.PARSER_SETUP.CONFIRM')}
                </Button>
                {backButton}
              </>
            }
          >
            <AccountForm draft={draft} onChange={update} />
            {previewWarning}
            {saveError ? (
              <Alert severity="error">{t('STATS_PAGE.PARSER_SETUP.SAVE_FAILED', { message: saveError.message })}</Alert>
            ) : null}
          </StepPanel>
        )
    }
  }

  return (
    <Box sx={sx.content}>
      {/* Above the steps, so changes to the columns show right away */}
      <PreviewSection
        title={t('STATS_PAGE.PARSER_SETUP.REVIEW_TITLE')}
        file={file}
        caption={getPreviewCaption({ preview, isCsv: previewTab === SetupPreviewTab.CSV, rows }, t)}
      >
        <Tabs value={previewTab} onChange={(_, tab: SetupPreviewTab) => setPreviewTab(tab)} sx={sx.tabs}>
          <Tab value={SetupPreviewTab.PREVIEW} label={t('STATS_PAGE.PARSER_SETUP.TAB.PREVIEW')} sx={sx.tab} />
          <Tab value={SetupPreviewTab.CSV} label={t('STATS_PAGE.PARSER_SETUP.TAB.CSV')} sx={sx.tab} />
        </Tabs>
        {previewTab === SetupPreviewTab.PREVIEW ? (
          <SetupPreview
            preview={preview}
            currency={draft.currency}
            dateFormat={draft.dateFormat}
            scrollElement={scrollElement}
          />
        ) : (
          <CsvRows rows={rows} scrollElement={scrollElement} />
        )}
      </PreviewSection>
      {/* Non-linear, so steps after the current one aren't disabled when going back. Steps not reached yet are opened
          with the buttons of the steps. */}
      <Stepper nonLinear activeStep={stepIndex} sx={sx.stepper}>
        {SETUP_STEPS.map((item, index) => (
          <MuiStep key={item} completed={index < furthestIndex}>
            {/* A label rather than a `StepButton`, which changes the layout */}
            <StepLabel
              slots={{ stepIcon: StepIcon }}
              {...(index <= furthestIndex && item !== step
                ? {
                    role: 'button',
                    tabIndex: 0,
                    onClick: () => goTo(item),
                    onKeyDown: (event: KeyboardEvent) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        goTo(item)
                      }
                    },
                  }
                : null)}
            >
              {t(STEP_LABEL_KEYS[item])}
            </StepLabel>
          </MuiStep>
        ))}
      </Stepper>
      {/* Remounted per step, otherwise the buttons are reused and animate e.g. from enabled to disabled */}
      <Fragment key={step}>{renderStep()}</Fragment>
    </Box>
  )
}

export default Component
