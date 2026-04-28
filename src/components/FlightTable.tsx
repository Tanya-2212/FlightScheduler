import { useEffect, useMemo, useState } from 'react'
import {
  Checkbox,
  Chip,
  CircularProgress,
  IconButton,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { alpha, styled } from '@mui/material/styles'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import SaveIcon from '@mui/icons-material/Check'
import CancelIcon from '@mui/icons-material/Close'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import type { Flight, FlightStatus } from '../types'

import { BodyRow, EmptyState, HeaderRow, TableCanvas, TableRoot, TableScrollArea } from '../ui/table'

type Props = {
  flights: Flight[]
  totalFlights: number
  selectedIds: Set<string>
  onSelectedIdsChange: (next: Set<string>) => void
  onUpdateFlight: (id: string, patch: Partial<Flight>) => void
  onDeleteFlight: (id: string) => void
}

type RowEditDraft = Pick<Flight, 'startDate' | 'endDate' | 'std' | 'sta' | 'status'>

// Mix fixed columns with flexible "fill" columns so the table stretches nicely.
const GRID_COLS = [
  '44px', // select
  'minmax(92px, 1fr)', // id
  '64px', // aoc
  '72px', // flight #
  '64px', // origin
  '64px', // destination
  '88px', // std
  '88px', // sta
  'minmax(140px, 1fr)', // start (room for date input)
  'minmax(140px, 1fr)', // end (room for date input)
  'minmax(190px, 1.5fr)', // days (expand)
  'minmax(110px, 1fr)', // body (expand a bit)
  'minmax(150px, 1fr)', // status (expand)
  '120px', // actions
].join(' ')

function statusToggled(status: FlightStatus): FlightStatus {
  return status === 'Active' ? 'Inactive' : 'Active'
}

const Mono = styled(Typography)(() => ({
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
}))

const HeaderCell = styled(Typography)(() => ({
  fontWeight: 700,
}))

const TimeField = styled(TextField)(() => ({
  width: 88,
}))

const CellDateField = styled(TextField)(() => ({
  width: '100%',
  minWidth: 0,
}))

const BodyTypeCell = styled(Mono)(() => ({
  paddingLeft: 4,
}))

const EmptyTitle = styled(Typography)(() => ({
  fontWeight: 800,
  letterSpacing: -0.3,
}))

const TableBodyViewport = styled('div')(() => ({
  flex: 1,
  minHeight: 0,
  overflowY: 'auto',
}))

const TableSummary = styled(Stack)(({ theme }) => ({
  padding: '10px 12px',
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: alpha(theme.palette.common.white, 0.64),
}))

const DaysCell = styled(Stack)(() => ({
  minWidth: 0,
  flexWrap: 'wrap',
  alignContent: 'center',
}))

const DayChip = styled(Chip)(({ theme }) => ({
  height: 22,
  '& .MuiChip-label': {
    paddingLeft: 8,
    paddingRight: 8,
    fontSize: theme.typography.pxToRem(11),
    fontWeight: 700,
  },
}))

function DaysText({ days }: { days: number[] }) {
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  return (
    <DaysCell direction="row" spacing={0.5} useFlexGap>
      {labels
        .map((label, idx) => (days.includes(idx + 1) ? label : null))
        .filter(Boolean)
        .map((label) => (
          <DayChip key={label} size="small" label={label} color="primary" variant="outlined" />
        ))}
    </DaysCell>
  )
}

export function FlightTable(props: Props) {
  const { flights, totalFlights, selectedIds, onSelectedIdsChange, onUpdateFlight, onDeleteFlight } = props

  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<RowEditDraft | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [errorById, setErrorById] = useState<Map<string, string>>(new Map())

  useEffect(() => {
    // Cancel edit if the edited record is no longer visible.
    if (editingId && !flights.some((f) => f.id === editingId)) {
      setEditingId(null)
      setDraft(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flights.length])

  const selectedInViewCount = useMemo(() => {
    let n = 0
    for (const f of flights) if (selectedIds.has(f.id)) n++
    return n
  }, [flights, selectedIds])

  const allInViewSelected = flights.length > 0 && selectedInViewCount === flights.length
  const someInViewSelected = selectedInViewCount > 0 && selectedInViewCount < flights.length

  function toggleSelectAllInView(checked: boolean) {
    if (flights.length === 0) return
    const next = new Set(selectedIds)
    if (checked) flights.forEach((f) => next.add(f.id))
    else flights.forEach((f) => next.delete(f.id))
    onSelectedIdsChange(next)
  }

  function toggleSelected(id: string, checked: boolean) {
    const next = new Set(selectedIds)
    if (checked) next.add(id)
    else next.delete(id)
    onSelectedIdsChange(next)
  }

  function startEdit(f: Flight) {
    setErrorById((prev) => {
      if (!prev.has(f.id)) return prev
      const next = new Map(prev)
      next.delete(f.id)
      return next
    })
    setEditingId(f.id)
    setDraft({ startDate: f.startDate, endDate: f.endDate, std: f.std, sta: f.sta, status: f.status })
  }

  function cancelEdit() {
    setEditingId(null)
    setDraft(null)
  }

  async function saveEdit(f: Flight) {
    if (!draft) return
    const before: RowEditDraft = { startDate: f.startDate, endDate: f.endDate, std: f.std, sta: f.sta, status: f.status }
    setSavingId(f.id)
    try {
      onUpdateFlight(f.id, draft)
      setSavingId(null)
      setEditingId(null)
      setDraft(null)
    } catch (e) {
      // revert
      onUpdateFlight(f.id, before)
      setSavingId(null)
      setEditingId(null)
      setDraft(null)
      setErrorById((prev) => new Map(prev).set(f.id, e instanceof Error ? e.message : 'Save failed'))
    }
  }

  function toggleStatusInline(f: Flight) {
    onUpdateFlight(f.id, { status: statusToggled(f.status) })
  }

  return (
    <TableRoot>
      <TableSummary direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="body2" color="text.secondary">
          {flights.length === totalFlights
            ? `${totalFlights} flights`
            : `${flights.length} of ${totalFlights} flights shown`}
        </Typography>
      </TableSummary>

      {flights.length === 0 ? (
        <EmptyState>
          <EmptyTitle variant="h6">No flights match your filters</EmptyTitle>
          <Typography variant="body2" color="text.secondary">
            Try clearing filters or adjusting the search term.
          </Typography>
        </EmptyState>
      ) : (
        <TableScrollArea>
          <TableCanvas>
            <HeaderRow columns={GRID_COLS} sticky>
              <Checkbox
                size="small"
                checked={allInViewSelected}
                indeterminate={someInViewSelected}
                onChange={(e) => toggleSelectAllInView(e.target.checked)}
              />
              <HeaderCell variant="caption">ID</HeaderCell>
              <HeaderCell variant="caption">AOC</HeaderCell>
              <HeaderCell variant="caption">Flt #</HeaderCell>
              <HeaderCell variant="caption">Orig</HeaderCell>
              <HeaderCell variant="caption">Dest</HeaderCell>
              <HeaderCell variant="caption">STD</HeaderCell>
              <HeaderCell variant="caption">STA</HeaderCell>
              <HeaderCell variant="caption">Start</HeaderCell>
              <HeaderCell variant="caption">End</HeaderCell>
              <HeaderCell variant="caption">Days</HeaderCell>
              <HeaderCell variant="caption">Body</HeaderCell>
              <HeaderCell variant="caption">Status</HeaderCell>
              <HeaderCell variant="caption">Actions</HeaderCell>
            </HeaderRow>

            <TableBodyViewport>
              {flights.map((f) => (
                <FlightRow
                  key={f.id}
                  flight={f}
                  columns={GRID_COLS}
                  selected={selectedIds.has(f.id)}
                  editing={editingId === f.id}
                  saving={savingId === f.id}
                  error={errorById.get(f.id)}
                  draft={editingId === f.id ? draft : null}
                  onToggleSelected={toggleSelected}
                  onStartEdit={startEdit}
                  onCancelEdit={cancelEdit}
                  onSaveEdit={saveEdit}
                  onSetDraft={setDraft}
                  onToggleStatus={toggleStatusInline}
                  onDelete={onDeleteFlight}
                />
              ))}
            </TableBodyViewport>
          </TableCanvas>
        </TableScrollArea>
      )}
    </TableRoot>
  )
}

function FlightRow(props: {
  flight: Flight
  columns: string
  selected: boolean
  editing: boolean
  saving: boolean
  error?: string
  draft: RowEditDraft | null
  onToggleSelected: (id: string, checked: boolean) => void
  onStartEdit: (f: Flight) => void
  onCancelEdit: () => void
  onSaveEdit: (f: Flight) => void
  onSetDraft: (d: RowEditDraft | null) => void
  onToggleStatus: (f: Flight) => void
  onDelete: (id: string) => void
}) {
  const { flight: f, columns, selected, editing, saving, error, draft, onToggleSelected, onStartEdit, onCancelEdit, onSaveEdit, onSetDraft, onToggleStatus, onDelete } =
    props

  const d = editing ? draft : null

  return (
    <BodyRow columns={columns} selected={selected}>
      <Checkbox size="small" checked={selected} onChange={(e) => onToggleSelected(f.id, e.target.checked)} />

      <Mono variant="body2">{f.id}</Mono>
      <Mono variant="body2">{f.aoc}</Mono>
      <Mono variant="body2">{f.flightNumber}</Mono>
      <Mono variant="body2">{f.origin}</Mono>
      <Mono variant="body2">{f.destination}</Mono>

      {editing ? (
        <TimeField
          size="small"
          type="time"
          value={d?.std ?? ''}
          onChange={(e) => onSetDraft({ ...(d as RowEditDraft), std: e.target.value })}
          inputProps={{ step: 60 }}
        />
      ) : (
        <Mono variant="body2">{f.std}</Mono>
      )}

      {editing ? (
        <TimeField
          size="small"
          type="time"
          value={d?.sta ?? ''}
          onChange={(e) => onSetDraft({ ...(d as RowEditDraft), sta: e.target.value })}
          inputProps={{ step: 60 }}
        />
      ) : (
        <Mono variant="body2">{f.sta}</Mono>
      )}

      {editing ? (
        <CellDateField
          size="small"
          type="date"
          value={d?.startDate ?? ''}
          onChange={(e) => onSetDraft({ ...(d as RowEditDraft), startDate: e.target.value })}
        />
      ) : (
        <Mono variant="body2">{f.startDate}</Mono>
      )}

      {editing ? (
        <CellDateField
          size="small"
          type="date"
          value={d?.endDate ?? ''}
          onChange={(e) => onSetDraft({ ...(d as RowEditDraft), endDate: e.target.value })}
        />
      ) : (
        <Mono variant="body2">{f.endDate}</Mono>
      )}

      <DaysText days={f.daysOfOperation} />

      <BodyTypeCell variant="body2">{f.bodyType}</BodyTypeCell>

      <Stack direction="row" spacing={1} alignItems="center">
        <Switch size="small" checked={f.status === 'Active'} onChange={() => onToggleStatus(f)} disabled={saving} />
        <Chip
          size="small"
          label={f.status}
          color={f.status === 'Active' ? 'success' : 'default'}
          variant={f.status === 'Active' ? 'filled' : 'outlined'}
        />
        {error ? (
          <Tooltip title={error}>
            <ErrorOutlineIcon color="error" fontSize="small" />
          </Tooltip>
        ) : null}
      </Stack>

      <Stack direction="row" spacing={0.5} alignItems="center">
        {saving ? (
          <CircularProgress size={20} />
        ) : editing ? (
          <>
            <Tooltip title="Save">
              <span>
                <IconButton size="small" onClick={() => onSaveEdit(f)} disabled={saving}>
                  <SaveIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Cancel">
              <IconButton size="small" onClick={onCancelEdit}>
                <CancelIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        ) : (
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => onStartEdit(f)} disabled={saving}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}

        <Tooltip title="Delete">
          <IconButton size="small" onClick={() => onDelete(f.id)} disabled={saving}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
    </BodyRow>
  )
}
