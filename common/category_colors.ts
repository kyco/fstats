import {
  amber,
  blue,
  blueGrey,
  brown,
  cyan,
  deepOrange,
  deepPurple,
  green,
  indigo,
  lightBlue,
  lightGreen,
  lime,
  orange,
  pink,
  purple,
  red,
  teal,
} from '@mui/material/colors'

import type { GradientColorsLightDark } from '@/types'
import type { CategoryColor } from '@/types-enums'

type Hue = Record<300 | 400 | 500 | 700 | 800 | 900, string>

const toColors = (hue: Hue, isLight = false): GradientColorsLightDark => {
  return isLight
    ? { light: { start: hue[800], end: hue[400] }, dark: { start: hue[900], end: hue[500] } }
    : { light: { start: hue[700], end: hue[300] }, dark: { start: hue[900], end: hue[400] } }
}

/**
 * Colours of the parent categories, chosen per parent category in the rule sets.
 */
export const CATEGORY_COLORS: Record<CategoryColor, GradientColorsLightDark> = {
  green: toColors(green),
  teal: toColors(teal),
  lightGreen: toColors(lightGreen),
  lime: toColors(lime, true),
  cyan: toColors(cyan),
  lightBlue: toColors(lightBlue),
  blue: toColors(blue),
  indigo: toColors(indigo),
  deepPurple: toColors(deepPurple),
  purple: toColors(purple),
  pink: toColors(pink),
  red: toColors(red),
  deepOrange: toColors(deepOrange),
  orange: toColors(orange),
  amber: toColors(amber, true),
  brown: toColors(brown),
  blueGrey: toColors(blueGrey),
}
