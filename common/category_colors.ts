import {
  amber,
  blue,
  blueGrey,
  brown,
  cyan,
  green,
  indigo,
  lightGreen,
  lime,
  orange,
  pink,
  purple,
  red,
  teal,
} from '@mui/material/colors'

import type { GradientColorsLightDark, ParentCategoryCode } from '@/types'

export const PARENT_CATEGORY_COLORS: Record<ParentCategoryCode, GradientColorsLightDark> = {
  // Income categories
  INC: {
    light: { start: green[700], end: green[300] },
    dark: { start: green[900], end: green[400] },
  },
  PAS: {
    light: { start: teal[700], end: teal[300] },
    dark: { start: teal[900], end: teal[400] },
  },
  OTH: {
    light: { start: lightGreen[700], end: lightGreen[300] },
    dark: { start: lightGreen[900], end: lightGreen[400] },
  },
  SIN: {
    light: { start: lime[800], end: lime[400] },
    dark: { start: lime[900], end: lime[500] },
  },
  TFI: {
    light: { start: cyan[700], end: cyan[300] },
    dark: { start: cyan[900], end: cyan[400] },
  },
  // Expense categories
  HOU: {
    light: { start: blue[700], end: blue[300] },
    dark: { start: blue[900], end: blue[400] },
  },
  TRN: {
    light: { start: indigo[700], end: indigo[300] },
    dark: { start: indigo[900], end: indigo[400] },
  },
  GRO: {
    light: { start: orange[700], end: orange[300] },
    dark: { start: orange[900], end: orange[400] },
  },
  HLT: {
    light: { start: pink[700], end: pink[300] },
    dark: { start: pink[900], end: pink[400] },
  },
  FAM: {
    light: { start: purple[700], end: purple[300] },
    dark: { start: purple[900], end: purple[400] },
  },
  FIN: {
    light: { start: red[700], end: red[300] },
    dark: { start: red[900], end: red[400] },
  },
  BUS: {
    light: { start: brown[700], end: brown[300] },
    dark: { start: brown[900], end: brown[400] },
  },
  SOU: {
    light: { start: amber[800], end: amber[400] },
    dark: { start: amber[900], end: amber[500] },
  },
  TFO: {
    light: { start: blueGrey[700], end: blueGrey[300] },
    dark: { start: blueGrey[900], end: blueGrey[400] },
  },
}
