import { ui as toolbarUi } from '../ViewToolbar/styled'

export const ui = () => {
  return {
    // Same as the other views, so the toolbar doesn't change when switching
    toolbar: toolbarUi().toolbar,
    // Like the view switches of the other views' toolbars
    title: {
      flexGrow: 1,
      minWidth: 0,
      m: 0,
      fontSize: 13,
      fontWeight: 700,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    closeButton: {
      mr: -0.75,
    },
    closeIcon: {
      fontSize: 18,
    },
    scroll: {
      flexGrow: 1,
      minHeight: 0,
      overflowY: 'auto',
      p: 2,
    },
  }
}
