import type { HeaderRowProblem } from '@/types-enums'
import { SetupStep } from '@/types-enums'

export const HEADER_ROW_PROBLEM_KEYS: Record<HeaderRowProblem, string> = {
  names: 'STATS_PAGE.PARSER_SETUP.HEADER_ROW_PROBLEMS.NAMES',
  columnCount: 'STATS_PAGE.PARSER_SETUP.HEADER_ROW_PROBLEMS.COLUMN_COUNT',
}

export const STEP_LABEL_KEYS: Record<SetupStep, string> = {
  [SetupStep.REVIEW]: 'STATS_PAGE.PARSER_SETUP.STEP.REVIEW',
  [SetupStep.FIX]: 'STATS_PAGE.PARSER_SETUP.STEP.FIX',
  [SetupStep.NAME]: 'STATS_PAGE.PARSER_SETUP.STEP.NAME',
}
