import { useState, useEffect } from 'react'
import { Send, CheckCircle, Loader2, AlertCircle, ZapOff, Zap } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

const GROUPS = ['甲', '乙', '丙'] as const
const HALF_DAYS = ['上午', '下午'] as const

export default function RegistrationForm() {
  const {
    formCircuitStats,
    submitting,
    lastSubmissionId,
    submitError,
    selectedGroup,
    preview,
    submitRegistration,
    setSelectedGroup,
    setPreview,
    resetPreview,
    clearSubmitError,
    fetchFormCircuitStats,
  } = useAppStore()

  const [circuitGroup, setCircuitGroup] = useState<string>(selectedGroup)
  const [boothNumber, setBoothNumber] = useState('')
  const [wattage, setWattage] = useState('')
  const [halfDay, setHalfDay] = useState<string>('上午')
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    setCircuitGroup(selectedGroup)
  }, [selectedGroup])

  useEffect(() => {
    fetchFormCircuitStats(halfDay)
  }, [halfDay, fetchFormCircuitStats])

  useEffect(() => {
    if (lastSubmissionId) {
      setShowSuccess(true)
      const timer = setTimeout(() => setShowSuccess(false), 4000)
      return () => clearTimeout(timer)
    }
  }, [lastSubmissionId])

  useEffect(() => {
    const w = wattage ? Number(wattage) : 0
    if (!wattage || w <= 0) {
      resetPreview()
    } else {
      setPreview({
        circuitGroup,
        halfDay,
        wattage: w,
      })
    }
  }, [circuitGroup, halfDay, wattage, setPreview, resetPreview])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearSubmitError()
    if (!boothNumber.trim() || !wattage) return

    const result = await submitRegistration({
      circuitGroup,
      boothNumber: boothNumber.trim(),
      wattage: Number(wattage),
      halfDay,
    })

    if (result) {
      setBoothNumber('')
      setWattage('')
    }
  }

  const handleGroupChange = (g: string) => {
    setCircuitGroup(g)
    setSelectedGroup(g)
  }

  const currentStats = formCircuitStats.find((s) => s.group === circuitGroup)
  const remainingWattage = currentStats ? currentStats.maxWattage - currentStats.totalWattage : null
  const inputWatt = Number(wattage) || 0
  const willOverload = remainingWattage !== null && inputWatt > remainingWattage && inputWatt > 0
  const nearLimit =
    remainingWattage !== null &&
    currentStats &&
    currentStats.maxWattage > 0 &&
    remainingWattage / currentStats.maxWattage < 0.1 &&
    remainingWattage >= 0

  const isValid = boothNumber.trim() && Number(wattage) > 0 && !willOverload

  return (
    <div className="bg-gradient-to-br from-stone-800/90 to-stone-900/80 border border-stone-700/50 rounded-xl p-6">
      <h2 className="text-lg font-bold text-stone-100 mb-5 flex items-center gap-2">
        <Send className="w-5 h-5 text-amber-500" />
        用电申报
      </h2>

      {showSuccess && lastSubmissionId && (
        <div className="mb-4 px-4 py-3 bg-emerald-900/30 border border-emerald-700/40 rounded-lg flex items-center gap-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span className="text-sm text-emerald-300">
            申报成功！申报号：<span className="font-mono font-bold">{lastSubmissionId}</span>
          </span>
        </div>
      )}

      {submitError && (
        <div className="mb-4 px-4 py-3 bg-red-900/30 border border-red-700/40 rounded-lg flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span className="text-sm text-red-300">{submitError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-stone-400 mb-1.5">电路组</label>
            <div className="flex gap-1">
              {GROUPS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => handleGroupChange(g)}
                  className={`
                    flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all
                    ${circuitGroup === g
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

          <div>
            <label className="block text-xs text-stone-400 mb-1.5">半天时段</label>
            <div className="flex gap-1">
              {HALF_DAYS.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setHalfDay(h)}
                  className={`
                    flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all
                    ${halfDay === h
                      ? 'bg-amber-500 text-stone-900'
                      : 'bg-stone-700/50 text-stone-400 hover:bg-stone-700 hover:text-stone-300'
                    }
                  `}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs text-stone-400 mb-1.5">摊位号</label>
          <input
            type="text"
            value={boothNumber}
            onChange={(e) => setBoothNumber(e.target.value)}
            placeholder="例如：A-12"
            className="w-full bg-stone-700/40 border border-stone-600/50 rounded-lg px-4 py-2.5 text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs text-stone-400 mb-1.5">电器瓦数 (W)</label>
          <input
            type="number"
            value={wattage}
            onChange={(e) => setWattage(e.target.value)}
            placeholder="例如：1500"
            min="1"
            className={`
              w-full rounded-lg px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:border-amber-500/50
              ${willOverload
                ? 'bg-red-950/40 border border-red-600/60 text-red-200 placeholder-red-800/60 focus:ring-red-500/50'
                : 'bg-stone-700/40 border border-stone-600/50 text-stone-100 placeholder-stone-600 focus:ring-amber-500/50'
              }
            `}
          />
          {currentStats && (
            <div className="flex items-center gap-1.5 mt-1.5">
              {willOverload ? (
                <>
                  <ZapOff className="w-3 h-3 text-red-400" />
                  <span className="text-xs text-red-400 font-medium">
                    剩余容量不足！{circuitGroup}组{halfDay}剩余 {remainingWattage!.toLocaleString()}W，
                    需申报 {inputWatt.toLocaleString()}W，超出 {Math.abs(remainingWattage! - inputWatt).toLocaleString()}W
                  </span>
                </>
              ) : nearLimit ? (
                <>
                  <AlertCircle className="w-3 h-3 text-amber-400" />
                  <span className="text-xs text-amber-400 font-medium">
                    {circuitGroup}组{halfDay}仅剩 {remainingWattage!.toLocaleString()}W 可用（距上限不足 10%）
                  </span>
                </>
              ) : (
                <>
                  <Zap className="w-3 h-3 text-emerald-400" />
                  <span className="text-xs text-stone-500">
                    {circuitGroup}组{halfDay}剩余可用 {remainingWattage!.toLocaleString()}W
                    （已用 {currentStats.totalWattage.toLocaleString()}W / {currentStats.maxWattage.toLocaleString()}W）
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={!isValid || submitting}
          className={`
            w-full py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2
            ${isValid && !submitting
              ? 'bg-amber-500 text-stone-900 hover:bg-amber-400 active:bg-amber-600 shadow-lg shadow-amber-500/20'
              : 'bg-stone-700 text-stone-500 cursor-not-allowed'
            }
          `}
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              提交中...
            </>
          ) : willOverload ? (
            <>
              <ZapOff className="w-4 h-4" />
              剩余容量不足，无法提交
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              提交申报
            </>
          )}
        </button>

        {preview.active && (
          <div className="pt-3 border-t border-stone-700/50">
            <p className="text-[11px] text-sky-400/70 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
              当前处于预演模式，上方对应电路卡片显示预计提交后的数据
            </p>
          </div>
        )}
      </form>
    </div>
  )
}
