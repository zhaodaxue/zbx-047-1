import { Zap, AlertTriangle, Eye, TrendingUp } from 'lucide-react'
import type { CircuitStats, PreviewState } from '@/store/useAppStore'

interface CircuitCardProps {
  stats: CircuitStats
  preview: PreviewState
  formCircuitStats: CircuitStats[]
  selected: boolean
  onClick: () => void
}

export default function CircuitCard({ stats, preview, formCircuitStats, selected, onClick }: CircuitCardProps) {
  const isPreviewTarget = preview.active && preview.circuitGroup === stats.group

  let displayTotal = stats.totalWattage
  let displayPercent = stats.loadPercent
  let displayOverload = stats.overload
  let isPreviewMode = false

  if (isPreviewTarget) {
    const realStats = formCircuitStats.find((s) => s.group === stats.group)
    if (realStats) {
      isPreviewMode = true
      displayTotal = realStats.totalWattage + preview.wattage
      displayPercent = Math.round((displayTotal / realStats.maxWattage) * 100)
      displayOverload = displayTotal > realStats.maxWattage
    }
  }

  const barPercent = Math.min(displayPercent, 100)

  return (
    <button
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-xl p-5 text-left transition-all duration-300 w-full
        ${selected
          ? displayOverload
            ? 'ring-2 ring-red-500 shadow-lg shadow-red-500/20'
            : isPreviewMode
              ? 'ring-2 ring-sky-400 shadow-lg shadow-sky-500/20'
              : 'ring-2 ring-amber-500 shadow-lg shadow-amber-500/20'
          : 'hover:shadow-lg hover:shadow-amber-900/10'
        }
        ${isPreviewMode
          ? displayOverload
            ? 'bg-gradient-to-br from-red-950/90 via-sky-950/50 to-red-900/60 border-2 border-dashed border-sky-400/60'
            : 'bg-gradient-to-br from-sky-950/70 via-stone-900/80 to-sky-900/50 border-2 border-dashed border-sky-400/60'
          : displayOverload
            ? 'bg-gradient-to-br from-red-950/90 to-red-900/70 border border-red-700/50'
            : 'bg-gradient-to-br from-stone-800/90 to-stone-900/80 border border-stone-700/50'
        }
      `}
    >
      {isPreviewMode && (
        <div className="absolute top-3 right-3 flex items-center gap-1 text-sky-300 bg-sky-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
          <Eye className="w-3 h-3" />
          预演
        </div>
      )}

      {displayOverload && !isPreviewMode && (
        <div className="absolute top-3 right-3 text-red-400 animate-pulse">
          <AlertTriangle className="w-5 h-5" />
        </div>
      )}

      <div className="flex items-center gap-2 mb-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold
          ${isPreviewMode
            ? 'bg-sky-500/20 text-sky-300'
            : displayOverload
              ? 'bg-red-500/20 text-red-400'
              : 'bg-amber-500/20 text-amber-400'
          }`}>
          {stats.group}
        </div>
        <span className={`text-sm font-medium
          ${isPreviewMode
            ? 'text-sky-300'
            : displayOverload
              ? 'text-red-300'
              : 'text-stone-400'
          }`}>
          {stats.group}组电路
        </span>
      </div>

      <div className="mb-3">
        <div className="flex items-baseline gap-1">
          <span className={`text-3xl font-bold tabular-nums
            ${isPreviewMode
              ? 'text-sky-200'
              : displayOverload
                ? 'text-red-300'
                : 'text-stone-100'
            }`}>
            {displayTotal.toLocaleString()}
          </span>
          <span className={`text-xs
            ${isPreviewMode
              ? 'text-sky-400'
              : displayOverload
                ? 'text-red-400'
                : 'text-stone-500'
            }`}>W</span>
        </div>
        {isPreviewMode && (
          <div className="text-[11px] mt-0.5 text-sky-400/80 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            预计提交后（含预演 {preview.wattage.toLocaleString()}W）
          </div>
        )}
        <div className={`text-xs mt-0.5
          ${isPreviewMode
            ? 'text-sky-400/70'
            : displayOverload
              ? 'text-red-400'
              : 'text-stone-500'
          }`}>
          上限 {stats.maxWattage.toLocaleString()} W
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <span className={`text-xs
            ${isPreviewMode
              ? 'text-sky-400'
              : displayOverload
                ? 'text-red-400'
                : 'text-stone-500'
            }`}>
            {isPreviewMode ? '预计负载率' : '负载率'}
          </span>
          <span className={`text-xs font-medium tabular-nums
            ${isPreviewMode
              ? 'text-sky-300'
              : displayOverload
                ? 'text-red-400'
                : 'text-amber-400'
            }`}>
            {displayPercent}%
            {displayOverload && displayPercent > 100 && (
              <span className="ml-1 opacity-80">(超限)</span>
            )}
          </span>
        </div>
        <div className={`h-2 rounded-full overflow-hidden
          ${isPreviewMode
            ? 'bg-sky-950'
            : displayOverload
              ? 'bg-red-950'
              : 'bg-stone-700/50'
          }`}>
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out
              ${isPreviewMode
                ? 'bg-gradient-to-r from-sky-500 to-sky-300'
                : displayOverload
                  ? 'bg-gradient-to-r from-red-600 to-red-400'
                  : 'bg-gradient-to-r from-amber-600 to-amber-400'
              }`}
            style={{ width: `${barPercent}%` }}
          />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5">
        {isPreviewMode ? (
          <>
            <Eye className="w-3.5 h-3.5 text-sky-400" />
            <span className={`text-xs ${displayOverload ? 'text-red-400' : 'text-sky-400'}`}>
              {displayOverload ? '预演：将超载' : '预演：可提交'}
            </span>
          </>
        ) : (
          <>
            <Zap className={`w-3.5 h-3.5 ${displayOverload ? 'text-red-500' : 'text-amber-500'}`} />
            <span className={`text-xs ${displayOverload ? 'text-red-400' : 'text-stone-500'}`}>
              {displayOverload ? '超载告警' : '正常运行'}
            </span>
          </>
        )}
      </div>
    </button>
  )
}
