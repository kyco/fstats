'use client'

import { CloseOutlined } from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  IconButton,
  Step as MuiStep,
  StepLabel,
  Stepper,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import type { KeyboardEvent } from 'react'
import { useMemo, useState } from 'react'

import type { RowData, StatsFile } from '@/types'
import { getSetupChange, getWorkspaceHref } from '@/common'
import { useMutateAddCustomParser } from '@/m-custom-parser/service'
import { useFileRows } from '@/m-stats-file/service'
import { detectMapping, getMatchingNumberFormats, looksLikeHeader } from '@/utils/Parser'
import { useTranslation } from '@/lib/i18n'

import { useWorkspaceFiles } from '../../context'
import PreviewSection from '../PreviewSection'
import type { HeaderRowProblem, SetupDraft } from './actions'
import {
  getAmountValues,
  getHeaderRowProblem,
  getPreview,
  getPreviewCaption,
  getPreviewMessageKey,
  isNamed,
  isValidPreview,
  SETUP_STEPS,
  SetupStep,
  toDraft,
  toMapping,
} from './actions'
import {
  AccountForm,
  AmountFormats,
  ColumnMapping,
  CsvRows,
  HeaderRowSection,
  SetupPreview,
  StepIcon,
  StepPanel,
} from './components'
import { ui } from './styled'

type ParserSetupProps = {
  /**
   * A file of a detected format, see `isConvertible`.
   */
  file: StatsFile
}

/**
 * Middle column view to set up a custom parser for a file of a detected format, one step at a time like an onboarding:
 * the detected transactions are confirmed (or the columns fixed), then the currency and the account name.
 */
const Component = ({ file }: ParserSetupProps) => {
  const sx = ui()
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data, isLoading, error } = useFileRows(file)
  // State rather than a ref, so the tables re-render once the scroll element exists
  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(null)

  const close = () => router.replace(getWorkspaceHref(searchParams, getSetupChange(null)))

  return (
    <>
      <Box sx={sx.toolbar}>
        <Box component="h2" sx={sx.title} title={file.file.name}>
          {t('STATS_PAGE.PARSER_SETUP.TITLE', { file: file.file.name })}
        </Box>
        <Tooltip title={t('STATS_PAGE.PARSER_SETUP.CLOSE')}>
          <IconButton size="small" onClick={close} aria-label={t('STATS_PAGE.PARSER_SETUP.CLOSE')} sx={sx.closeButton}>
            <CloseOutlined sx={sx.closeIcon} />
          </IconButton>
        </Tooltip>
      </Box>
      <Box ref={setScrollElement} sx={sx.scroll}>
        {data ? (
          // Files that weren't parsed are read as one section with all rows
          <SetupSteps file={file} rows={data[0]?.rows ?? []} scrollElement={scrollElement} onClose={close} />
        ) : (
          <Typography variant="body2" color={error ? 'error' : 'text.secondary'}>
            {error
              ? t('STATS_PAGE.DATA_VIEW.FAILED_TO_READ_FILE', { message: error.message })
              : isLoading
                ? t('MISC.LOADING')
                : null}
          </Typography>
        )}
      </Box>
    </>
  )
}

const PreviewTab = {
  PREVIEW: 'preview',
  CSV: 'csv',
} as const

type PreviewTab = (typeof PreviewTab)[keyof typeof PreviewTab]

const HEADER_ROW_PROBLEM_KEYS: Record<HeaderRowProblem, string> = {
  names: 'STATS_PAGE.PARSER_SETUP.HEADER_ROW_PROBLEMS.NAMES',
  columnCount: 'STATS_PAGE.PARSER_SETUP.HEADER_ROW_PROBLEMS.COLUMN_COUNT',
}

const STEP_LABEL_KEYS: Record<SetupStep, string> = {
  [SetupStep.REVIEW]: 'STATS_PAGE.PARSER_SETUP.STEP.REVIEW',
  [SetupStep.FIX]: 'STATS_PAGE.PARSER_SETUP.STEP.FIX',
  [SetupStep.NAME]: 'STATS_PAGE.PARSER_SETUP.STEP.NAME',
}

type SetupStepsProps = {
  file: StatsFile
  rows: RowData[]
  scrollElement: HTMLElement | null
  onClose: () => void
}

const SetupSteps = ({ file, rows, scrollElement, onClose }: SetupStepsProps) => {
  const sx = ui()
  const { t } = useTranslation()
  const { setSelectedFileIds } = useWorkspaceFiles()
  const { mutate: addCustomParser, isPending, error: saveError } = useMutateAddCustomParser()
  const [previewTab, setPreviewTab] = useState<PreviewTab>(PreviewTab.PREVIEW)
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
        onClose()
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
    () => getAmountValues(rows, draft.headerIndex, draft.columns),
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
        caption={getPreviewCaption({ preview, isCsv: previewTab === PreviewTab.CSV, rows }, t)}
      >
        <Tabs value={previewTab} onChange={(_, tab: PreviewTab) => setPreviewTab(tab)} sx={sx.tabs}>
          <Tab value={PreviewTab.PREVIEW} label={t('STATS_PAGE.PARSER_SETUP.TAB.PREVIEW')} sx={sx.tab} />
          <Tab value={PreviewTab.CSV} label={t('STATS_PAGE.PARSER_SETUP.TAB.CSV')} sx={sx.tab} />
        </Tabs>
        {previewTab === PreviewTab.PREVIEW ? (
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
      {renderStep()}
    </Box>
  )
}

export default Component
