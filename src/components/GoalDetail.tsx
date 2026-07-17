import { useStore } from '../store'
import { balance, estimates, eur, isUnlocked, progress } from '../logic'
import type { Habit } from '../types'

export default function GoalDetail({ onBack }: { onBack: () => void }) {
  const { state } = useStore()
  const bal = balance(state)
  const pct = progress(state)
  const unlocked = isUnlocked(state)
  const est = estimates(state)
  const coffee = state.habits.find((h) => h.id === 'coffee' && h.active)
  const eatout = state.habits.find((h) => h.id === 'eatout' && h.active)

  const skipStats: { habit: Habit; noun: string }[] = []
  if (coffee) skipStats.push({ habit: coffee, noun: 'coffees' })
  if (eatout) skipStats.push({ habit: eatout, noun: 'lunches out' })

  return (
    <div className="fade-in stack">
      <button className="back-row" onClick={onBack}>
        ← Pocket
      </button>

      <div className="goal-title">
        <div className="ring-goal-label">🎯 Saving for</div>
        <h1>{state.goal.name}</h1>
      </div>

      <div className="card balance-card">
        <div className="balance-amount">{eur(bal)}</div>
        {unlocked ? (
          <div className="ring-sub" style={{ color: 'var(--accent)' }}>
            🎉 unlocked!
          </div>
        ) : (
          <div className="ring-sub">
            saved from {eur(state.goal.targetPrice)} required
          </div>
        )}
        <div className="progress-track" style={{ marginTop: 14 }}>
          <div className="progress-fill" style={{ width: `${pct * 100}%` }} />
        </div>
      </div>

      {!unlocked && skipStats.length > 0 && (
        <div
          className="skip-grid"
          style={{ gridTemplateColumns: `repeat(${skipStats.length}, 1fr)` }}
        >
          {skipStats.map((s) => (
            <div key={s.habit.id} className="card skip-tile">
              <div className="skip-num">{est.skipsToGoal(s.habit)}</div>
              <div className="skip-label">
                {s.habit.emoji} {s.noun} to skip
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}
