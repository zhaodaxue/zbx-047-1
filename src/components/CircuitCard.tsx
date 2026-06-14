import { Zap, AlertTriangle } from 'lucide-react'
import type { CircuitStats } from '@/store/useAppStore'

interface CircuitCardProps {
  stats: CircuitStats
  selected: boolean
  onClick: () => void
}

export default function CircuitCard({ stats, selected, onClick }: CircuitCardProps) {
  const { group, totalWattage, maxWattage, loadPercent, overload } = stats

  return (
    <button
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-xl p-5 text-left transition-all duration-300 w-full
        ${selected
          ? overload
            ? 'ring-2 ring-red-500 shadow-lg shadow-red-500/20'
            : 'ring-2 ring-amber-500 shadow-lg shadow-amber-500/20'
          : 'hover:shadow-lg hover:shadow-amber-900/10'
        }
        ${overload
          ? 'bg-gradient-to-br from-red-950/90 to-red-900/70 border border-red-700/50'
          : 'bg-gradient-to-br from-stone-800/90 to-stone-900/80 border border-stone-700/50'
        }
      `}
    >
      {overload && (
        <div className="absolute top-3 right-3 text-red-400 animate-pulse">
          <AlertTriangle className="w-5 h-5" />
        </div>
      )}

      <div className="flex items-center gap-2 mb-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold
          ${overload ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
          {group}
        </div>
        <span className={`text-sm font-medium ${overload ? 'text-red-300' : 'text-stone-400'}`}>
          {group}组电路
        </span>
      </div>

      <div className="mb-3">
        <div className="flex items-baseline gap-1">
          <span className={`text-3xl font-bold tabular-nums ${overload ? 'text-red-300' : 'text-stone-100'}`}>
            {totalWattage.toLocaleString()}
          </span>
          <span className={`text-xs ${overload ? 'text-red-400' : 'text-stone-500'}`}>W</span>
        </div>
        <div className={`text-xs mt-0.5 ${overload ? 'text-red-400' : 'text-stone-500'}`}>
          上限 {maxWattage.toLocaleString()} W
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <span className={`text-xs ${overload ? 'text-red-400' : 'text-stone-500'}`}>负载率</span>
          <span className={`text-xs font-medium tabular-nums ${overload ? 'text-red-400' : 'text-amber-400'}`}>
            {loadPercent}%
          </span>
        </div>
        <div className={`h-2 rounded-full overflow-hidden ${overload ? 'bg-red-950' : 'bg-stone-700/50'}`}>
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out
              ${overload ? 'bg-gradient-to-r from-red-600 to-red-400' : 'bg-gradient-to-r from-amber-600 to-amber-400'}`}
            style={{ width: `${Math.min(loadPercent, 100)}%` }}
          />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5">
        <Zap className={`w-3.5 h-3.5 ${overload ? 'text-red-500' : 'text-amber-500'}`} />
        <span className={`text-xs ${overload ? 'text-red-400' : 'text-stone-500'}`}>
          {overload ? '超载告警' : '正常运行'}
        </span>
      </div>
    </button>
  )
}
