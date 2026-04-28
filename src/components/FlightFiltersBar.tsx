import {
  FormControl,
  InputLabel,
  InputAdornment,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import SearchIcon from '@mui/icons-material/Search'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import type { BodyType, Flight, FlightStatus } from '../types'

export type FlightFilters = {
  search: string
  from: string // YYYY-MM-DD
  to: string // YYYY-MM-DD
  days: number[] // 1=Mon..7=Sun
  status: FlightStatus | 'All'
  aoc: string | 'All'
  bodyType: BodyType | 'All'
}

const dayLabels: Record<number, string> = {
  1: 'Mon',
  2: 'Tue',
  3: 'Wed',
  4: 'Thu',
  5: 'Fri',
  6: 'Sat',
  7: 'Sun',
}

const TopRow = styled(Stack)(() => ({
  gap: 16,
  width: '100%',
}))

const DateRow = styled(Stack)(({ theme }) => ({
  gap: 16,
  width: '100%',
  maxWidth: 520,
  [theme.breakpoints.down('md')]: {
    maxWidth: 'none',
  },
}))

const BottomRow = styled(Stack)(() => ({
  gap: 16,
  width: '100%',
}))

const DaysBlock = styled('div')(({ theme }) => ({
  flex: 1,
  minWidth: 0,
  [theme.breakpoints.down('md')]: {
    width: '100%',
  },
}))

const DaysLabel = styled(Typography)(({ theme }) => ({
  display: 'block',
  marginBottom: 4,
  color: theme.palette.text.secondary,
}))

const DaysToggle = styled(ToggleButtonGroup)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: 0,
  '& .MuiToggleButton-root': {
    textTransform: 'none',
    fontWeight: 700,
    letterSpacing: 0.2,
    borderColor: theme.palette.divider,
    color: theme.palette.text.secondary,
    marginLeft: '-1px',
    marginTop: '-1px',
  },
  '& .MuiToggleButton-root.Mui-selected': {
    backgroundColor: theme.palette.primary.main,
    borderColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
  '& .MuiToggleButton-root.Mui-selected:hover': {
    backgroundColor: theme.palette.primary.dark,
    borderColor: theme.palette.primary.dark,
  },
}))

const DayBtn = styled(ToggleButton)(({ theme }) => ({
  paddingLeft: 10,
  paddingRight: 10,
  minWidth: 44,
  [theme.breakpoints.down('sm')]: {
    flex: '1 0 calc(25% + 1px)',
  },
}))

const SmallControl = styled(FormControl)(({ theme }) => ({
  minWidth: 180,
  [theme.breakpoints.down('md')]: {
    width: '100%',
    minWidth: 0,
  },
}))

const BodyControl = styled(FormControl)(({ theme }) => ({
  minWidth: 200,
  [theme.breakpoints.down('md')]: {
    width: '100%',
    minWidth: 0,
  },
}))

export function FlightFiltersBar(props: {
  flights: Flight[]
  value: FlightFilters
  onChange: (next: FlightFilters) => void
}) {
  const { flights, value, onChange } = props
  const today = new Date()
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
    today.getDate(),
  ).padStart(2, '0')}`

  const aocOptions = Array.from(new Set(flights.map((f) => f.aoc))).sort((a, b) => a.localeCompare(b))

  return (
    <Stack spacing={2}>
      <TopRow direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }}>
        <TextField
          fullWidth
          label="Search"
          placeholder="Flight number, origin, destination…"
          value={value.search}
          onChange={(e) => onChange({ ...value, search: e.target.value })}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        <DateRow direction={{ xs: 'column', sm: 'row' }}>
          <TextField
            label="From"
            type="date"
            value={value.from}
            onChange={(e) => {
              const nextFrom = e.target.value
              onChange({
                ...value,
                from: nextFrom,
                to: value.to && nextFrom && value.to < nextFrom ? nextFrom : value.to,
              })
            }}
            slotProps={{
              inputLabel: { shrink: true },
              htmlInput: { max: todayString },
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarMonthIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
            fullWidth
          />
          <TextField
            label="To"
            type="date"
            value={value.to}
            onChange={(e) => onChange({ ...value, to: e.target.value })}
            fullWidth
            slotProps={{
              inputLabel: { shrink: true },
              htmlInput: {
                min: value.from || undefined,
                max: todayString,
              },
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarMonthIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
        </DateRow>
      </TopRow>

      <BottomRow direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }}>
        <DaysBlock>
          <DaysLabel variant="caption">
            Days of operation (matches at least one)
          </DaysLabel>
          <DaysToggle
            value={value.days}
            onChange={(_, next: number[]) => onChange({ ...value, days: next })}
            size="small"
          >
            {Object.entries(dayLabels).map(([k, label]) => (
              <DayBtn key={k} value={Number(k)}>
                {label}
              </DayBtn>
            ))}
          </DaysToggle>
        </DaysBlock>

        <SmallControl size="small">
          <InputLabel>Status</InputLabel>
          <Select
            label="Status"
            value={value.status}
            onChange={(e) => onChange({ ...value, status: e.target.value as FlightFilters['status'] })}
            input={<OutlinedInput label="Status" />}
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
          </Select>
        </SmallControl>

        <SmallControl size="small">
          <InputLabel>AOC</InputLabel>
          <Select
            label="AOC"
            value={value.aoc}
            onChange={(e) => onChange({ ...value, aoc: e.target.value as FlightFilters['aoc'] })}
            input={<OutlinedInput label="AOC" />}
          >
            <MenuItem value="All">All</MenuItem>
            {aocOptions.map((aoc) => (
              <MenuItem key={aoc} value={aoc}>
                {aoc}
              </MenuItem>
            ))}
          </Select>
        </SmallControl>

        <BodyControl size="small">
          <InputLabel>Body type</InputLabel>
          <Select
            label="Body type"
            value={value.bodyType}
            onChange={(e) => onChange({ ...value, bodyType: e.target.value as FlightFilters['bodyType'] })}
            input={<OutlinedInput label="Body type" />}
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="narrow_body">narrow_body</MenuItem>
            <MenuItem value="wide_body">wide_body</MenuItem>
          </Select>
        </BodyControl>
      </BottomRow>
    </Stack>
  )
}
