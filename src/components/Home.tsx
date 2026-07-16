import { useState } from 'react'
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
import { CheckInSection } from './CheckIn'

export default function Home() {
  const { state, today } = useStore()
  const [showDetails, setShowDetails] = useState(false)
  const bal = balance(state)
  const pct = progress(state)
  const rem = remaining(state)
  const unlocked = isUnlocked(state)
  const est = estimates(state)
  const potential = dailyPotential(state.habits)
  const coffee = state.habits.find((h) => h.id === 'coffee' && h.active)

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
      {/* Goal hero — compact image banner */}
      <div className="goal-hero compact">
        {state.goal.imageUrl ? (
          <img src={state.goal.imageUrl} alt={state.goal.name} />
        ) : (
          <div className="goal-hero-emoji">{state.goal.emoji}</div>
        )}
      </div>

      {/* Progress ring with balance inside, goal info below */}
      <div className="card ring-card">
        <ProgressRing progress={pct} size={190} stroke={13}>
          <div className="ring-amount">{eur(bal)}</div>
          <div className="muted" style={{ fontSize: 12 }}>
            {(pct * 100).toFixed(1)}% saved
          </div>
          {unlocked ? (
            <div className="ring-sub" style={{ color: 'var(--accent)' }}>
              🎉 unlocked!
            </div>
          ) : (
            <div className="ring-sub">{eur(rem)} to go</div>
          )}
        </ProgressRing>
        <div className="ring-goal">
          <div className="ring-goal-label">🎯 Saving for</div>
          <div className="ring-goal-name">{state.goal.name}</div>
          <div className="muted">{eur(state.goal.targetPrice)}</div>
        </div>
      </div>

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
              <div className="stat-grid">
                {coffee && (
                  <div className="stat compact bare">
                    <div className="stat-num">{est.skipsToGoal(coffee)}</div>
                    <div className="stat-label">
                      {coffee.emoji} coffees to skip
                    </div>
                  </div>
                )}
                <div className="stat compact bare">
                  <div className="stat-num">
                    {est.daysAtPotential ?? '—'}
                    <span className="stat-unit">days</span>
                  </div>
                  <div className="stat-label">at your best pace</div>
                </div>
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

      {/* Today's check-in, embedded */}
      <div className="section-title">Today&rsquo;s check-in</div>
      <CheckInSection />
    </div>
  )
}
