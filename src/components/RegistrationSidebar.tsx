import { useEffect, useState, useMemo } from 'react'
import { List, Clock, Hash, AlertTriangle } from 'lucide-react'
import { useAppStore, type Registration } from '@/store/useAppStore'

const GROUPS = ['甲', '乙', '丙'] as const
const HALF_DAY_OPTIONS = [
  { label: '全部', value: '' },
  { label: '上午', value: '上午' },
  { label: '下午', value: '下午' },
]

export default function RegistrationSidebar() {
  const {
    registrations,
    selectedGroup,
    halfDayFilter,
    loading,
    preview,
    formCircuitStats,
    setSelectedGroup,
    setHalfDayFilter,
    fetchRegistrations,
  } = useAppStore()

  const [dangerRegistrations, setDangerRegistrations] = useState<Registration[]>([])

  useEffect(() => {
    fetchRegistrations()
  }, [selectedGroup, halfDayFilter, fetchRegistrations])

  useEffect(() => {
    let cancelled = false

    async function loadDanger() {
      if (!preview.circuitGroup || !preview.halfDay) {
        setDangerRegistrations([])
        return
      }
      try {
        const params = new URLSearchParams()
        params.set('circuitGroup', preview.circuitGroup)
        params.set('halfDay', preview.halfDay)
        const res = await fetch(`/api/registrations?${params}`)
        const json = await res.json()
        if (!json.success || cancelled) return

        const circuitInfo = formCircuitStats.find((s) => s.group === preview.circuitGroup)
        const maxWattage = circuitInfo?.maxWattage ?? 0
        if (maxWattage <= 0) {
          setDangerRegistrations([])
          return
        }

        const threshold = maxWattage * 0.9
        const sorted = (json.data as Registration[]).slice().sort((a, b) =>
          a.createdAt.localeCompare(b.createdAt),
        )

        let cumulative = 0
        const dangerIds = new Set<string>()
        for (const reg of sorted) {
          cumulative += reg.wattage
          if (cumulative >= threshold) {
            dangerIds.add(reg.id)
          }
        }
        if (!cancelled) {
          setDangerRegistrations(sorted.filter((r) => dangerIds.has(r.id)))
        }
      } catch (e) {
        console.error('Failed to fetch danger registrations', e)
      }
    }

    loadDanger()
    return () => {
      cancelled = true
    }
  }, [preview.circuitGroup, preview.halfDay, formCircuitStats])

  const dangerIdSet = useMemo(
    () => new Set(dangerRegistrations.map((r) => r.id)),
    [dangerRegistrations],
  )

  const dangerTotal = useMemo(
    () => dangerRegistrations.reduce((s, r) => s + r.wattage, 0),
    [dangerRegistrations],
  )

  const previewMax = useMemo(
    () => formCircuitStats.find((s) => s.group === preview.circuitGroup)?.maxWattage ?? 0,
    [formCircuitStats, preview.circuitGroup],
  )

  return (
    <div className="bg-gradient-to-br from-stone-800/90 to-stone-900/80 border border-stone-700/50 rounded-xl p-5 h-full flex flex-col">
      <h2 className="text-lg font-bold text-stone-100 mb-4 flex items-center gap-2">
        <List className="w-5 h-5 text-amber-500" />
        申报记录
      </h2>

      <div className="mb-3">
        <label className="block text-xs text-stone-400 mb-1.5">电路组</label>
        <div className="flex gap-1">
          {GROUPS.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGroup(g)}
              className={`
                flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-all
                ${selectedGroup === g
                  ? 'bg-amber-500 text-stone-900'
                  : 'bg-stone-700/50 text-stone-400 hover:bg-stone-700 hover:text-stone-300'
                }
              `}
            >
              {g}组
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-xs text-stone-400 mb-1.5">半天时段</label>
        <div className="flex gap-1">
          {HALF_DAY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setHalfDayFilter(opt.value)}
              className={`
                flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-all
                ${halfDayFilter === opt.value
                  ? 'bg-amber-500 text-stone-900'
                  : 'bg-stone-700/50 text-stone-400 hover:bg-stone-700 hover:text-stone-300'
                }
              `}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {dangerRegistrations.length > 0 && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="text-[11px] text-amber-300 leading-relaxed">
              <div className="font-medium mb-0.5">
                {preview.circuitGroup}组{preview.halfDay}危险区申报 {dangerRegistrations.length} 条
              </div>
              <div className="text-amber-400/80">
                共 {dangerTotal.toLocaleString()}W，距上限 {previewMax > 0 ? (previewMax - dangerTotal).toLocaleString() : '—'}W
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto min-h-0 space-y-2 pr-1 custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : registrations.length === 0 ? (
          <div className="text-center py-8 text-stone-600 text-sm">
            暂无申报记录
          </div>
        ) : (
          registrations.map((reg) => {
            const isDanger = dangerIdSet.has(reg.id)
            return (
              <div
                key={reg.id}
                className={`
                  rounded-lg p-3 transition-colors
                  ${isDanger
                    ? 'bg-gradient-to-br from-amber-500/15 to-amber-700/10 border-2 border-amber-500/40 shadow-md shadow-amber-500/10'
                    : 'bg-stone-700/30 border border-stone-600/30 hover:bg-stone-700/50'
                  }
                `}
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <Hash className={`w-3 h-3 ${isDanger ? 'text-amber-400' : 'text-amber-500'}`} />
                  <span className={`text-xs font-mono font-medium ${isDanger ? 'text-amber-300' : 'text-amber-400'}`}>
                    {reg.id}
                  </span>
                  {isDanger && (
                    <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-medium">
                      接近上限
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-400">摊位</span>
                  <span className={`font-medium ${isDanger ? 'text-amber-200' : 'text-stone-200'}`}>
                    {reg.boothNumber}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-stone-400">瓦数</span>
                  <span className={`font-medium ${isDanger ? 'text-amber-200' : 'text-stone-200'}`}>
                    {reg.wattage.toLocaleString()} W
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-stone-400">时段</span>
                  <span className={`flex items-center gap-1 ${isDanger ? 'text-amber-300' : 'text-stone-300'}`}>
                    <Clock className="w-3 h-3" />
                    {reg.halfDay}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-stone-700/50 text-xs text-stone-500 text-center">
        共 {registrations.length} 条记录
      </div>
    </div>
  )
}
