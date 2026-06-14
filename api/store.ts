import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATA_PATH = path.join(__dirname, 'data.json')

export interface CircuitGroup {
  group: string
  maxWattage: number
}

export interface Registration {
  id: string
  circuitGroup: string
  boothNumber: string
  wattage: number
  halfDay: string
  createdAt: string
}

export interface StoreData {
  circuitGroups: CircuitGroup[]
  registrations: Registration[]
}

function readData(): StoreData {
  const raw = fs.readFileSync(DATA_PATH, 'utf-8')
  return JSON.parse(raw)
}

function writeData(data: StoreData): void {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8')
}

export function getCircuitGroups(): CircuitGroup[] {
  return readData().circuitGroups
}

export function getRegistrations(filters?: {
  circuitGroup?: string
  halfDay?: string
}): Registration[] {
  const data = readData()
  let results = data.registrations
  if (filters?.circuitGroup) {
    results = results.filter((r) => r.circuitGroup === filters.circuitGroup)
  }
  if (filters?.halfDay) {
    results = results.filter((r) => r.halfDay === filters.halfDay)
  }
  return results
}

export function createRegistration(input: {
  circuitGroup: string
  boothNumber: string
  wattage: number
  halfDay: string
}): Registration | { error: string } {
  const data = readData()

  const duplicate = data.registrations.find(
    (r) =>
      r.circuitGroup === input.circuitGroup &&
      r.halfDay === input.halfDay &&
      r.boothNumber === input.boothNumber,
  )
  if (duplicate) {
    return { error: `该摊位(${input.boothNumber})已在${input.circuitGroup}组${input.halfDay}申报过，请勿重复申报` }
  }

  const id = `SB-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
  const registration: Registration = {
    id,
    circuitGroup: input.circuitGroup,
    boothNumber: input.boothNumber,
    wattage: input.wattage,
    halfDay: input.halfDay,
    createdAt: new Date().toISOString(),
  }
  data.registrations.push(registration)
  writeData(data)
  return registration
}

export function getCircuitStats(halfDay?: string): {
  group: string
  totalWattage: number
  maxWattage: number
  loadPercent: number
  overload: boolean
}[] {
  const data = readData()
  return data.circuitGroups.map((cg) => {
    const filtered = data.registrations.filter((r) => {
      if (r.circuitGroup !== cg.group) return false
      if (halfDay && r.halfDay !== halfDay) return false
      return true
    })
    const totalWattage = filtered.reduce((sum, r) => sum + r.wattage, 0)
    const loadPercent = Math.round((totalWattage / cg.maxWattage) * 100)
    return {
      group: cg.group,
      totalWattage,
      maxWattage: cg.maxWattage,
      loadPercent,
      overload: totalWattage > cg.maxWattage,
    }
  })
}
