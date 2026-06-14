import { useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'
import CircuitCard from '@/components/CircuitCard'
import RegistrationForm from '@/components/RegistrationForm'
import RegistrationSidebar from '@/components/RegistrationSidebar'
import { Zap, Waves } from 'lucide-react'

const STATS_HALF_DAY_OPTIONS = [
  { label: '全部', value: '' },
  { label: '上午', value: '上午' },
  { label: '下午', value: '下午' },
]

export default function Home() {
  const {
    circuitStats,
    selectedGroup,
    selectedStatsHalfDay,
    fetchCircuitStats,
    setSelectedGroup,
    setSelectedStatsHalfDay,
  } = useAppStore()

  useEffect(() => {
    fetchCircuitStats()
    const interval = setInterval(fetchCircuitStats, 15000)
    return () => clearInterval(interval)
  }, [fetchCircuitStats, selectedStatsHalfDay])

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <header className="border-b border-stone-800/80 bg-stone-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Zap className="w-5 h-5 text-stone-900" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-stone-100 tracking-tight">江滩周末市集</h1>
              <p className="text-xs text-stone-500">用电申报管理系统</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <Waves className="w-4 h-4 text-amber-600" />
            <span>实时负载监控</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium text-stone-400 uppercase tracking-wider">电路组负载</h2>
                <div className="flex gap-1">
                  {STATS_HALF_DAY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSelectedStatsHalfDay(opt.value)}
                      className={`
                        py-1.5 px-3 rounded-lg text-xs font-medium transition-all
                        ${selectedStatsHalfDay === opt.value
                          ? 'bg-amber-500 text-stone-900'
                          : 'bg-stone-800/60 text-stone-400 hover:bg-stone-700/60 hover:text-stone-300'
                        }
                      `}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {circuitStats.map((stats) => (
                  <CircuitCard
                    key={stats.group}
                    stats={stats}
                    selected={selectedGroup === stats.group}
                    onClick={() => setSelectedGroup(stats.group)}
                  />
                ))}
              </div>
              <p className="text-xs text-stone-600 mt-2">
                {selectedStatsHalfDay
                  ? `当前显示「${selectedStatsHalfDay}」时段负载数据`
                  : '当前显示全部时段汇总负载数据'}
              </p>
            </section>

            <section>
              <RegistrationForm />
            </section>
          </div>

          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <RegistrationSidebar />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
