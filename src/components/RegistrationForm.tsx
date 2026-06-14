import { useState, useEffect } from 'react'
import { Send, CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

const GROUPS = ['甲', '乙', '丙'] as const
const HALF_DAYS = ['上午', '下午'] as const

export default function RegistrationForm() {
  const {
    circuitStats,
    submitting,
    lastSubmissionId,
    submitError,
    selectedGroup,
    submitRegistration,
    setSelectedGroup,
    clearSubmitError,
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
    if (lastSubmissionId) {
      setShowSuccess(true)
      const timer = setTimeout(() => setShowSuccess(false), 4000)
      return () => clearTimeout(timer)
    }
  }, [lastSubmissionId])

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

  const currentStats = circuitStats.find((s) => s.group === circuitGroup)
  const isValid = boothNumber.trim() && Number(wattage) > 0

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
            className="w-full bg-stone-700/40 border border-stone-600/50 rounded-lg px-4 py-2.5 text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
          />
          {currentStats && (
            <p className={`text-xs mt-1.5 ${currentStats.overload ? 'text-red-400' : 'text-stone-500'}`}>
              {currentStats.group}组当前已用 {currentStats.totalWattage.toLocaleString()}W / {currentStats.maxWattage.toLocaleString()}W
            </p>
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
          ) : (
            <>
              <Send className="w-4 h-4" />
              提交申报
            </>
          )}
        </button>
      </form>
    </div>
  )
}
