import { useEffect, useMemo, useState } from 'react'
import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material'
import type { Flight, FlightsJson } from './types'
import { FlightFiltersBar, type FlightFilters } from './components/FlightFiltersBar'
import { FlightTable } from './components/FlightTable'
import { applyAllFilters } from './logic/filtering'
import {
  ContentContainer,
  GlassAppBar,
  GlassCard,
  HeaderLeft,
  HeaderTitle,
  HeaderToolbar,
  PageRoot,
  PaddedGlassCard,
} from './ui/layout'

const defaultFilters: FlightFilters = {
  search: '',
  from: '',
  to: '',
  days: [],
  status: 'All',
  aoc: 'All',
  bodyType: 'All',
}

export default function App() {
  const [allFlights, setAllFlights] = useState<Flight[]>([])
  const [filters, setFilters] = useState<FlightFilters>(defaultFilters)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch(`${import.meta.env.BASE_URL}flights.json`)
        const json = (await res.json()) as FlightsJson
        if (!cancelled) setAllFlights(json.flights)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const filteredFlights = useMemo(() => applyAllFilters(allFlights, filters), [allFlights, filters])

  const selectedCount = selectedIds.size
  const selectionSummary = useMemo(() => {
    if (selectedCount === 0) return null
    const visibleSelected = filteredFlights.filter((f) => selectedIds.has(f.id)).length
    return { visibleSelected, selectedCount }
  }, [filteredFlights, selectedCount, selectedIds])

  function clearAll() {
    setFilters(defaultFilters)
    setSelectedIds(new Set())
  }

  function requestDeleteSelected() {
    if (selectedIds.size === 0) return
    setDeleteOpen(true)
  }

  function confirmDeleteSelected() {
    const ids = selectedIds
    setAllFlights((prev) => prev.filter((f) => !ids.has(f.id)))
    setSelectedIds(new Set())
    setDeleteOpen(false)
  }

  function updateFlight(id: string, patch: Partial<Flight>) {
    setAllFlights((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)))
  }

  function deleteOne(id: string) {
    setAllFlights((prev) => prev.filter((f) => f.id !== id))
    setSelectedIds((prev) => {
      if (!prev.has(id)) return prev
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  return (
    <PageRoot>
      <GlassAppBar position="sticky" elevation={0}>
        <HeaderToolbar>
          <HeaderLeft spacing={0.25}>
            <HeaderTitle variant="h6">Flight Schedule Management</HeaderTitle>
          </HeaderLeft>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            useFlexGap
            sx={{
              flexWrap: 'wrap',
              justifyContent: { xs: 'flex-start', sm: 'flex-end' },
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            {selectionSummary && (
              <Chip
                color="primary"
                variant="outlined"
                label={
                  selectionSummary.visibleSelected === selectionSummary.selectedCount
                    ? `${selectionSummary.selectedCount} selected`
                    : `${selectionSummary.selectedCount} selected (${selectionSummary.visibleSelected} in view)`
                }
              />
            )}
            <Button
              variant="outlined"
              disabled={selectedCount === 0}
              onClick={requestDeleteSelected}
              color="error"
            >
              Delete selected
            </Button>
            <Button variant="text" onClick={clearAll}>
              Clear all
            </Button>
          </Stack>
        </HeaderToolbar>
        {loading && <LinearProgress />}
      </GlassAppBar>

      <ContentContainer maxWidth="xl">
        <Stack spacing={2} sx={{ flex: 1, minHeight: 0 }}>
          <PaddedGlassCard variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
            <FlightFiltersBar flights={allFlights} value={filters} onChange={setFilters} />
          </PaddedGlassCard>

          <GlassCard variant="outlined" sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <FlightTable
              flights={filteredFlights}
              totalFlights={allFlights.length}
              selectedIds={selectedIds}
              onSelectedIdsChange={setSelectedIds}
              onUpdateFlight={updateFlight}
              onDeleteFlight={deleteOne}
            />
          </GlassCard>
        </Stack>
      </ContentContainer>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Delete selected flights?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will remove {selectedIds.size} flight record(s) from local state. This action can’t be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={confirmDeleteSelected}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </PageRoot>
  )
}
