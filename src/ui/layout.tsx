import { AppBar, Box, Container, Paper, Stack, Toolbar, Typography } from '@mui/material'
import { alpha, styled } from '@mui/material/styles'

export const PageRoot = styled(Box)(({ theme }) => ({
  height: '100dvh',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  backgroundColor: theme.palette.background.default,
  backgroundImage: `radial-gradient(1200px 400px at 20% 0%, ${alpha(
    theme.palette.primary.main,
    0.14,
  )}, transparent 60%),
  radial-gradient(900px 300px at 80% 10%, ${alpha(theme.palette.secondary.main, 0.1)}, transparent 55%)`,
}))

export const GlassAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.common.white, 0.72),
  backdropFilter: 'blur(10px)',
  borderBottom: `1px solid ${theme.palette.divider}`,
  color: theme.palette.text.primary,
}))

export const HeaderToolbar = styled(Toolbar)(({ theme }) => ({
  gap: 12,
  alignItems: 'flex-start',
  paddingTop: 12,
  paddingBottom: 12,
  [theme.breakpoints.up('sm')]: {
    alignItems: 'center',
  },
  [theme.breakpoints.down('sm')]: {
    flexWrap: 'wrap',
    rowGap: 12,
  },
}))

export const HeaderLeft = styled(Stack)(() => ({
  flex: 1,
}))

export const HeaderTitle = styled(Typography)(() => ({
  fontWeight: 800,
  letterSpacing: -0.4,
}))

export const GlassCard = styled(Paper)(({ theme }) => ({
  borderRadius: 20,
  backgroundColor: alpha(theme.palette.common.white, 0.72),
  backdropFilter: 'blur(10px)',
  overflow: 'hidden',
  [theme.breakpoints.down('sm')]: {
    borderRadius: 16,
  },
}))

export const PaddedGlassCard = styled(GlassCard)(() => ({
  padding: 16,
}))

export const ContentContainer = styled(Container)(({ theme }) => ({
  flex: 1,
  minHeight: 0,
  display: 'flex',
  flexDirection: 'column',
  paddingTop: 12,
  paddingBottom: 12,
  paddingLeft: 6,
  paddingRight: 6,
  [theme.breakpoints.up('sm')]: {
    paddingLeft: 12,
    paddingRight: 12,
    paddingTop: 16,
    paddingBottom: 16,
  },
}))
