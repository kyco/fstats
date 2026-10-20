import type { Theme } from '@mui/material/styles'
import type { CSSProperties } from 'react'

const focusedBackground = (theme: Theme) => ({
  backgroundColor: `rgba(${theme.vars.palette.info.mainChannel} / 0.24)`,
})

export const ui = () => {
  return {
    // Equal width digits, so numbers align across rows
    tabularNums: { fontVariantNumeric: 'tabular-nums' } as const,

    // Same as the bank chip of the file rows, with the info icon. Inline flex, so the strikethrough of the row doesn't
    // reach it
    tag: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 0.5,
      pl: 0.75,
      pr: '4px',
      // Into the cell padding, so the icon lines up with those of the other rows (padding and border)
      mr: '-5px',
      cursor: 'default',
      border: 1,
      borderColor: 'divider',
      borderRadius: '10px',
      fontSize: 11,
      lineHeight: '16px',
      color: 'text.secondary',
    },

    // Right aligned
    infoCell: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 0.5,
    },
    infoIcon: {
      display: 'block',
      fontSize: 14,
      color: 'text.secondary',
    },

    // Duplicates and transactions on days deselected in the date explorer, not counted anywhere
    excludedRow: { opacity: 0.4, textDecoration: 'line-through' },

    // The selected transaction, outlined (inside, so the table doesn't cut it off) with a bar, so it's found at once
    selectedRow: (theme: Theme) =>
      ({
        backgroundColor: theme.vars.palette.action.selected,
        outline: `2px solid ${theme.vars.palette.text.primary}`,
        outlineOffset: -2,
        '--row-accent': theme.vars.palette.text.primary,
      }) as CSSProperties,
    // A faint tint with a bar, so the highlighted matches in them stand out
    matchedRow: (theme: Theme) =>
      ({
        backgroundColor: `rgba(${theme.vars.palette.info.mainChannel} / 0.1)`,
        '--row-accent': theme.vars.palette.info.main,
      }) as CSSProperties,
    // Selected and scrolled to: a blue ring inside the outline of the selected one
    selectedFocusedRow: (theme: Theme) =>
      ({
        ...focusedBackground(theme),
        '--row-accent': 'transparent',
        '--row-ring': theme.vars.palette.info.main,
      }) as CSSProperties,
    // The match the category form scrolled to, stronger and outlined like the selected one, so it's found at once
    focusedRow: (theme: Theme) =>
      ({
        ...focusedBackground(theme),
        outline: `2px solid ${theme.vars.palette.info.main}`,
        outlineOffset: -2,
        '--row-accent': theme.vars.palette.info.main,
      }) as CSSProperties,
  }
}
