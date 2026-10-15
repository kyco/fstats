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

    infoIcon: {
      display: 'block',
      fontSize: 14,
      color: 'text.secondary',
    },

    // Duplicates and transactions on days deselected in the date explorer, not counted anywhere
    excludedRow: { opacity: 0.4, textDecoration: 'line-through' },
  }
}
