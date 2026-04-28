import { Box } from '@mui/material'
import { alpha, styled } from '@mui/material/styles'

export const TableRoot = styled(Box)(() => ({
  width: '100%',
  height: '100%',
  minHeight: 0,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
}))

export const TableScrollArea = styled(Box)(() => ({
  flex: 1,
  minHeight: 0,
  overflowX: 'auto',
  overflowY: 'hidden',
  WebkitOverflowScrolling: 'touch',
}))

export const TableCanvas = styled(Box)(() => ({
  minWidth: 1480,
  width: 'max-content',
  height: '100%',
  minHeight: 0,
  display: 'flex',
  flexDirection: 'column',
}))

export const EmptyState = styled(Box)(() => ({
  padding: 48,
  textAlign: 'center',
}))

export const GridRow = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'columns' && prop !== 'sticky' && prop !== 'selected',
})<{
  columns: string
  sticky?: boolean
  selected?: boolean
}>(({ theme, columns, sticky, selected }) => ({
  display: 'grid',
  gridTemplateColumns: columns,
  width: '100%',
  columnGap: 8,
  alignItems: 'center',
  paddingLeft: 8,
  paddingRight: 8,
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: sticky
    ? alpha(theme.palette.common.white, 0.78)
    : selected
      ? theme.palette.action.selected
      : theme.palette.background.paper,
  ...(sticky
    ? {
        position: 'sticky',
        top: 0,
        zIndex: 1,
        boxShadow: '0 1px 0 rgba(0,0,0,0.06)',
      }
    : {
        '&:hover': {
          backgroundColor: selected ? theme.palette.action.selected : theme.palette.action.hover,
        },
      }),
}))

export const HeaderRow = styled(GridRow)(() => ({
  height: 44,
}))

export const BodyRow = styled(GridRow)(() => ({
  height: 72,
}))
