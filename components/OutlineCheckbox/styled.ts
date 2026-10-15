export const ui = () => {
  return {
    checkbox: {
      flexShrink: 0,
      p: 0.5,
      color: 'action.disabled',
      '& .MuiSvgIcon-root': { fontSize: 18 },
      '&.Mui-checked, &.MuiCheckbox-indeterminate': { color: 'text.secondary' },
    },
  }
}
