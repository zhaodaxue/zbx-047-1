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
  selectedStatsHalfDay: string
  halfDayFilter: string
  loading: boolean
  submitting: boolean
  lastSubmissionId: string | null
  submitError: string | null

  setSelectedGroup: (group: string) => void
  setSelectedStatsHalfDay: (halfDay: string) => void
  setHalfDayFilter: (filter: string) => void
  clearSubmitError: () => void
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
  selectedStatsHalfDay: '',
  halfDayFilter: '',
  loading: false,
  submitting: false,
  lastSubmissionId: null,
  submitError: null,

  setSelectedGroup: (group) => set({ selectedGroup: group }),
  setSelectedStatsHalfDay: (halfDay) => set({ selectedStatsHalfDay: halfDay }),
  setHalfDayFilter: (filter) => set({ halfDayFilter: filter }),
  clearSubmitError: () => set({ submitError: null }),

  fetchCircuitStats: async () => {
    try {
      const { selectedStatsHalfDay } = get()
      const params = new URLSearchParams()
      if (selectedStatsHalfDay) params.set('halfDay', selectedStatsHalfDay)
      const url = `/api/circuits${params.toString() ? `?${params.toString()}` : ''}`
      const res = await fetch(url)
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
    set({ submitting: true, lastSubmissionId: null, submitError: null })
    try {
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (json.success) {
        set({ lastSubmissionId: json.data.id, selectedGroup: data.circuitGroup, halfDayFilter: '' })
        await get().fetchCircuitStats()
        await get().fetchRegistrations()
        return json.data.id
      }
      set({ submitError: json.error || '提交失败，请检查输入' })
      return null
    } catch (e) {
      set({ submitError: '网络错误，请稍后重试' })
      console.error('Failed to submit registration', e)
      return null
    } finally {
      set({ submitting: false })
    }
  },
}))
