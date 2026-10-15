import { sxSubheaderText } from '@/styles/styled'

export const ui = () => {
  return {
    subheader: {
      px: 1.5,
      py: 0.5,
      ...sxSubheaderText,
      bgcolor: 'transparent',
      position: 'static',
    },
  }
}
