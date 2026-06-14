import { create } from 'zustand'

export interface CircuitStats {
  group: string
  totalWattage: number
  maxWattage: number
  loadPercent: number
  overload: boolean
}

export interface Registration {
  id: string
  circuitGroup: string
  boothNumber: string
  wattage: number
  halfDay: string
  createdAt: string
}

interface AppState {
  circuitStats: CircuitStats[]
  registrations: Registration[]
  selectedGroup: string
  halfDayFilter: string
  loading: boolean
  submitting: boolean
  lastSubmissionId: string | null

  setSelectedGroup: (group: string) => void
  setHalfDayFilter: (filter: string) => void
  fetchCircuitStats: () => Promise<void>
  fetchRegistrations: () => Promise<void>
  submitRegistration: (data: {
    circuitGroup: string
    boothNumber: string
    wattage: number
    halfDay: string
  }) => Promise<string | null>
}

export const useAppStore = create<AppState>((set, get) => ({
  circuitStats: [],
  registrations: [],
  selectedGroup: '甲',
  halfDayFilter: '',
  loading: false,
  submitting: false,
  lastSubmissionId: null,

  setSelectedGroup: (group) => set({ selectedGroup: group }),
  setHalfDayFilter: (filter) => set({ halfDayFilter: filter }),

  fetchCircuitStats: async () => {
    try {
      const res = await fetch('/api/circuits')
      const json = await res.json()
      if (json.success) {
        set({ circuitStats: json.data })
      }
    } catch (e) {
      console.error('Failed to fetch circuit stats', e)
    }
  },

  fetchRegistrations: async () => {
    set({ loading: true })
    try {
      const { selectedGroup, halfDayFilter } = get()
      const params = new URLSearchParams()
      params.set('circuitGroup', selectedGroup)
      if (halfDayFilter) params.set('halfDay', halfDayFilter)
      const res = await fetch(`/api/registrations?${params}`)
      const json = await res.json()
      if (json.success) {
        set({ registrations: json.data })
      }
    } catch (e) {
      console.error('Failed to fetch registrations', e)
    } finally {
      set({ loading: false })
    }
  },

  submitRegistration: async (data) => {
    set({ submitting: true, lastSubmissionId: null })
    try {
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (json.success) {
        set({ lastSubmissionId: json.data.id })
        await get().fetchCircuitStats()
        await get().fetchRegistrations()
        return json.data.id
      }
      return null
    } catch (e) {
      console.error('Failed to submit registration', e)
      return null
    } finally {
      set({ submitting: false })
    }
  },
}))
