import { useStore } from '../store'
import {
  addDays,
  balance,
  dailyPotential,
  estimates,
  eur,
  isUnlocked,
  progress,
  remaining,
} from '../logic'
import ProgressRing from './ProgressRing'

export default function Home({ go }: { go: (tab: string) => void }) {
  const { state, today } = useStore()
  const bal = balance(state)
  const pct = progress(state)
  const rem = remaining(state)
  const unlocked = isUnlocked(state)
  const est = estimates(state)
  const potential = dailyPotential(state.habits)
  const coffee = state.habits.find((h) => h.id === 'coffee' && h.active)

  const answeredToday =
    state.entries.find((e) => e.date === today)?.actions.length ?? 0

  const etaDate =
    est.daysAtPotential != null
      ? addDays(today, est.daysAtPotential).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : null

  return (
    <div className="fade-in stack">
      {/* Goal hero */}
      <div className="goal-hero">
        {state.goal.imageUrl ? (
          <img src={state.goal.imageUrl} alt={state.goal.name} />
        ) : (
          <div className="goal-hero-emoji">{state.goal.emoji}</div>
        )}
        <div className="goal-hero-overlay">
          <div className="pill">🎯 Saving for</div>
          <h1>{state.goal.name}</h1>
          <div className="muted">{eur(state.goal.targetPrice)}</div>
        </div>
      </div>

      {/* Progress ring */}
      <div className="card ring-card">
        <ProgressRing progress={pct}>
          <div className="ring-amount">{eur(bal)}</div>
          <div className="muted" style={{ fontSize: 13 }}>
            {(pct * 100).toFixed(1)}% saved
          </div>
        </ProgressRing>
        {unlocked ? (
          <div className="unlocked-banner">
            🎉 Goal reached — funds unlocked!
          </div>
        ) : (
          <div className="row between rem-line">
            <span className="muted">Still to go</span>
            <span className="rem-amount">{eur(rem)}</span>
          </div>
        )}
      </div>

      {/* Vault status (blockchain preview) */}
      <div className="card vault">
        <div className="row between">
          <div className="row" style={{ gap: 8 }}>
            <span style={{ fontSize: 18 }}>{unlocked ? '🔓' : '🔒'}</span>
            <div>
              <div style={{ fontWeight: 650 }}>Savings vault</div>
              <div className="faint" style={{ fontSize: 12 }}>
                {unlocked
                  ? 'Unlocked — ready to spend'
                  : 'Locked until goal is reached'}
              </div>
            </div>
          </div>
          <span className="pill">{eur(bal)}</span>
        </div>
      </div>

      {/* Estimates */}
      {!unlocked && (
        <div className="stat-grid">
          {coffee && (
            <div className="card stat">
              <div className="stat-num">{est.skipsToGoal(coffee)}</div>
              <div className="stat-label">
                {coffee.emoji} coffees left to skip
              </div>
            </div>
          )}
          <div className="card stat">
            <div className="stat-num">
              {est.daysAtPotential ?? '—'}
              <span className="stat-unit">days</span>
            </div>
            <div className="stat-label">at your best pace</div>
          </div>
        </div>
      )}

      {!unlocked && potential > 0 && (
        <div className="card etaline">
          <span className="muted">Bank {eur(potential)}/day and you unlock</span>
          <strong>{state.goal.name}</strong>
          <span className="muted">
            around <strong style={{ color: 'var(--accent)' }}>{etaDate}</strong>
          </span>
        </div>
      )}

      {/* Check-in CTA */}
      <button className="btn primary block lg" onClick={() => go('checkin')}>
        {answeredToday > 0
          ? `Continue today's check-in (${answeredToday} logged)`
          : "Start today's check-in"}
      </button>
    </div>
  )
}
