import { useState } from 'react'
import { useStore } from '../store'
import {
  addDays,
  balance,
  dailyPotential,
  estimates,
  eur,
  isUnlocked,
} from '../logic'

export default function Home({ go }: { go: (tab: string) => void }) {
  const { state, today } = useStore()
  const [showDetails, setShowDetails] = useState(false)
  const bal = balance(state)
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
      {/* Goal title on top */}
      <div className="goal-title">
        <div className="ring-goal-label">🎯 Saving for</div>
        <h1>{state.goal.name}</h1>
      </div>

      {/* Saved amount */}
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
      </div>

      {/* Coffees to skip until the goal */}
      {!unlocked && coffee && (
        <div className="card coffee-goal">
          <span className="coffee-goal-num">{est.skipsToGoal(coffee)}</span>
          <span className="coffee-goal-label">
            {coffee.emoji} coffees to skip to reach {state.goal.name}
          </span>
        </div>
      )}

      {/* Collapsible estimates */}
      {!unlocked && (
        <div className="card details">
          <button
            className="details-head"
            onClick={() => setShowDetails((s) => !s)}
            aria-expanded={showDetails}
          >
            <span>Estimates</span>
            <span className={`chevron ${showDetails ? 'open' : ''}`}>⌄</span>
          </button>
          {showDetails && (
            <div className="details-body fade-in">
              <div className="row between details-eta" style={{ border: 'none', paddingTop: 0, marginTop: 0 }}>
                <span className="muted">At your best pace</span>
                <strong>{est.daysAtPotential ?? '—'} days</strong>
              </div>
              {potential > 0 && etaDate && (
                <div className="row between details-eta">
                  <span className="muted">Unlock around</span>
                  <strong style={{ color: 'var(--accent)' }}>{etaDate}</strong>
                </div>
              )}
            </div>
          )}
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
