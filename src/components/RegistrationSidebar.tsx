import { useEffect } from 'react'
import { List, Clock, Hash } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

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
    setSelectedGroup,
    setHalfDayFilter,
    fetchRegistrations,
  } = useAppStore()

  useEffect(() => {
    fetchRegistrations()
  }, [selectedGroup, halfDayFilter, fetchRegistrations])

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
          registrations.map((reg) => (
            <div
              key={reg.id}
              className="bg-stone-700/30 border border-stone-600/30 rounded-lg p-3 hover:bg-stone-700/50 transition-colors"
            >
              <div className="flex items-center gap-1.5 mb-2">
                <Hash className="w-3 h-3 text-amber-500" />
                <span className="text-xs font-mono text-amber-400 font-medium">{reg.id}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-400">摊位</span>
                <span className="text-stone-200 font-medium">{reg.boothNumber}</span>
              </div>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-stone-400">瓦数</span>
                <span className="text-stone-200 font-medium">{reg.wattage.toLocaleString()} W</span>
              </div>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-stone-400">时段</span>
                <span className="flex items-center gap-1 text-stone-300">
                  <Clock className="w-3 h-3" />
                  {reg.halfDay}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-stone-700/50 text-xs text-stone-500 text-center">
        共 {registrations.length} 条记录
      </div>
    </div>
  )
}
