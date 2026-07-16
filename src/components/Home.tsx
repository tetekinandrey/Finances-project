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
import { useTransfer } from '../useTransfer'

export default function Home({ go }: { go: (tab: string) => void }) {
  const { state, dispatch, today } = useStore()
  const send = useTransfer()
  const [showDetails, setShowDetails] = useState(false)
  const bal = balance(state)
  const unlocked = isUnlocked(state)
  const est = estimates(state)
  const potential = dailyPotential(state.habits)
  const coffee = state.habits.find((h) => h.id === 'coffee' && h.active)

  // The duel: the coffee habit (or the first active one) vs. the goal.
  const duelHabit = coffee ?? state.habits.find((h) => h.active)
  const todayEntry = state.entries.find((e) => e.date === today)
  const duelAnswer = duelHabit
    ? todayEntry?.actions.find((a) => a.habitId === duelHabit.id)
    : undefined

  const chooseGoal = () => {
    if (!duelHabit) return
    dispatch({
      type: 'RECORD',
      date: today,
      action: { habitId: duelHabit.id, result: 'saved', amount: duelHabit.value },
    })
    send(duelHabit.value, duelHabit.id)?.catch((e) =>
      console.warn('Vault transfer failed:', e),
    )
  }

  const chooseHabit = () => {
    if (!duelHabit) return
    dispatch({
      type: 'RECORD',
      date: today,
      action: {
        habitId: duelHabit.id,
        result: 'indulged',
        amount: state.penalizeIndulgence ? -duelHabit.value : 0,
      },
    })
  }

  const undoDuel = () =>
    duelHabit &&
    dispatch({ type: 'CLEAR_DAY_HABIT', date: today, habitId: duelHabit.id })

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

      {/* Playful daily duel: the habit vs. the goal */}
      {!unlocked && duelHabit && (
        <div className="card duel">
          {duelAnswer ? (
            <div className="duel-result fade-in">
              {duelAnswer.result === 'saved' ? (
                <>
                  <div className="duel-result-emoji">{state.goal.emoji}</div>
                  <div className="duel-result-text">
                    You picked <strong>{state.goal.name}</strong> — banked{' '}
                    <strong style={{ color: 'var(--accent)' }}>
                      {eur(duelHabit.value)}
                    </strong>
                  </div>
                </>
              ) : (
                <>
                  <div className="duel-result-emoji">{duelHabit.emoji}</div>
                  <div className="duel-result-text">
                    Enjoy your {duelHabit.name.toLowerCase()} — no guilt 💚
                  </div>
                </>
              )}
              <button className="btn ghost" onClick={undoDuel}>
                Undo
              </button>
            </div>
          ) : (
            <>
              <div className="duel-q">
                {duelHabit.emoji} {duelHabit.name} or {state.goal.emoji}{' '}
                {state.goal.name}?
              </div>
              <div className="duel-row">
                <button className="duel-opt habit" onClick={chooseHabit}>
                  <span className="duel-opt-emoji">{duelHabit.emoji}</span>
                  <span className="duel-opt-name">{duelHabit.name}</span>
                  <span className="duel-opt-sub">treat myself</span>
                </button>
                <span className="duel-vs">or</span>
                <button className="duel-opt goal" onClick={chooseGoal}>
                  <span className="duel-opt-emoji">{state.goal.emoji}</span>
                  <span className="duel-opt-name">{state.goal.name}</span>
                  <span className="duel-opt-sub">+{eur(duelHabit.value)}</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <button className="btn ghost block" onClick={() => go('checkin')}>
        Log the rest of today →
      </button>
    </div>
  )
}
