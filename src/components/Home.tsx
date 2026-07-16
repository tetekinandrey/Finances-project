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
        })
      : null

  return (
    <div className="fade-in stack">
      {/* Goal hero — compact banner */}
      <div className="goal-hero compact">
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

      {/* Progress + vault + ETA — one combined card */}
      <div className="card progress-compact">
        <ProgressRing progress={pct} size={128} stroke={11}>
          <div className="ring-amount sm">{eur(bal)}</div>
          <div className="muted" style={{ fontSize: 11 }}>
            {(pct * 100).toFixed(0)}%
          </div>
        </ProgressRing>
        <div className="progress-compact-info">
          {unlocked ? (
            <div className="unlocked-banner">🎉 Goal reached — unlocked!</div>
          ) : (
            <>
              <div className="row between">
                <span className="muted">Still to go</span>
                <strong>{eur(rem)}</strong>
              </div>
              <div className="row between">
                <span className="muted" style={{ whiteSpace: 'nowrap' }}>
                  🔒 Vault
                </span>
                <span className="faint">Locked</span>
              </div>
              {potential > 0 && etaDate && (
                <div className="row between">
                  <span className="muted">Unlock ~</span>
                  <strong style={{ color: 'var(--accent)' }}>{etaDate}</strong>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Estimates — compact tiles */}
      {!unlocked && (
        <div className="stat-grid">
          {coffee && (
            <div className="card stat compact">
              <div className="stat-num">{est.skipsToGoal(coffee)}</div>
              <div className="stat-label">{coffee.emoji} coffees to skip</div>
            </div>
          )}
          <div className="card stat compact">
            <div className="stat-num">
              {est.daysAtPotential ?? '—'}
              <span className="stat-unit">days</span>
            </div>
            <div className="stat-label">at your best pace</div>
          </div>
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
