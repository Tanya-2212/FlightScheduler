import { parseISO } from 'date-fns'
import type { Flight } from '../types'
import type { FlightFilters } from '../components/FlightFiltersBar'

function normalize(s: string) {
  return s.trim().toLowerCase()
}

function overlapsOperationalRange(flight: Flight, from?: Date, to?: Date) {
  if (!from && !to) return true

  const start = parseISO(flight.startDate)
  const end = parseISO(flight.endDate)

  if (from && to) {
    const rangeStart = from <= to ? from : to
    const rangeEnd = from <= to ? to : from
    return start <= rangeEnd && end >= rangeStart
  }

  if (from) {
    return end >= from
  }

  return start <= (to as Date)
}

function matchesDays(flight: Flight, selectedDays: number[]) {
  if (selectedDays.length === 0) return true
  const ops = new Set(flight.daysOfOperation)
  return selectedDays.some((d) => ops.has(d))
}

function matchesSearch(flight: Flight, query: string) {
  const q = normalize(query)
  if (!q) return true
  return (
    normalize(flight.flightNumber).includes(q) ||
    normalize(flight.origin).includes(q) ||
    normalize(flight.destination).includes(q)
  )
}

export function applyAllFilters(flights: Flight[], filters: FlightFilters) {
  const from = filters.from ? parseISO(filters.from) : undefined
  const to = filters.to ? parseISO(filters.to) : undefined

  return flights.filter((f) => {
    if (!matchesSearch(f, filters.search)) return false

    if (!overlapsOperationalRange(f, from, to)) return false
    if (!matchesDays(f, filters.days)) return false

    if (filters.status !== 'All' && f.status !== filters.status) return false
    if (filters.aoc !== 'All' && f.aoc !== filters.aoc) return false
    if (filters.bodyType !== 'All' && f.bodyType !== filters.bodyType) return false

    return true
  })
}
