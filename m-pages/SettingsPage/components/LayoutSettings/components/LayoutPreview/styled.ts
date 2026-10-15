import { sxTile } from '@/styles/styled'

export const ui = () => {
  const changed = (isChanged: boolean) => ({
    fontWeight: isChanged ? 700 : 400,
    color: isChanged ? 'text.primary' : 'text.secondary',
  })

  const block = (basis: number) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
    minHeight: 0,
    borderRadius: '4px',
    bgcolor: 'action.selected',
    fontSize: 11,
    color: 'text.secondary',
    fontVariantNumeric: 'tabular-nums',
    flexBasis: `${basis}%`,
  })

  return {
    tile: (isSelected: boolean) => ({
      ...sxTile(isSelected),
      position: 'relative',
    }),

    check: {
      position: 'absolute',
      top: 12,
      right: 12,
      fontSize: 20,
    },

    tileTitle: {
      mb: 1.5,
      fontWeight: 600,
      color: 'text.primary',
    },

    tileCaption: {
      mt: 1,
      color: 'text.secondary',
      fontVariantNumeric: 'tabular-nums',
    },

    diagram: {
      display: 'flex',
      gap: '3px',
      height: 96,
    },

    leftColumn: (basis: number) => ({
      display: 'flex',
      flexDirection: 'column',
      gap: '3px',
      minWidth: 0,
      flexBasis: `${basis}%`,
    }),

    changed: changed,

    block: block,

    // Explorer and file sidebar in the left column, bold when changed
    splitBlock: (basis: number, isChanged: boolean) => ({
      ...block(basis),
      ...changed(isChanged),
    }),
  }
}
