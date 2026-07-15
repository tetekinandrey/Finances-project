import { useStore } from '../store'
import { eur, formatDate } from '../logic'
import type { DayEntry } from '../types'
import { makeSampleHistory } from '../sample'

export default function History() {
  const { state, dispatch } = useStore()
  const entries = [...state.entries].sort((a, b) => b.date.localeCompare(a.date))

  // Cumulative balance series (oldest -> newest) for the sparkline.
  const asc = [...state.entries].sort((a, b) => a.date.localeCompare(b.date))
  let running = 0
  const series = asc.map((e) => {
    running += e.actions.reduce((s, a) => s + a.amount, 0)
    return running
  })

  const habitName = (id: string) =>
    state.habits.find((h) => h.id === id)?.emoji ?? '•'

  if (entries.length === 0) {
    return (
      <div className="fade-in stack">
        <div className="checkin-head">
          <h2>History</h2>
          <div className="muted">Your saving journey</div>
        </div>
        <div className="card empty">
          <div style={{ fontSize: 40 }}>🌱</div>
          <p className="muted">No days logged yet. Start a check-in — or</p>
          <button
            className="btn"
            onClick={() =>
              dispatch({ type: 'IMPORT', state: makeSampleHistory(state) })
            }
          >
            Generate 14 sample days
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fade-in stack">
      <div className="checkin-head">
        <h2>History</h2>
        <div className="muted">
          {entries.length} {entries.length === 1 ? 'day' : 'days'} logged
        </div>
      </div>

      <Sparkline series={series} target={state.goal.targetPrice} />

      {entries.map((e) => (
        <DayRow key={e.date} entry={e} habitEmoji={habitName} />
      ))}
    </div>
  )
}

function DayRow({
  entry,
  habitEmoji,
}: {
  entry: DayEntry
  habitEmoji: (id: string) => string
}) {
  const net = entry.actions.reduce((s, a) => s + a.amount, 0)
  return (
    <div className="card day-row">
      <div className="row between">
        <strong>{formatDate(entry.date)}</strong>
        <span
          style={{
            fontWeight: 700,
            color: net >= 0 ? 'var(--accent)' : 'var(--danger)',
          }}
        >
          {net >= 0 ? '+' : ''}
          {eur(net)}
        </span>
      </div>
      <div className="row wrap" style={{ gap: 6, marginTop: 8 }}>
        {entry.actions.map((a) => (
          <span
            key={a.habitId}
            className={`chip ${a.result === 'saved' ? 'good' : 'treat'}`}
            title={a.note}
          >
            {habitEmoji(a.habitId)} {a.result === 'saved' ? '＋' : '−'}
            {eur(Math.abs(a.amount))}
          </span>
        ))}
      </div>
    </div>
  )
}

function Sparkline({ series, target }: { series: number[]; target: number }) {
  const w = 300
  const h = 90
  if (series.length < 2) return null
  const max = Math.max(target, ...series, 1)
  const stepX = w / (series.length - 1)
  const pts = series.map((v, i) => `${i * stepX},${h - (v / max) * h}`)
  const area = `0,${h} ${pts.join(' ')} ${w},${h}`

  return (
    <div className="card">
      <div className="faint" style={{ fontSize: 12, marginBottom: 6 }}>
        Vault growth vs. goal
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="spark" preserveAspectRatio="none">
        <defs>
          <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d39955" />
            <stop offset="100%" stopColor="#34d39900" />
          </linearGradient>
        </defs>
        <line
          x1="0"
          y1="1"
          x2={w}
          y2="1"
          stroke="var(--gold)"
          strokeDasharray="4 4"
          strokeWidth="1"
          opacity="0.6"
        />
        <polygon points={area} fill="url(#sparkFill)" />
        <polyline
          points={pts.join(' ')}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}
