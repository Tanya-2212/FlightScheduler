export type FlightStatus = 'Active' | 'Inactive'
export type BodyType = 'narrow_body' | 'wide_body'

export type Flight = {
  id: string
  aoc: string
  flightNumber: string
  origin: string
  destination: string
  std: string // HH:mm
  sta: string // HH:mm
  daysOfOperation: number[] // 1=Mon..7=Sun
  bodyType: BodyType
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
  status: FlightStatus
}

export type FlightsJson = {
  flights: Flight[]
}

